import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CssBaseline />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
