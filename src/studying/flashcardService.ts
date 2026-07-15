import { parseFlashcardSide } from './richTextParser'
import type {
  AddFlashcardCommand,
  AddFlashcardOptions,
  CertaintyLevel,
  EditFlashcardCommand,
  Flashcard,
  FlashcardFilter,
  PracticeOrder,
  PracticeSessionOptions,
} from './types'

interface LastMutationResult {
  success: boolean
  message: string
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

function hasIntersection(pool: string[], selected?: string[]): boolean {
  if (!selected || selected.length === 0) {
    return true
  }

  return pool.some((value) => selected.includes(value))
}

export class FlashcardService {
  private flashcards: Flashcard[] = []
  private lastMutationResult: LastMutationResult = {
    success: false,
    message: 'No flashcard submission has been made yet',
  }
  private idCounter = 0

  addFlashcard(command: AddFlashcardCommand, options: AddFlashcardOptions = {}): void {
    if (options.simulateFailure) {
      this.lastMutationResult = {
        success: false,
        message: 'Could not save flashcard',
      }

      return
    }

    const flashcard: Flashcard = {
      id: `flashcard-${++this.idCounter}`,
      subject: command.subject,
      topic: command.topic,
      question: parseFlashcardSide(command.question),
      answer: parseFlashcardSide(command.answer),
      certainty: 'medium',
      createdAt: Date.now(),
    }

    this.flashcards.push(flashcard)

    this.lastMutationResult = {
      success: true,
      message: 'Flashcard was added successfully',
    }
  }

  editFlashcard(command: EditFlashcardCommand): void {
    const index = this.flashcards.findIndex((flashcard) => flashcard.id === command.id)

    if (index === -1) {
      this.lastMutationResult = {
        success: false,
        message: 'Could not update flashcard',
      }

      return
    }

    const current = this.flashcards[index]

    this.flashcards[index] = {
      ...current,
      subject: command.subject,
      topic: command.topic,
      question: parseFlashcardSide(command.question),
      answer: parseFlashcardSide(command.answer),
    }

    this.lastMutationResult = {
      success: true,
      message: 'Flashcard was updated successfully',
    }
  }

  updateCertainty(id: string, certainty: CertaintyLevel): void {
    const flashcard = this.flashcards.find((item) => item.id === id)

    if (!flashcard) {
      this.lastMutationResult = {
        success: false,
        message: 'Could not set certainty',
      }

      return
    }

    flashcard.certainty = certainty

    this.lastMutationResult = {
      success: true,
      message: 'Certainty was updated successfully',
    }
  }

  getFlashcards(): Flashcard[] {
    return [...this.flashcards]
  }

  getFlashcardsBySubject(subject: string): Flashcard[] {
    return this.flashcards.filter((flashcard) => flashcard.subject === subject)
  }

  getAvailableSubjects(): string[] {
    return unique(this.flashcards.map((flashcard) => flashcard.subject))
  }

  getAvailableTopics(): string[] {
    return unique(this.flashcards.map((flashcard) => flashcard.topic))
  }

  getPracticeCards(options: PracticeSessionOptions = {}): Flashcard[] {
    const filtered = this.applyFilter(this.flashcards, options.filter)

    return this.applyOrder(filtered, options.order)
  }

  hasFlashcardInTopic(topic: string): boolean {
    return this.flashcards.some((flashcard) => flashcard.topic === topic)
  }

  wasLastAddSuccessful(): boolean {
    return this.lastMutationResult.success
  }

  wasLastAddRejected(): boolean {
    return !this.lastMutationResult.success
  }

  getLastMessage(): string {
    return this.lastMutationResult.message
  }

  private applyFilter(flashcards: Flashcard[], filter?: FlashcardFilter): Flashcard[] {
    if (!filter) {
      return [...flashcards]
    }

    return flashcards.filter((flashcard) => {
      const subjects = filter.subjects ?? []
      const topics = filter.topics ?? []
      const certainties = filter.certainties ?? []

      const subjectMatch = subjects.length === 0 || subjects.includes(flashcard.subject)
      const topicMatch = topics.length === 0 || topics.includes(flashcard.topic)
      const certaintyMatch = certainties.length === 0 || certainties.includes(flashcard.certainty)

      return subjectMatch && topicMatch && certaintyMatch
    })
  }

  private applyOrder(flashcards: Flashcard[], order: PracticeOrder = 'created-asc'): Flashcard[] {
    const copy = [...flashcards]

    switch (order) {
      case 'created-desc':
        return copy.sort((a, b) => b.createdAt - a.createdAt)
      case 'subject':
        return copy.sort((a, b) => a.subject.localeCompare(b.subject))
      case 'topic':
        return copy.sort((a, b) => a.topic.localeCompare(b.topic))
      case 'certainty-asc':
        return copy.sort((a, b) => this.certaintyWeight(a.certainty) - this.certaintyWeight(b.certainty))
      case 'certainty-desc':
        return copy.sort((a, b) => this.certaintyWeight(b.certainty) - this.certaintyWeight(a.certainty))
      case 'random':
        return copy.sort(() => Math.random() - 0.5)
      case 'created-asc':
      default:
        return copy.sort((a, b) => a.createdAt - b.createdAt)
    }
  }

  private certaintyWeight(certainty: CertaintyLevel): number {
    if (certainty === 'low') {
      return 1
    }

    if (certainty === 'medium') {
      return 2
    }

    return 3
  }
}
