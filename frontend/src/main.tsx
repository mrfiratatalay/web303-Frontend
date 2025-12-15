import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import ConfigError from './components/feedback/ConfigError';
import './index.css';
import { strings } from './strings';
import { theme } from './theme';
import { apiBaseUrlMissing } from './services/apiClient';

const rootElement = document.getElementById('root') as HTMLElement;

document.documentElement.lang = strings.meta.lang;
document.title = strings.meta.title;
const descriptionTag = document.querySelector('meta[name="description"]');
const themeColorTag = document.querySelector('meta[name="theme-color"]');
if (descriptionTag) descriptionTag.setAttribute('content', strings.meta.description);
if (themeColorTag) themeColorTag.setAttribute('content', strings.meta.themeColor);

const renderRoot = (node: React.ReactNode) =>
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {node}
      </ThemeProvider>
    </React.StrictMode>,
  );

if (apiBaseUrlMissing) {
  renderRoot(<ConfigError />);
} else {
  renderRoot(
    <ErrorBoundary>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>,
  );
}
