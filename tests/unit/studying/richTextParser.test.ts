import { parseFlashcardSide } from '../../../src/studying/richTextParser'

describe('parseFlashcardSide', () => {
  it('should keep plain text untouched', () => {
    expect(parseFlashcardSide('Who built the pyramids?')).toEqual({
      text: 'Who built the pyramids?',
    })
  })

  it('should extract IMAGE_URL tokens', () => {
    expect(parseFlashcardSide('The egyptians IMAGE_URL(https://img.test/pyramids.jpg)')).toEqual({
      text: 'The egyptians',
      imageUrl: 'https://img.test/pyramids.jpg',
    })
  })
})
