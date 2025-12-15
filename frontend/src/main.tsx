import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import './index.css';
import { strings } from './strings';

const rootElement = document.getElementById('root') as HTMLElement;

document.documentElement.lang = strings.meta.lang;
document.title = strings.meta.title;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AuthProvider>
          <CssBaseline />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
