import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global Fetch Interceptor for Vercel Deployment
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.startsWith('/api')) {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        resource = baseUrl + resource;
    }
    return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
