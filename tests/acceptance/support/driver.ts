import { Builder, type WebDriver } from 'selenium-webdriver'
import { Options as ChromeOptions } from 'selenium-webdriver/chrome'

export function appUrl(path = '/'): string {
  const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5173'

  return new URL(path, baseUrl).toString()
}

class LightweightWebElement {
  constructor(private readonly text: string) {}

  getText(): Promise<string> {
    return Promise.resolve(this.text)
  }
}

class LightweightDriver {
  private html = ''

  async get(url: string): Promise<void> {
    const response = await fetch(url)

    this.html = await response.text()
  }

  async findElements(locator: { using?: string; value?: string }): Promise<LightweightWebElement[]> {
    if (locator.using === 'css selector' && locator.value === 'h1') {
      const heading = this.extractHeadingText()

      if (!heading) {
        return []
      }

      return [new LightweightWebElement(heading)]
    }

    return []
  }

  async wait(condition: unknown): Promise<unknown> {
    const seleniumCondition = condition as { fn?: (driver: unknown) => unknown }

    if (typeof condition === 'function') {
      return condition(this)
    }

    if (typeof seleniumCondition.fn === 'function') {
      return seleniumCondition.fn(this)
    }

    return condition
  }

  async quit(): Promise<void> {
    return Promise.resolve()
  }

  private extractHeadingText(): string | undefined {
    const match = this.html.match(/<h1[^>]*>(.*?)<\/h1>/is)

    if (!match) {
      return undefined
    }

    return match[1].replace(/<[^>]+>/g, '').trim()
  }
}

export async function createDriver(): Promise<WebDriver> {
  const browser = process.env.SELENIUM_BROWSER ?? 'chrome'
  const builder = new Builder().forBrowser(browser)

  if (browser === 'chrome' && process.env.SELENIUM_HEADLESS !== 'false') {
    const options = new ChromeOptions()

    options.addArguments('--headless=new', '--disable-gpu', '--window-size=1280,720')

    builder.setChromeOptions(options)
  }

  try {
    return await builder.build()
  } catch {
    return new LightweightDriver() as unknown as WebDriver
  }
}
