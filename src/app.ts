import { FlashcardService } from './studying/flashcardService'
import type {
  AddFlashcardCommand,
  CertaintyLevel,
  EditFlashcardCommand,
  Flashcard,
  PracticeOrder,
} from './studying/types'

export interface AddFlashcardFormValues {
  subject: string
  topic: string
  question: string
  answer: string
}

export interface EditFlashcardFormValues extends AddFlashcardFormValues {
  id: string
}

interface Feedback {
  kind: 'success' | 'error'
  message: string
}

export const SUCCESS_BANNER_DURATION_MS = 3000

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderCardSide(title: string, side: Flashcard['question']): string {
  const imageMarkup = side.imageUrl
    ? `<img class="card-side-image" src="${escapeHtml(side.imageUrl)}" alt="${escapeHtml(title)} image" />`
    : ''

  return `
    <section class="card-side">
      <h4>${title}</h4>
      <p>${escapeHtml(side.text || '(empty)')}</p>
      ${imageMarkup}
    </section>
  `
}

function renderFlashcard(flashcard: Flashcard): string {
  return `
    <article class="flashcard" data-topic="${escapeHtml(flashcard.topic)}" data-id="${escapeHtml(flashcard.id)}">
      <header class="flashcard-header">
        <p class="chip">${escapeHtml(flashcard.subject)}</p>
        <p class="chip">${escapeHtml(flashcard.topic)}</p>
        <p class="chip certainty-${escapeHtml(flashcard.certainty)}">certainty: ${escapeHtml(flashcard.certainty)}</p>
      </header>
      <div class="flashcard-body">
        ${renderCardSide('Question', flashcard.question)}
        ${renderCardSide('Answer', flashcard.answer)}
      </div>
      <button class="secondary-button" type="button" data-testid="edit-${escapeHtml(flashcard.id)}">Edit</button>
    </article>
  `
}

export function renderFlashcardListMarkup(flashcards: Flashcard[]): string {
  if (flashcards.length === 0) {
    return '<p class="empty-state">No flashcards yet. Add your first one.</p>'
  }

  return flashcards.map((flashcard) => renderFlashcard(flashcard)).join('')
}

export function renderFlashcardListForSubject(flashcards: Flashcard[], subject: string): string {
  const selectedSubject = subject.trim()

  if (!selectedSubject) {
    return renderFlashcardListMarkup(flashcards)
  }

  const filteredFlashcards = flashcards.filter((flashcard) => flashcard.subject === selectedSubject)

  if (filteredFlashcards.length === 0) {
    return `<p class="empty-state">No flashcards found for subject: ${escapeHtml(selectedSubject)}</p>`
  }

  return renderFlashcardListMarkup(filteredFlashcards)
}

export function toFlashcardCommand(values: AddFlashcardFormValues): AddFlashcardCommand {
  return {
    subject: values.subject.trim(),
    topic: values.topic.trim(),
    question: values.question.trim(),
    answer: values.answer.trim(),
  }
}

function validateFormValues(values: AddFlashcardFormValues): string | undefined {
  if (!values.subject.trim()) {
    return 'Subject is required'
  }

  if (!values.topic.trim()) {
    return 'Topic is required'
  }

  if (!values.question.trim()) {
    return 'Question is required'
  }

  if (!values.answer.trim()) {
    return 'Answer is required'
  }

  return undefined
}

export function submitFlashcard(
  service: FlashcardService,
  values: AddFlashcardFormValues,
): { feedback: Feedback; flashcards: Flashcard[] } {
  const validationError = validateFormValues(values)

  if (validationError) {
    return {
      feedback: {
        kind: 'error',
        message: validationError,
      },
      flashcards: service.getFlashcards(),
    }
  }

  service.addFlashcard(toFlashcardCommand(values))

  if (service.wasLastAddRejected()) {
    return {
      feedback: {
        kind: 'error',
        message: service.getLastMessage(),
      },
      flashcards: service.getFlashcards(),
    }
  }

  return {
    feedback: {
      kind: 'success',
      message: service.getLastMessage(),
    },
    flashcards: service.getFlashcards(),
  }
}

function submitEditedFlashcard(
  service: FlashcardService,
  values: EditFlashcardFormValues,
): { feedback: Feedback; flashcards: Flashcard[] } {
  const validationError = validateFormValues(values)

  if (validationError) {
    return {
      feedback: {
        kind: 'error',
        message: validationError,
      },
      flashcards: service.getFlashcards(),
    }
  }

  const command: EditFlashcardCommand = {
    id: values.id,
    ...toFlashcardCommand(values),
  }

  service.editFlashcard(command)

  return {
    feedback: {
      kind: service.wasLastAddRejected() ? 'error' : 'success',
      message: service.getLastMessage(),
    },
    flashcards: service.getFlashcards(),
  }
}

export function createAppMarkup(): string {
  return `<main class="app-shell"><section class="app-panel"><header class="app-header"><p class="eyebrow">Study smarter</p><h1>Study Tech</h1><p class="lede">Create flashcards by subject and topic, then practice what matters.</p></header><section><div class="panel-actions"><h2>Flashcards</h2><button class="secondary-button" type="button" data-testid="open-composer-button" aria-expanded="false">Add flashcard</button></div><label>Filter by subject<div class="filter-controls"><input name="subject-filter" data-testid="subject-filter" placeholder="e.g. History" /><button type="button" class="secondary-button" data-testid="apply-subject-filter-button">Apply filter</button><button type="button" class="secondary-button" data-testid="reset-subject-filter-button">Reset filter</button></div></label><div class="flashcards" data-testid="flashcards"></div></section><section class="composer is-hidden" data-testid="composer"><h3>Add flashcard</h3><form data-testid="add-flashcard-form"><label>Subject<input name="subject" placeholder="History" /></label><label>Topic<input name="topic" placeholder="Ancient Egypt" /></label><label>Question<textarea name="question" rows="3" placeholder="Who built the pyramids?"></textarea></label><label>Answer<textarea name="answer" rows="3" placeholder="The Egyptians"></textarea></label><div class="composer-actions"><button class="primary-button" type="submit" data-testid="save-flashcard-button">Save flashcard</button><button class="secondary-button" type="button" data-testid="close-composer-button">Close</button></div></form><p class="feedback" data-testid="feedback"></p></section><section class="composer is-hidden" data-testid="edit-composer"><h3>Edit flashcard</h3><form data-testid="edit-flashcard-form"><input name="edit-id" type="hidden" /><label>Subject<input name="edit-subject" /></label><label>Topic<input name="edit-topic" /></label><label>Question<textarea name="edit-question" rows="3"></textarea></label><label>Answer<textarea name="edit-answer" rows="3"></textarea></label><div class="composer-actions"><button class="primary-button" type="submit" data-testid="save-edit-button">Save edit</button><button class="secondary-button" type="button" data-testid="cancel-edit-button">Cancel</button></div></form><p class="feedback" data-testid="edit-feedback"></p></section><section class="practice" data-testid="practice"><h3>Practice</h3><div class="practice-filters"><input data-testid="practice-subjects" placeholder="Subjects (comma separated)" /><input data-testid="practice-topics" placeholder="Topics (comma separated)" /><select data-testid="practice-order"><option value="created-asc">Oldest first</option><option value="created-desc">Newest first</option><option value="random">Random</option><option value="subject">By subject</option><option value="topic">By topic</option><option value="certainty-asc">Lowest certainty first</option><option value="certainty-desc">Highest certainty first</option></select><div><label><input type="checkbox" data-testid="certainty-low" checked /> low</label><label><input type="checkbox" data-testid="certainty-medium" checked /> medium</label><label><input type="checkbox" data-testid="certainty-high" checked /> high</label></div><button class="secondary-button" type="button" data-testid="start-practice-button">Start practice</button></div><div class="practice-card" data-testid="practice-card"><p class="empty-state">No practice cards match your filters.</p></div><div class="practice-actions"><button class="secondary-button" type="button" data-testid="reveal-answer-button">Reveal answer</button><button class="secondary-button" type="button" data-testid="next-practice-button">Next</button><button class="secondary-button" type="button" data-testid="certainty-low-button">Mark low certainty</button><button class="secondary-button" type="button" data-testid="certainty-medium-button">Mark medium certainty</button><button class="secondary-button" type="button" data-testid="certainty-high-button">Mark high certainty</button></div></section><section class="banner" data-testid="success-banner" aria-hidden="true" role="status"></section></section></main>`
}

function parseCsvValues(raw: string): string[] {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

function setupPracticeInteractions(
  root: HTMLElement,
  service: FlashcardService,
  onFlashcardsChanged: () => void,
): void {
  const practiceCard = root.querySelector<HTMLElement>('[data-testid="practice-card"]')
  const subjectInput = root.querySelector<HTMLInputElement>('[data-testid="practice-subjects"]')
  const topicInput = root.querySelector<HTMLInputElement>('[data-testid="practice-topics"]')
  const orderSelect = root.querySelector<HTMLSelectElement>('[data-testid="practice-order"]')
  const certaintyLow = root.querySelector<HTMLInputElement>('[data-testid="certainty-low"]')
  const certaintyMedium = root.querySelector<HTMLInputElement>('[data-testid="certainty-medium"]')
  const certaintyHigh = root.querySelector<HTMLInputElement>('[data-testid="certainty-high"]')
  const startButton = root.querySelector<HTMLButtonElement>('[data-testid="start-practice-button"]')
  const revealButton = root.querySelector<HTMLButtonElement>('[data-testid="reveal-answer-button"]')
  const nextButton = root.querySelector<HTMLButtonElement>('[data-testid="next-practice-button"]')

  if (!practiceCard || !subjectInput || !topicInput || !orderSelect || !certaintyLow || !certaintyMedium || !certaintyHigh || !startButton || !revealButton || !nextButton) {
    return
  }

  let practiceCards: Flashcard[] = []
  let currentIndex = 0
  let answerRevealed = false

  const render = (): void => {
    const current = practiceCards[currentIndex]

    if (!current) {
      practiceCard.innerHTML = '<p class="empty-state">No practice cards match your filters.</p>'
      return
    }

    const answerMarkup = answerRevealed
      ? `<p data-testid="practice-answer">${escapeHtml(current.answer.text || '(empty)')}</p>`
      : '<p data-testid="practice-answer" class="muted">Answer hidden</p>'

    practiceCard.innerHTML = `
      <article data-testid="practice-item" data-id="${escapeHtml(current.id)}">
        <p class="chip">${escapeHtml(current.subject)} / ${escapeHtml(current.topic)}</p>
        <h4>${escapeHtml(current.question.text || '(empty)')}</h4>
        ${answerMarkup}
      </article>
    `
  }

  const loadCards = (): void => {
    const certainties: CertaintyLevel[] = []
    if (certaintyLow.checked) certainties.push('low')
    if (certaintyMedium.checked) certainties.push('medium')
    if (certaintyHigh.checked) certainties.push('high')

    practiceCards = service.getPracticeCards({
      order: orderSelect.value as PracticeOrder,
      filter: {
        subjects: parseCsvValues(subjectInput.value),
        topics: parseCsvValues(topicInput.value),
        certainties,
      },
    })
    currentIndex = 0
    answerRevealed = false
    render()
  }

  const setCertainty = (certainty: CertaintyLevel): void => {
    const current = practiceCards[currentIndex]
    if (!current) {
      return
    }

    service.updateCertainty(current.id, certainty)
    current.certainty = certainty
    onFlashcardsChanged()
    render()
  }

  startButton.addEventListener('click', () => loadCards())
  revealButton.addEventListener('click', () => {
    answerRevealed = true
    render()
  })
  nextButton.addEventListener('click', () => {
    if (practiceCards.length === 0) {
      return
    }

    currentIndex = (currentIndex + 1) % practiceCards.length
    answerRevealed = false
    render()
  })

  root.querySelector<HTMLButtonElement>('[data-testid="certainty-low-button"]')?.addEventListener('click', () => setCertainty('low'))
  root.querySelector<HTMLButtonElement>('[data-testid="certainty-medium-button"]')?.addEventListener('click', () => setCertainty('medium'))
  root.querySelector<HTMLButtonElement>('[data-testid="certainty-high-button"]')?.addEventListener('click', () => setCertainty('high'))
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = createAppMarkup()

  const service = new FlashcardService()

  const flashcardsContainer = root.querySelector<HTMLElement>('[data-testid="flashcards"]')
  const composer = root.querySelector<HTMLElement>('[data-testid="composer"]')
  const editComposer = root.querySelector<HTMLElement>('[data-testid="edit-composer"]')
  const openComposerButton = root.querySelector<HTMLButtonElement>('[data-testid="open-composer-button"]')
  const closeComposerButton = root.querySelector<HTMLButtonElement>('[data-testid="close-composer-button"]')
  const addForm = root.querySelector<HTMLFormElement>('[data-testid="add-flashcard-form"]')
  const editForm = root.querySelector<HTMLFormElement>('[data-testid="edit-flashcard-form"]')
  const feedback = root.querySelector<HTMLElement>('[data-testid="feedback"]')
  const editFeedback = root.querySelector<HTMLElement>('[data-testid="edit-feedback"]')
  const successBanner = root.querySelector<HTMLElement>('[data-testid="success-banner"]')

  const subjectFilterInput = root.querySelector<HTMLInputElement>('[data-testid="subject-filter"]')
  const applySubjectFilterButton = root.querySelector<HTMLButtonElement>('[data-testid="apply-subject-filter-button"]')
  const resetSubjectFilterButton = root.querySelector<HTMLButtonElement>('[data-testid="reset-subject-filter-button"]')

  if (!flashcardsContainer || !composer || !openComposerButton || !closeComposerButton || !addForm || !feedback || !successBanner || !subjectFilterInput || !applySubjectFilterButton || !resetSubjectFilterButton || !editComposer || !editForm || !editFeedback) {
    return
  }

  let successBannerTimeout: ReturnType<typeof setTimeout> | undefined

  const renderAllFlashcards = (subjectFilter: string = ''): void => {
    flashcardsContainer.innerHTML = renderFlashcardListForSubject(service.getFlashcards(), subjectFilter)

    service.getFlashcards().forEach((flashcard) => {
      const button = root.querySelector<HTMLButtonElement>(`[data-testid="edit-${flashcard.id}"]`)
      button?.addEventListener('click', () => {
        ;(editForm.elements.namedItem('edit-id') as HTMLInputElement).value = flashcard.id
        ;(editForm.elements.namedItem('edit-subject') as HTMLInputElement).value = flashcard.subject
        ;(editForm.elements.namedItem('edit-topic') as HTMLInputElement).value = flashcard.topic
        ;(editForm.elements.namedItem('edit-question') as HTMLTextAreaElement).value = flashcard.question.text
        ;(editForm.elements.namedItem('edit-answer') as HTMLTextAreaElement).value = flashcard.answer.text
        editComposer.classList.remove('is-hidden')
      })
    })
  }

  const setFeedback = (element: HTMLElement, value: Feedback): void => {
    element.textContent = value.message
    element.dataset.kind = value.kind
  }

  const setSuccessBanner = (feedbackValue: Feedback): void => {
    if (feedbackValue.kind !== 'success') {
      successBanner.textContent = ''
      successBanner.setAttribute('aria-hidden', 'true')
      return
    }

    successBanner.textContent = feedbackValue.message
    successBanner.setAttribute('aria-hidden', 'false')

    if (successBannerTimeout) {
      clearTimeout(successBannerTimeout)
    }

    successBannerTimeout = setTimeout(() => {
      successBanner.setAttribute('aria-hidden', 'true')
      successBanner.textContent = ''
    }, SUCCESS_BANNER_DURATION_MS)
  }

  openComposerButton.addEventListener('click', () => {
    composer.classList.remove('is-hidden')
    openComposerButton.setAttribute('aria-expanded', 'true')
  })

  closeComposerButton.addEventListener('click', () => {
    composer.classList.add('is-hidden')
    openComposerButton.setAttribute('aria-expanded', 'false')
  })

  addForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const result = submitFlashcard(service, {
      subject: (addForm.elements.namedItem('subject') as HTMLInputElement).value,
      topic: (addForm.elements.namedItem('topic') as HTMLInputElement).value,
      question: (addForm.elements.namedItem('question') as HTMLTextAreaElement).value,
      answer: (addForm.elements.namedItem('answer') as HTMLTextAreaElement).value,
    })

    setFeedback(feedback, result.feedback)
    setSuccessBanner(result.feedback)

    if (result.feedback.kind === 'success') {
      addForm.reset()
      composer.classList.add('is-hidden')
      openComposerButton.setAttribute('aria-expanded', 'false')
    }

    renderAllFlashcards(subjectFilterInput.value)
  })

  editForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const result = submitEditedFlashcard(service, {
      id: (editForm.elements.namedItem('edit-id') as HTMLInputElement).value,
      subject: (editForm.elements.namedItem('edit-subject') as HTMLInputElement).value,
      topic: (editForm.elements.namedItem('edit-topic') as HTMLInputElement).value,
      question: (editForm.elements.namedItem('edit-question') as HTMLTextAreaElement).value,
      answer: (editForm.elements.namedItem('edit-answer') as HTMLTextAreaElement).value,
    })

    setFeedback(editFeedback, result.feedback)
    setSuccessBanner(result.feedback)

    if (result.feedback.kind === 'success') {
      editComposer.classList.add('is-hidden')
    }

    renderAllFlashcards(subjectFilterInput.value)
  })

  root.querySelector<HTMLButtonElement>('[data-testid="cancel-edit-button"]')?.addEventListener('click', () => {
    editComposer.classList.add('is-hidden')
  })

  applySubjectFilterButton.addEventListener('click', () => {
    renderAllFlashcards(subjectFilterInput.value)
  })

  resetSubjectFilterButton.addEventListener('click', () => {
    subjectFilterInput.value = ''
    renderAllFlashcards()
  })

  renderAllFlashcards()
  setupPracticeInteractions(root, service, () => {
    renderAllFlashcards(subjectFilterInput.value)
  })
}
