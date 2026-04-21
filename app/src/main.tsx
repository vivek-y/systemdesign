import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './store';
import { hydrateProgress } from './store/progressSlice';
import { loadAllProgressFromStorage } from './store/localStorageMiddleware';

// Hydrate progress from localStorage before rendering
const savedProgress = loadAllProgressFromStorage();
store.dispatch(hydrateProgress(savedProgress));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
