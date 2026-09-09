/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: main.jsx
 * Architecture Tier: Application Entry Point (Root)
 * Path: frontend/src/main.jsx
 *
 * Purpose:
 *   React DOM application bootstrap rendering the root App component into the HTML root element with strict mode and theme support.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
