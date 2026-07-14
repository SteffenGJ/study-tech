import type { AddFlashcardCommand } from '../../../src/studying/types'
import SeleniumProtocolDriver from '../support/seleniumProtocolDriver'

interface StudyingDriver {
  goToFlashcards(): void
  addFlashcard(command: AddFlashcardCommand, options?: { simulateFailure?: boolean }): void
  assertFlashcardAddedTo(topic: string): void
  assertSuccess(): void
  assertFlashcardNotAdded(): void
  assertUserInformedOfError(): void
  selectBySubject(subject: string): void
  assertCurrentFlashcardsAre(subject: string): void
}

export default class Studying {
  private readonly driver: StudyingDriver
  private defaults: Pick<AddFlashcardCommand, 'subject' | 'topic'> = {
    subject: '',
    topic: '',
  }

  constructor(driver: StudyingDriver = new SeleniumProtocolDriver('http://127.0.0.1:5173')) {
    this.driver = driver
  }

  assertUserInformedOfError(): void {
    this.driver.assertUserInformedOfError()
  }

  assertFlashcardNotAdded(): void {
    this.driver.assertFlashcardNotAdded()
  }

  tryAddFlashcard(subject: string, topic: string, question: string, answer: string): void {
    const command = this.toAddFlashcardCommand(subject, topic, question, answer)

    this.driver.addFlashcard(command, { simulateFailure: true })
  }

  assertUserInformedOfSucces(): void {
    this.driver.assertSuccess()
  }

  assertFlashcardAddedTo(topic: string): void {
    this.driver.assertFlashcardAddedTo(this.parseField(topic, 'topic') || this.defaults.topic)
  }

  addFlashcard(subject: string, topic: string, question: string, answer: string): void {
    const command = this.toAddFlashcardCommand(subject, topic, question, answer)

    this.driver.addFlashcard(command)
  }

  goToFlashcards(): void {
    this.driver.goToFlashcards()
  }

  selectBySubject(subject: string): void {
    this.driver.selectBySubject(this.parseField(subject, 'subject') || this.defaults.subject)
  }

  assertCurrentFlashcardsAre(subject: string): void {
    this.driver.assertCurrentFlashcardsAre(this.parseField(subject, 'subject') || this.defaults.subject)
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
