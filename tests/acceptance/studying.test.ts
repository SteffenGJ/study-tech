import Studying from './dsl/studying'

jest.setTimeout(30000)

describe('Studying', () => {
  const studying = new Studying()

  afterAll(async () => {
    await studying.destroy()
  })

  describe('Adding flashcards', () => {
    test('should add flashcard to topic', async () => {
      await studying.goToFlashcards()
      await studying.addFlashcard('subject: History', 'topic: Ancient Egypt', 'question: Who build the pyramids?', 'answer: The egyptians')
      await studying.assertFlashcardAddedTo('topic: Ancient Egypt')
    })

    test('should inform user that flashcard was added succesfully', async () => {
      await studying.goToFlashcards()
      await studying.addFlashcard('subject: History', 'topic: Ancient Egypt', 'question: Who build the pyramids?', 'answer: The egyptians')
      await studying.assertUserInformedOfSucces()
    })

    test('should be able to add images to questions', async () => {
      await studying.goToFlashcards()
      await studying.addFlashcard(
        'subject: History',
        'topic: Ancient Egypt',
        'question: Who build these monuments? IMAGE_URL(https://www.somephoto.com/of-pyramids.jpg)',
        'answer: The egyptians',
      )
      await studying.assertFlashcardAddedTo('topic: Ancient Egypt')
    })

    test('should be able to add images to answers', async () => {
      await studying.goToFlashcards()
      await studying.addFlashcard(
        'subject: History',
        'topic: Ancient Egypt',
        'question: Who build these monuments?',
        'answer: The egyptians IMAGE_URL(https://www.somephoto.com/of-pyramids.jpg)',
      )
      await studying.assertFlashcardAddedTo('topic: Ancient Egypt')
    })
  })

  describe('Using flashcards', () => {
    test('should be able to filter flashcards by subject', async () => {
      await studying.goToFlashcards()
      await studying.addFlashcard('subject: History', 'topic: Ancient Egypt', 'question: Who build the pyramids?', 'answer: The egyptians')
      await studying.selectBySubject('subject: History')
      await studying.assertCurrentFlashcardsAre('subject: History')
    })
  })
})
