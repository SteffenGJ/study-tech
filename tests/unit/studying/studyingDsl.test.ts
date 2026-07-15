import Studying from '../../acceptance/dsl/studying'

describe('Studying DSL', () => {
  it('should parse fields and call driver to add a flashcard', async () => {
    const driver = {
      goToFlashcards: jest.fn(),
      addFlashcard: jest.fn(),
      assertFlashcardAddedTo: jest.fn(),
      assertSuccess: jest.fn(),
      assertFlashcardNotAdded: jest.fn(),
      assertUserInformedOfError: jest.fn(),
      selectBySubject: jest.fn(),
      assertCurrentFlashcardsAre: jest.fn(),
      close: jest.fn(),
    }

    const studying = new Studying(Promise.resolve(driver))

    await studying.goToFlashcards()
    await studying.addFlashcard(
      'subject: History',
      'topic: Ancient Egypt',
      'question: Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      'answer: The egyptians',
    )
    await studying.assertFlashcardAddedTo('topic: Ancient Egypt')

    expect(driver.goToFlashcards).toHaveBeenCalledTimes(1)
    expect(driver.addFlashcard).toHaveBeenCalledWith({
      subject: 'History',
      topic: 'Ancient Egypt',
      question: 'Who built these monuments? IMAGE_URL(https://img.test/q.jpg)',
      answer: 'The egyptians',
    })
    expect(driver.assertFlashcardAddedTo).toHaveBeenCalledWith('Ancient Egypt')
  })

  it('should simulate a failed add operation', async () => {
    const driver = {
      goToFlashcards: jest.fn(),
      addFlashcard: jest.fn(),
      assertFlashcardAddedTo: jest.fn(),
      assertSuccess: jest.fn(),
      assertFlashcardNotAdded: jest.fn(),
      assertUserInformedOfError: jest.fn(),
      selectBySubject: jest.fn(),
      assertCurrentFlashcardsAre: jest.fn(),
      close: jest.fn(),
    }

    const studying = new Studying(Promise.resolve(driver))

    await studying.tryAddFlashcard(
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

  it('should select flashcards by subject and assert current list', async () => {
    const driver = {
      goToFlashcards: jest.fn(),
      addFlashcard: jest.fn(),
      assertFlashcardAddedTo: jest.fn(),
      assertSuccess: jest.fn(),
      assertFlashcardNotAdded: jest.fn(),
      assertUserInformedOfError: jest.fn(),
      selectBySubject: jest.fn(),
      assertCurrentFlashcardsAre: jest.fn(),
      close: jest.fn(),
    }

    const studying = new Studying(Promise.resolve(driver))

    await studying.selectBySubject('subject: History')
    await studying.assertCurrentFlashcardsAre('subject: History')

    expect(driver.selectBySubject).toHaveBeenCalledWith('History')
    expect(driver.assertCurrentFlashcardsAre).toHaveBeenCalledWith('History')
  })
})
