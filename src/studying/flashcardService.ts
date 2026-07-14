import { parseFlashcardSide } from './richTextParser'
import type { AddFlashcardCommand, AddFlashcardOptions, Flashcard } from './types'

interface LastAddResult {
  success: boolean
  message: string
  topic?: string
}

export class FlashcardService {
  private flashcards: Flashcard[] = []
  private lastAddResult: LastAddResult = {
    success: false,
    message: 'No flashcard submission has been made yet',
  }

  addFlashcard(command: AddFlashcardCommand, options: AddFlashcardOptions = {}): void {
    if (options.simulateFailure) {
      this.lastAddResult = {
        success: false,
        message: 'Could not save flashcard',
        topic: command.topic,
      }

      return
    }

    this.flashcards.push({
      subject: command.subject,
      topic: command.topic,
      question: parseFlashcardSide(command.question),
      answer: parseFlashcardSide(command.answer),
    })

    this.lastAddResult = {
      success: true,
      message: 'Flashcard was added successfully',
      topic: command.topic,
    }
  }

  hasFlashcardInTopic(topic: string): boolean {
    return this.flashcards.some((flashcard) => flashcard.topic === topic)
  }

  getFlashcards(): Flashcard[] {
    return [...this.flashcards]
  }

  getFlashcardsBySubject(subject: string): Flashcard[] {
    return this.flashcards.filter((flashcard) => flashcard.subject === subject)
  }

  wasLastAddSuccessful(): boolean {
    return this.lastAddResult.success
  }

  wasLastAddRejected(): boolean {
    return !this.lastAddResult.success
  }

  getLastMessage(): string {
    return this.lastAddResult.message
  }

  getLastTopic(): string | undefined {
    return this.lastAddResult.topic
  }
}
