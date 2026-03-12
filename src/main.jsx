import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import VibeApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VibeApp />
  </StrictMode>,
)
