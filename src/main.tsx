import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppProviders from '@/providers/AppProviders';
import App from '@/App';
import { initSentry } from '@/lib/errors/sentry';
import './index.css';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
