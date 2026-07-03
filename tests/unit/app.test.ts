import { createAppMarkup } from '../../src/app'

describe('createAppMarkup', () => {
  it('renders the app heading', () => {
    expect(createAppMarkup()).toContain('<h1>Study Tech</h1>')
  })
})
