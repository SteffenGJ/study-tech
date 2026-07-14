import { FlashcardService } from '../../../src/studying/flashcardService'

describe('FlashcardService', () => {
  it('should add flashcards and reports success', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built the pyramids?',
      answer: 'The egyptians',
    })

    expect(service.wasLastAddSuccessful()).toBe(true)
    expect(service.hasFlashcardInTopic('Ancient Egypt')).toBe(true)
    expect(service.getLastMessage().toLowerCase()).toContain('success')
  })

  it('should not persist cards when failure is simulated', () => {
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
    expect(service.hasFlashcardInTopic('Ancient Egypt')).toBe(false)
    expect(service.getFlashcards()).toHaveLength(0)
  })

  it('should parse image URLs from question and answer content', () => {
    const service = new FlashcardService()

    service.addFlashcard({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      answer: 'The egyptians IMAGE_URL(https://img.test/a.jpg)',
    })

    expect(service.getFlashcards()[0]).toEqual({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: {
        text: 'Who built these monuments?',
        imageUrl: 'https://img.test/q.jpg',
      },
      answer: {
        text: 'The egyptians',
        imageUrl: 'https://img.test/a.jpg',
      },
    })
  })

  it('should filter flashcards by subject', () => {
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

    expect(service.getFlashcardsBySubject('History')).toHaveLength(1)
    expect(service.getFlashcardsBySubject('History')[0].topic).toBe('Ancient Egypt')
  })
})
