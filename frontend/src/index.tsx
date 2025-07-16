/*
  index.tsx

  The root entry point for the React application.

  - Renders the top-level <App /> component into the DOM
  - Uses React 18's `createRoot()` API
  - Wraps the app in <React.StrictMode> for highlighting unsafe lifecycles
  - Optionally enables web vitals reporting
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

/* Create root and mount the React app */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();

