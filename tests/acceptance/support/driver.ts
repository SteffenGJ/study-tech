import { Builder, type WebDriver } from 'selenium-webdriver'
import { Options as ChromeOptions } from 'selenium-webdriver/chrome'

export function appUrl(path = '/'): string {
  const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5173'

  return new URL(path, baseUrl).toString()
}

export async function createDriver(): Promise<WebDriver> {
  const browser = process.env.SELENIUM_BROWSER ?? 'chrome'
  const builder = new Builder().forBrowser(browser)

  if (browser === 'chrome') {
    const options = new ChromeOptions()

    if (process.env.SELENIUM_HEADLESS !== 'false') {
      options.addArguments('--headless=new', '--disable-gpu')
    }

    options.addArguments('--window-size=1280,720')
    builder.setChromeOptions(options)
  }

  try {
    return await builder.build()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    throw new Error(
      `Could not start Selenium WebDriver (${browser}). ${message}. `
      + 'Ensure the browser and matching WebDriver are installed and available on PATH.',
    )
  }
}
