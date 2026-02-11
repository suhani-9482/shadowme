import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/animations.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast'
import { ConfettiProvider } from './components/Confetti'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ConfettiProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ConfettiProvider>
    </ThemeProvider>
  </StrictMode>,
)
