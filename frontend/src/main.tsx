import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import './index.css';
import { strings } from './strings';
import { theme } from './theme';

const rootElement = document.getElementById('root') as HTMLElement;

document.documentElement.lang = strings.meta.lang;
document.title = strings.meta.title;
const descriptionTag = document.querySelector('meta[name="description"]');
const themeColorTag = document.querySelector('meta[name="theme-color"]');
if (descriptionTag) descriptionTag.setAttribute('content', strings.meta.description);
if (themeColorTag) themeColorTag.setAttribute('content', strings.meta.themeColor);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
