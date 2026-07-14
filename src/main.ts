import './style.css'
import { mountApp } from './app'

const rootElement = document.querySelector<HTMLDivElement>('#app')

if (!rootElement) {
  throw new Error('Missing #app root element')
}

mountApp(rootElement)
