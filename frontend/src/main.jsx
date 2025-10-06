import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import "./components/scrabble-style.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
