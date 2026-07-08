import SeleniumProtocolDriver from "../support/seleniumProtocolDriver";

export default class Studying {

    private driver = new SeleniumProtocolDriver("http://127.0.0.1:5173")

    assertUserInformedOfError() {
        return this.driver.assertUserInformedOfError()
    }

    assertFlashcardNotAdded() {
        return this.driver.assertFlashcardNotAdded()
    }

    tryAddFlashcard(arg0: string, arg1: string, arg2: string, arg3: string) {
        return this.driver.addFlashcard()
    }

    assertUserInformedOfSucces() {
        throw new Error("Method not implemented.");
    }

    assertFlashcardAddedTo(arg0: string) {
        throw new Error("Method not implemented.");
    }

    addFlashcard(arg0: string, arg1: string, arg2: string, arg3: string) {
        throw new Error("Method not implemented.");
    }

    goToFlashcards() {
        throw new Error("Method not implemented.");
    }
    
}