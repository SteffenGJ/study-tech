import { createAppMarkup } from '../../src/app'

describe('app', () => {
  it('loads the home page', () => {
    expect(createAppMarkup()).toContain('<h1>Study Tech</h1>')
  })
})
