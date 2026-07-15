export interface FlashcardSide {
  text: string
  imageUrl?: string
}

export type CertaintyLevel = 'low' | 'medium' | 'high'
export type PracticeOrder = 'created-asc' | 'created-desc' | 'random' | 'subject' | 'topic' | 'certainty-asc' | 'certainty-desc'

export interface Flashcard {
  id: string
  subject: string
  topic: string
  question: FlashcardSide
  answer: FlashcardSide
  certainty: CertaintyLevel
  createdAt: number
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

export interface EditFlashcardCommand {
  id: string
  subject: string
  topic: string
  question: string
  answer: string
}

export interface FlashcardFilter {
  subjects?: string[]
  topics?: string[]
  certainties?: CertaintyLevel[]
}

export interface PracticeSessionOptions {
  order?: PracticeOrder
  filter?: FlashcardFilter
}
