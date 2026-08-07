import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import Score from './App';

createRoot(document.getElementById('root')).render(
  <WithCallbackExample />
);