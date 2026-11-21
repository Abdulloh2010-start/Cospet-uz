import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { StoreProvider } from './lib/store';
import App from './App';
import { initTg } from './lib/tg';
import './styles/main.scss';

initTg();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider><StoreProvider><App /></StoreProvider></AuthProvider>
    </BrowserRouter>
  </StrictMode>
);