import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import { ToastProvider } from './hooks/useToast';
import ConfigError from './components/feedback/ConfigError';
import './index.css';
import { strings } from './strings';
import { apiBaseUrlMissing } from './services/apiClient';

const rootElement = document.getElementById('root') as HTMLElement;

document.documentElement.lang = strings.meta.lang;
document.title = strings.meta.title;
const descriptionTag = document.querySelector('meta[name="description"]');
const themeColorTag = document.querySelector('meta[name="theme-color"]');
if (descriptionTag) descriptionTag.setAttribute('content', strings.meta.description);
if (themeColorTag) themeColorTag.setAttribute('content', strings.meta.themeColor);

if (apiBaseUrlMissing) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeContextProvider>
        <ConfigError />
      </ThemeContextProvider>
    </React.StrictMode>,
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <ThemeContextProvider>
            <AuthProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </AuthProvider>
          </ThemeContextProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
