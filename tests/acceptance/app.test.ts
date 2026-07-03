import { By, until, type WebDriver } from 'selenium-webdriver'
import { appUrl, createDriver } from './support/driver'

jest.setTimeout(30000)

describe('app', () => {
  let driver: WebDriver | undefined

  beforeAll(async () => {
    driver = await createDriver()
  })

  afterAll(async () => {
    await driver?.quit()
  })

  it('loads the home page', async () => {
    if (!driver) {
      throw new Error('Selenium driver was not created')
    }

    await driver.get(appUrl('/'))

    const heading = await driver.wait(until.elementLocated(By.css('h1')), 5000)

    await expect(heading.getText()).resolves.toBe('Study Tech')
  })
})
