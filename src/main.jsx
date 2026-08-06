import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@phosphor-icons/web/duotone';
import '@phosphor-icons/web/regular';
import './design-tokens.css';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

