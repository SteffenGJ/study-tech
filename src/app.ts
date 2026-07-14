import { FlashcardService } from './studying/flashcardService'
import type { AddFlashcardCommand, Flashcard } from './studying/types'

export interface AddFlashcardFormValues {
  subject: string
  topic: string
  question: string
  answer: string
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
    <article class="flashcard" data-topic="${escapeHtml(flashcard.topic)}">
      <header class="flashcard-header">
        <p class="chip">${escapeHtml(flashcard.subject)}</p>
        <p class="chip">${escapeHtml(flashcard.topic)}</p>
      </header>
      <div class="flashcard-body">
        ${renderCardSide('Question', flashcard.question)}
        ${renderCardSide('Answer', flashcard.answer)}
      </div>
    </article>
  `
}

export function renderFlashcardListMarkup(flashcards: Flashcard[]): string {
  if (flashcards.length === 0) {
    return '<p class="empty-state">No flashcards yet. Add your first one.</p>'
  }

  return flashcards.map((flashcard) => renderFlashcard(flashcard)).join('')
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

export function createAppMarkup(): string {
  return `
    <main class="app-shell">
      <section class="app-panel">
        <header class="app-header">
          <p class="eyebrow">Study smarter</p>
          <h1>Study Tech</h1>
          <p class="lede">Create flashcards by subject and topic, then practice what matters.</p>
        </header>

        <section>
          <div class="panel-actions">
            <h2>Flashcards</h2>
            <button
              class="secondary-button"
              type="button"
              data-testid="open-composer-button"
              aria-expanded="false"
            >
              Add flashcard
            </button>
          </div>
          <div class="flashcards" data-testid="flashcards"></div>
        </section>

        <section class="composer is-hidden" data-testid="composer">
          <h3>Add a flashcard</h3>
          <form class="flashcard-form" data-testid="flashcard-form">
            <label>
              Subject
              <input name="subject" placeholder="History" required />
            </label>

            <label>
              Topic
              <input name="topic" placeholder="Ancient Egypt" required />
            </label>

            <label>
              Question
              <textarea name="question" rows="3" placeholder="Who built the pyramids?" required></textarea>
            </label>

            <label>
              Answer
              <textarea name="answer" rows="3" placeholder="The egyptians" required></textarea>
            </label>

            <button type="submit">Save flashcard</button>
          </form>
          <p class="feedback" data-testid="feedback" aria-live="polite"></p>
        </section>
      </section>

      <aside class="success-banner" data-testid="success-banner" aria-live="polite" aria-hidden="true"></aside>
    </main>
  `
}

export function mountApp(root: HTMLElement, service = new FlashcardService()): void {
  root.innerHTML = createAppMarkup()

  const form = root.querySelector<HTMLFormElement>('[data-testid="flashcard-form"]')
  const feedback = root.querySelector<HTMLParagraphElement>('[data-testid="feedback"]')
  const flashcardsContainer = root.querySelector<HTMLDivElement>('[data-testid="flashcards"]')
  const composer = root.querySelector<HTMLElement>('[data-testid="composer"]')
  const openComposerButton = root.querySelector<HTMLButtonElement>('[data-testid="open-composer-button"]')
  const successBanner = root.querySelector<HTMLElement>('[data-testid="success-banner"]')

  if (!form || !feedback || !flashcardsContainer || !composer || !openComposerButton || !successBanner) {
    throw new Error('Could not initialize Study Tech app')
  }

  let hideBannerTimer: ReturnType<typeof setTimeout> | undefined

  flashcardsContainer.innerHTML = renderFlashcardListMarkup(service.getFlashcards())

  openComposerButton.addEventListener('click', () => {
    const isHidden = composer.classList.toggle('is-hidden')

    openComposerButton.setAttribute('aria-expanded', String(!isHidden))
    if (!isHidden) {
      feedback.textContent = ''
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const result = submitFlashcard(service, {
      subject: String(formData.get('subject') ?? ''),
      topic: String(formData.get('topic') ?? ''),
      question: String(formData.get('question') ?? ''),
      answer: String(formData.get('answer') ?? ''),
    })

    flashcardsContainer.innerHTML = renderFlashcardListMarkup(result.flashcards)

    if (result.feedback.kind === 'error') {
      feedback.textContent = result.feedback.message
      return
    }

    feedback.textContent = ''
    form.reset()
    composer.classList.add('is-hidden')
    openComposerButton.setAttribute('aria-expanded', 'false')

    successBanner.textContent = `\u2713 ${result.feedback.message}`
    successBanner.classList.add('is-visible')
    successBanner.setAttribute('aria-hidden', 'false')

    if (hideBannerTimer) {
      clearTimeout(hideBannerTimer)
    }

    hideBannerTimer = setTimeout(() => {
      successBanner.classList.remove('is-visible')
      successBanner.setAttribute('aria-hidden', 'true')
    }, SUCCESS_BANNER_DURATION_MS)
  })
}
