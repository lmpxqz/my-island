import '@repo/ui/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/app'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

document.documentElement.classList.add('dark')
document.documentElement.style.colorScheme = 'dark'

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
