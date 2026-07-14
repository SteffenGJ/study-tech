import Studying from '../../acceptance/dsl/studying'

describe('Studying DSL', () => {
  it('should parse fields and call driver to add a flashcard', () => {
    const driver = {
      goToFlashcards: jest.fn(),
      addFlashcard: jest.fn(),
      assertFlashcardAddedTo: jest.fn(),
      assertSuccess: jest.fn(),
      assertFlashcardNotAdded: jest.fn(),
      assertUserInformedOfError: jest.fn(),
    }

    const studying = new Studying(driver)

    studying.goToFlashcards()
    studying.addFlashcard(
      'subject: History',
      'topic: Ancient Egypt',
      'question: Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      'answer: The egyptians',
    )
    studying.assertFlashcardAddedTo('topic: Ancient Egypt')

    expect(driver.goToFlashcards).toHaveBeenCalledTimes(1)
    expect(driver.addFlashcard).toHaveBeenCalledWith({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      answer: 'The egyptians',
    })
    expect(driver.assertFlashcardAddedTo).toHaveBeenCalledWith('Ancient Egypt')
  })

  it('should simulate a failed add operation', () => {
    const driver = {
      goToFlashcards: jest.fn(),
      addFlashcard: jest.fn(),
      assertFlashcardAddedTo: jest.fn(),
      assertSuccess: jest.fn(),
      assertFlashcardNotAdded: jest.fn(),
      assertUserInformedOfError: jest.fn(),
    }

    const studying = new Studying(driver)

    studying.tryAddFlashcard(
      'subject: History',
      'topic: Ancient Egypt',
      'question: Who built the pyramids?',
      'answer: The egyptians',
    )

    expect(driver.addFlashcard).toHaveBeenCalledWith(
      {
        subject: 'History',
        topic: 'Ancient Egypt',
        question: 'Who built the pyramids?',
        answer: 'The egyptians',
      },
      { simulateFailure: true },
    )
  })
})
