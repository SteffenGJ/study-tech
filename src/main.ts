import './style.css'
import { createAppMarkup } from './app'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = createAppMarkup()
