import Studying from "./dsl/studying"

const studying = new Studying()


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

})