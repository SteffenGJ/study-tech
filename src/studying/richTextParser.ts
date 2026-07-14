import type { FlashcardSide } from './types'

const IMAGE_TOKEN = /IMAGE_URL\((https?:\/\/[^)]+)\)/i

export function parseFlashcardSide(input: string): FlashcardSide {
  const trimmedInput = input.trim()
  const imageMatch = trimmedInput.match(IMAGE_TOKEN)

  if (!imageMatch) {
    return { text: trimmedInput }
  }

  const text = trimmedInput.replace(IMAGE_TOKEN, '').replace(/\s+/g, ' ').trim()

  return {
    text,
    imageUrl: imageMatch[1],
  }
}
