import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver'
import type { AddFlashcardCommand, AddFlashcardOptions } from '../../../src/studying/types'
import { appUrl, createDriver } from './driver'

const DEFAULT_TIMEOUT_MS = 10000

export default class SeleniumProtocolDriver {
  private constructor(private readonly driver: WebDriver) {}

  static async create(): Promise<SeleniumProtocolDriver> {
    const driver = await createDriver()

    return new SeleniumProtocolDriver(driver)
  }

  async close(): Promise<void> {
    try {
      await this.driver.quit()
    } catch {
      return
    }
  }

  async goToFlashcards(): Promise<void> {
    await this.driver.get(appUrl('/'))
    await this.findByTestId('open-composer-button')
    await this.waitForFlashcardsToRender()
  }

  async addFlashcard(command: AddFlashcardCommand, options: AddFlashcardOptions = {}): Promise<void> {
    if (options.simulateFailure) {
      throw new Error('UI-level failure simulation is not supported in Selenium acceptance tests')
    }

    const openComposerButton = await this.findByTestId('open-composer-button')

    await openComposerButton.click()

    const composer = await this.findByTestId('composer')
    await this.driver.wait(async () => {
      const classes = await composer.getAttribute('class')

      return !(classes ?? '').includes('is-hidden')
    }, DEFAULT_TIMEOUT_MS)

    await this.setField('subject', command.subject)
    await this.setField('topic', command.topic)
    await this.setField('question', command.question)
    await this.setField('answer', command.answer)

    const saveButton = await this.driver.findElement(By.css('[data-testid="flashcard-form"] button[type="submit"]'))

    await saveButton.click()
    await this.waitForSuccessBanner()
  }

  async selectBySubject(subject: string): Promise<void> {
    await this.setInputByTestId('subject-filter', subject)

    const applyButton = await this.findByTestId('apply-subject-filter-button')

    await applyButton.click()
  }

  async assertCurrentFlashcardsAre(subject: string): Promise<void> {
    await this.waitForFlashcardsToRender()

    const cards = await this.driver.findElements(By.css('[data-testid="flashcards"] .flashcard'))

    if (cards.length === 0) {
      throw new Error(`Expected flashcards to be visible for subject "${subject}"`)
    }

    for (const card of cards) {
      const chips = await card.findElements(By.css('.chip'))
      const chipTexts = await Promise.all(chips.map((chip) => chip.getText()))

      if (!chipTexts.includes(subject)) {
        throw new Error(`Found flashcard that does not match subject "${subject}"`)
      }
    }
  }

  async assertFlashcardAddedTo(topic: string): Promise<void> {
    await this.waitForFlashcardsToRender()

    const cards = await this.driver.findElements(By.css('[data-testid="flashcards"] .flashcard'))

    if (cards.length === 0) {
      throw new Error(`Expected at least one visible flashcard when looking for topic "${topic}"`)
    }

    for (const card of cards) {
      const chips = await card.findElements(By.css('.chip'))
      const chipTexts = await Promise.all(chips.map((chip) => chip.getText()))

      if (chipTexts.includes(topic)) {
        return
      }
    }

    throw new Error(`Expected a visible flashcard in topic "${topic}"`)
  }

  async assertSuccess(): Promise<void> {
    await this.waitForSuccessBanner()

    const banner = await this.findByTestId('success-banner')
    const message = (await banner.getText()).toLowerCase()

    if (!message.includes('success')) {
      throw new Error('Expected a visible success message in the UI')
    }
  }

  async assertFlashcardNotAdded(): Promise<void> {
    const banner = await this.findByTestId('success-banner')
    const hidden = await banner.getAttribute('aria-hidden')

    if (hidden !== 'true') {
      throw new Error('Expected no success banner when flashcard was not added')
    }
  }

  async assertUserInformedOfError(): Promise<void> {
    const feedback = await this.findByTestId('feedback')

    await this.driver.wait(async () => {
      const text = (await feedback.getText()).trim().toLowerCase()

      return text.length > 0
    }, DEFAULT_TIMEOUT_MS)

    const text = (await feedback.getText()).toLowerCase()

    if (!text.includes('required') && !text.includes('could not')) {
      throw new Error('Expected a visible UI error message')
    }
  }

  private async findByTestId(testId: string): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(By.css(`[data-testid="${testId}"]`)), DEFAULT_TIMEOUT_MS)
  }

  private async setField(name: string, value: string | undefined): Promise<void> {
    const element = await this.driver.findElement(By.css(`[name="${name}"]`))
    const safeValue = value ?? ''

    await element.clear()
    await element.sendKeys(safeValue)
  }

  private async setInputByTestId(testId: string, value: string): Promise<void> {
    const input = await this.findByTestId(testId)

    await input.clear()
    await input.sendKeys(value)
  }

  

  private async waitForFlashcardsToRender(): Promise<void> {
    const container = await this.findByTestId('flashcards')

    await this.driver.wait(async () => {
      const html = await container.getAttribute('innerHTML')

      return (html ?? '').trim().length > 0
    }, DEFAULT_TIMEOUT_MS)
  }

  private async waitForSuccessBanner(): Promise<void> {
    const banner = await this.findByTestId('success-banner')

    await this.driver.wait(async () => (await banner.getAttribute('aria-hidden')) === 'false', DEFAULT_TIMEOUT_MS)
  }
}
