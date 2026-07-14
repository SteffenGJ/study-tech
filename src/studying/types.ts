export interface FlashcardSide {
  text: string
  imageUrl?: string
}

export interface Flashcard {
  subject: string
  topic: string
  question: FlashcardSide
  answer: FlashcardSide
}

export interface AddFlashcardCommand {
  subject: string
  topic: string
  question: string
  answer: string
}

export interface AddFlashcardOptions {
  simulateFailure?: boolean
}
