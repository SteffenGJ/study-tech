import { FlashcardService } from '../../../src/studying/flashcardService'

describe('FlashcardService', () => {
  test('should add flashcard to topic', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })

    expect(service.hasFlashcardInTopic('Ancient Egypt')).toBe(true)
  })

  test('should mark add as successful after successful submission', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })

    expect(service.wasLastAddSuccessful()).toBe(true)
    expect(service.getLastMessage().toLowerCase()).toContain('success')
  })

  test('should reject add when persistence fails', () => {
    const service = new FlashcardService()

    service.addFlashcard(
      {
        subject: 'History',
        topic: 'Ancient Egypt',
        question: 'Who built the pyramids?',
        answer: 'The egyptians',
      },
      { simulateFailure: true },
    )

    expect(service.wasLastAddRejected()).toBe(true)
    expect(service.getLastMessage().toLowerCase()).toContain('could not')
    expect(service.getFlashcards()).toHaveLength(0)
  })

  test('should parse image URLs from question and answer content', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      answer: 'The egyptians IMAGE_URL(https://img.test/a.jpg)',
    })

    const [flashcard] = service.getFlashcards()

    expect(flashcard.subject).toBe('History')
    expect(flashcard.topic).toBe('Ancient Egypt')
    expect(flashcard.question).toEqual({
      text: 'Who built these monuments?',
      imageUrl: 'https://img.test/q.jpg',
    })
    expect(flashcard.answer).toEqual({
      text: 'The egyptians',
      imageUrl: 'https://img.test/a.jpg',
    })
    expect(flashcard.certainty).toBe('medium')
    expect(typeof flashcard.id).toBe('string')
  })

  test('should edit existing flashcards', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })

    const [first] = service.getFlashcards()

    service.editFlashcard({
      id: first.id,
      subject: 'Geography',
      topic: 'Africa',
      question: 'Where is Egypt?',
      answer: 'North Africa',
    })

    const [updated] = service.getFlashcards()

    expect(updated.subject).toBe('Geography')
    expect(updated.topic).toBe('Africa')
    expect(updated.question.text).toBe('Where is Egypt?')
    expect(updated.answer.text).toBe('North Africa')
    expect(service.getLastMessage().toLowerCase()).toContain('updated')
  })

  test('should filter practice cards by subject topic and certainty', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Q1',
      answer: 'A1',
    })
    service.addFlashcard({
      subject: 'Math',
      topic: 'Algebra',
      question: 'Q2',
      answer: 'A2',
    })

    const [history] = service.getFlashcards()
    service.updateCertainty(history.id, 'low')

    const filtered = service.getPracticeCards({
      filter: {
        subjects: ['History'],
        topics: ['Ancient Egypt'],
        certainties: ['low'],
      },
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].subject).toBe('History')
  })
})
