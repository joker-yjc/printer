import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { configureSDK } from "@jcyao/print-sdk"
configureSDK({ escapeHtml: false })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
