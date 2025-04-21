import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum, {
  name: 'custom',
  chainId: 420420421
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
