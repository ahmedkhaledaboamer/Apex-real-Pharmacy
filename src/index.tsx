import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LocaleProvider } from './lib/i18n';

/**
 * Product photos live at /images/products/<slug>.jpg. When a photo has not been
 * added yet, fall back to the neutral drawing at /images/products/<slug>.svg.
 */
window.addEventListener(
  'error',
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const m = img.src.match(/^(.*\/images\/products\/[^/?#]+)\.jpg$/);
    if (m) img.src = `${m[1]}.svg`;
  },
  true
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>
);
