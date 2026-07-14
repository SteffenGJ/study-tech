import {
  createAppMarkup,
  renderFlashcardListMarkup,
  renderFlashcardListForSubject,
  submitFlashcard,
  toFlashcardCommand,
  SUCCESS_BANNER_DURATION_MS,
  type AddFlashcardFormValues,
} from '../../src/app'
import { FlashcardService } from '../../src/studying/flashcardService'

function validValues(overrides: Partial<AddFlashcardFormValues> = {}): AddFlashcardFormValues {
  return {
    subject: 'History',
    topic: 'Ancient Egypt',
    question: 'Who built the pyramids?',
    answer: 'The egyptians',
    ...overrides,
  }
}

describe('app', () => {
  it('should render the app heading', () => {
    expect(createAppMarkup()).toContain('<h1>Study Tech</h1>')
  })

  it('should hide the add flashcard form by default', () => {
    const markup = createAppMarkup()

    expect(markup).toContain('data-testid="composer"')
    expect(markup).toContain('composer is-hidden')
  })

  it('should render subject filter controls with apply and reset buttons', () => {
    const markup = createAppMarkup()

    expect(markup).toContain('data-testid="subject-filter"')
    expect(markup).toContain('data-testid="apply-subject-filter-button"')
    expect(markup).toContain('data-testid="reset-subject-filter-button"')
  })

  it('should not show any simulate error option in the ui', () => {
    expect(createAppMarkup()).not.toContain('Simulate save error')
  })

  it('should use a 3 second success banner duration', () => {
    expect(SUCCESS_BANNER_DURATION_MS).toBe(3000)
  })

  it('should trim form values before creating a command', () => {
    expect(
      toFlashcardCommand(
        validValues({
          subject: '  History ',
          topic: ' Ancient Egypt ',
          question: ' Who built the pyramids? ',
          answer: ' The egyptians ',
        }),
      ),
    ).toEqual({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })
  })

  it('should add a flashcard and return success feedback', () => {
    const service = new FlashcardService()

    const result = submitFlashcard(service, validValues())

    expect(result.feedback).toEqual({
      kind: 'success',
      message: 'Flashcard was added successfully',
    })
    expect(result.flashcards).toHaveLength(1)
  })

  it('should return an error when required values are missing', () => {
    const service = new FlashcardService()

    const result = submitFlashcard(service, validValues({ subject: '   ' }))

    expect(result.feedback).toEqual({
      kind: 'error',
      message: 'Subject is required',
    })
    expect(result.flashcards).toHaveLength(0)
  })

  it('should render an empty-state message when there are no flashcards', () => {
    expect(renderFlashcardListMarkup([])).toContain('No flashcards yet. Add your first one.')
  })

  it('should render flashcards including question and answer image urls', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      answer: 'The egyptians IMAGE_URL(https://img.test/a.jpg)',
    })

    const markup = renderFlashcardListMarkup(service.getFlashcards())

    expect(markup).toContain('History')
    expect(markup).toContain('Ancient Egypt')
    expect(markup).toContain('https://img.test/q.jpg')
    expect(markup).toContain('https://img.test/a.jpg')
  })

  it('should render only flashcards for selected subject', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })
    service.addFlashcard({
      subject: 'Science',
      topic: 'Physics',
      question: 'What is gravity?',
      answer: 'Attraction between masses',
    })

    const markup = renderFlashcardListForSubject(service.getFlashcards(), 'History')

    expect(markup).toContain('Ancient Egypt')
    expect(markup).not.toContain('Physics')
  })

  it('should render a filter empty-state when no flashcards match subject', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'Science',
      topic: 'Physics',
      question: 'What is gravity?',
      answer: 'Attraction between masses',
    })

    const markup = renderFlashcardListForSubject(service.getFlashcards(), 'History')

    expect(markup).toContain('No flashcards found for subject: History')
  })
})
