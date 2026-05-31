/**
 * @fileoverview main.jsx – application entry point.
 *
 * Mounts the React root onto `#root` inside index.html and wraps the
 * application in React's StrictMode for development-time warnings.
 *
 * @module main
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
