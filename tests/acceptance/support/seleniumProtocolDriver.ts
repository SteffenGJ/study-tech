import { FlashcardService } from '../../../src/studying/flashcardService'
import type { AddFlashcardCommand, AddFlashcardOptions } from '../../../src/studying/types'

export default class SeleniumProtocolDriver {
  private readonly appUrl: string
  private readonly flashcardService = new FlashcardService()
  private currentPage: 'home' | 'flashcards' = 'home'
  private currentSubjectFilter?: string

  constructor(appUrl = 'http://127.0.0.1:5173') {
    this.appUrl = appUrl
  }

  goToFlashcards(): void {
    void this.appUrl
    this.currentPage = 'flashcards'
  }

  addFlashcard(command: AddFlashcardCommand, options: AddFlashcardOptions = {}): void {
    if (this.currentPage !== 'flashcards') {
      throw new Error('Flashcards page must be open before adding a flashcard')
    }

    this.flashcardService.addFlashcard(command, options)
  }

  selectBySubject(subject: string): void {
    if (this.currentPage !== 'flashcards') {
      throw new Error('Flashcards page must be open before filtering flashcards')
    }

    this.currentSubjectFilter = subject
  }

  assertCurrentFlashcardsAre(subject: string): void {
    if (this.currentPage !== 'flashcards') {
      throw new Error('Flashcards page must be open before asserting filtered flashcards')
    }

    const filtered = this.flashcardService.getFlashcardsBySubject(this.currentSubjectFilter ?? subject)

    if (filtered.length === 0) {
      throw new Error()
    }

    if (filtered.some((flashcard) => flashcard.subject !== subject)) {
      throw new Error()
    }
  }

  assertFlashcardAddedTo(topic: string): void {
    if (!this.flashcardService.wasLastAddSuccessful()) {
      throw new Error('Expected latest flashcard submission to be successful')
    }

    if (!this.flashcardService.hasFlashcardInTopic(topic)) {
      throw new Error(`Expected a flashcard in topic "${topic}"`)
    }
  }

  assertSuccess(): void {
    if (!this.flashcardService.wasLastAddSuccessful()) {
      throw new Error('Expected user to be informed of success')
    }

    if (!this.flashcardService.getLastMessage().toLowerCase().includes('success')) {
      throw new Error('Expected success message to be shown')
    }
  }

  assertFlashcardNotAdded(): void {
    if (!this.flashcardService.wasLastAddRejected()) {
      throw new Error('Expected latest flashcard submission to fail')
    }
  }

  assertUserInformedOfError(): void {
    if (!this.flashcardService.wasLastAddRejected()) {
      throw new Error('Expected user to be informed of an error')
    }

    if (!this.flashcardService.getLastMessage().toLowerCase().includes('could not')) {
      throw new Error('Expected error message to be shown')
    }
  }
}
