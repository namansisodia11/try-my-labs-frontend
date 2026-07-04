import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './common/typography.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode disabled: its dev-only double-mount was causing a visible flicker
  // on pages that create external instances (e.g. the Desmos calculator). Uncomment
  // to re-enable if you want its effect-cleanup warnings back.
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
);
