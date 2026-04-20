import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { JobFlowProvider } from './store/JobFlowProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JobFlowProvider>
      <App />
    </JobFlowProvider>
  </StrictMode>
);
