import Studying from "./dsl/studying"

const studying = new Studying()


describe("Studying", () => {
    describe("Adding flashcards", () => {

        test("should add flashcard to topic", () => {
            studying.goToFlashcards()
            studying.addFlashcard("subject: History", "topic: Ancient Egypt", "question: Who build the pyramids?", "answer: The egyptians")
            studying.assertFlashcardAddedTo("topic: Ancient Egypt")
        })

        test("should inform user that flashcard was added succesfully", () => {
            studying.goToFlashcards()
            studying.addFlashcard("subject: History", "topic: Ancient Egypt", "question: Who build the pyramids?", "answer: The egyptians")
            studying.assertFlashcardAddedTo("topic: Ancient Egypt")
            studying.assertUserInformedOfSucces()
        })

        test("should inform user if error occurs while adding flashcard", () => {
            studying.goToFlashcards()
            studying.tryAddFlashcard("subject: History", "topic: Ancient Egypt", "question: Who build the pyramids?", "answer: The egyptians")
            studying.assertFlashcardNotAdded()
            studying.assertUserInformedOfError()
        })

        test("should be able to add images to questions", () => {
            studying.goToFlashcards()
            studying.addFlashcard("subject: History", "topic: Ancient Egypt", "question: Who build these monuments? IMAGE_URL(https://www.somephoto.com/of-pyramids.jpg)", "answer: The egyptians")
            studying.assertFlashcardAddedTo("topic: Ancient Egypt")
        })

        test("should be able to add images to answers", () => {
            studying.goToFlashcards()
            studying.addFlashcard("subject: History", "topic: Ancient Egypt", "question: Who build these monuments?", "answer: The egyptians IMAGE_URL(https://www.somephoto.com/of-pyramids.jpg)")
            studying.assertFlashcardAddedTo("topic: Ancient Egypt")
        })

    })

    describe("Using flashcards", () => {
        test("should be able to filter flashcards by subject", () => {
            studying.goToFlashcards()
            studying.selectBySubject("subject: History")
            studying.assertCurrentFlashcardsAre("subject: History")
        })
    })

})