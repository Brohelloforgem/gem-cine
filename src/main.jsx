import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WatchlistProvider } from './context/WatchlistContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WatchlistProvider>
      <App />
    </WatchlistProvider>
  </StrictMode>,
)
