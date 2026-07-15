import {
  SUCCESS_BANNER_DURATION_MS,
  createAppMarkup,
  renderFlashcardListForSubject,
  renderFlashcardListMarkup,
  submitFlashcard,
  toFlashcardCommand,
} from '../../src/app'
import { FlashcardService } from '../../src/studying/flashcardService'

describe('app', () => {
  test('should render empty state when no flashcards exist', () => {
    expect(renderFlashcardListMarkup([])).toContain('No flashcards yet')
  })

  test('should render cards for provided flashcards', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })

    const markup = renderFlashcardListMarkup(service.getFlashcards())

    expect(markup).toContain('History')
    expect(markup).toContain('Ancient Egypt')
  })

  test('should filter rendered cards by subject', () => {
    const service = new FlashcardService()

    service.addFlashcard({ subject: 'History', topic: 'Ancient Egypt', question: 'Q1', answer: 'A1' })
    service.addFlashcard({ subject: 'Math', topic: 'Algebra', question: 'Q2', answer: 'A2' })

    const markup = renderFlashcardListForSubject(service.getFlashcards(), 'Math')

    expect(markup).toContain('Algebra')
    expect(markup).not.toContain('Ancient Egypt')
  })

  test('should create normalized add command from form values', () => {
    expect(
      toFlashcardCommand({
        subject: ' History ',
        topic: ' Ancient Egypt ',
        question: ' Who built the pyramids? ',
        answer: ' The egyptians ',
      }),
    ).toEqual({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })
  })

  test('should return validation error when subject is missing', () => {
    const result = submitFlashcard(new FlashcardService(), {
      subject: '',
      topic: 'Ancient Egypt',
      question: 'Q',
      answer: 'A',
    })

    expect(result.feedback.kind).toBe('error')
    expect(result.feedback.message).toContain('Subject is required')
  })

  test('should return success feedback when flashcard is added', () => {
    const service = new FlashcardService()

    const result = submitFlashcard(service, {
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Q',
      answer: 'A',
    })

    expect(result.feedback.kind).toBe('success')
    expect(result.flashcards).toHaveLength(1)
  })

  test('should expose practice and edit sections in markup', () => {
    const markup = createAppMarkup()

    expect(markup).toContain('data-testid="practice"')
    expect(markup).toContain('data-testid="edit-composer"')
  })

  test('should keep success banner duration unchanged', () => {
    expect(SUCCESS_BANNER_DURATION_MS).toBe(3000)
  })
})
