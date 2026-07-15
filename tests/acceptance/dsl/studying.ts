import type { AddFlashcardCommand } from '../../../src/studying/types'
import SeleniumProtocolDriver from '../support/seleniumProtocolDriver'

interface StudyingDriver {
  goToFlashcards(): Promise<void>
  addFlashcard(command: AddFlashcardCommand, options?: { simulateFailure?: boolean }): Promise<void>
  selectBySubject(subject: string): Promise<void>
  assertCurrentFlashcardsAre(subject: string): Promise<void>
  assertFlashcardAddedTo(topic: string): Promise<void>
  assertSuccess(): Promise<void>
  assertFlashcardNotAdded(): Promise<void>
  assertUserInformedOfError(): Promise<void>
  close(): Promise<void>
}

export default class Studying {
  private readonly driverPromise: Promise<StudyingDriver>
  private defaults: { subject?: string; topic?: string } = {}

  constructor(driverPromise: Promise<StudyingDriver> = SeleniumProtocolDriver.create()) {
    this.driverPromise = driverPromise
  }

  async destroy(): Promise<void> {
    const driver = await this.driverPromise

    await driver.close()
  }

  async tryAddFlashcard(subject: string, topic: string, question: string, answer: string): Promise<void> {
    const command = this.toAddFlashcardCommand(subject, topic, question, answer)

    await (await this.driverPromise).addFlashcard(command, { simulateFailure: true })
  }

  async assertUserInformedOfSucces(): Promise<void> {
    await (await this.driverPromise).assertSuccess()
  }

  async assertFlashcardAddedTo(topic: string): Promise<void> {
    await (await this.driverPromise).assertFlashcardAddedTo(this.parseField(topic, 'topic') || this.defaults.topic || '')
  }

  async addFlashcard(subject: string, topic: string, question: string, answer: string): Promise<void> {
    const command = this.toAddFlashcardCommand(subject, topic, question, answer)

    await (await this.driverPromise).addFlashcard(command)
  }

  async goToFlashcards(): Promise<void> {
    await (await this.driverPromise).goToFlashcards()
  }

  async selectBySubject(subject: string): Promise<void> {
    await (await this.driverPromise).selectBySubject(this.parseField(subject, 'subject') || this.defaults.subject || '')
  }

  async assertCurrentFlashcardsAre(subject: string): Promise<void> {
    await (await this.driverPromise).assertCurrentFlashcardsAre(this.parseField(subject, 'subject') || this.defaults.subject || '')
  }

  async assertFlashcardNotAdded(): Promise<void> {
    await (await this.driverPromise).assertFlashcardNotAdded()
  }

  async assertUserInformedOfError(): Promise<void> {
    await (await this.driverPromise).assertUserInformedOfError()
  }

  private toAddFlashcardCommand(subject: string, topic: string, question: string, answer: string): AddFlashcardCommand {
    const parsedSubject = this.parseField(subject, 'subject') || this.defaults.subject
    const parsedTopic = this.parseField(topic, 'topic') || this.defaults.topic

    if (!parsedSubject) {
      throw new Error('A subject is required when adding flashcards')
    }

    if (!parsedTopic) {
      throw new Error('A topic is required when adding flashcards')
    }

    this.defaults = {
      subject: parsedSubject,
      topic: parsedTopic,
    }

    return {
      subject: parsedSubject,
      topic: parsedTopic,
      question: this.parseField(question, 'question'),
      answer: this.parseField(answer, 'answer'),
    }
  }

  private parseField(rawField: string, fieldName: string): string {
    const [rawName, ...rest] = rawField.split(':')
    const actualName = rawName.trim().toLowerCase()

    if (actualName !== fieldName.toLowerCase()) {
      throw new Error(`Expected "${fieldName}: ..." but got "${rawField}"`)
    }

    return rest.join(':').trim()
  }
}
