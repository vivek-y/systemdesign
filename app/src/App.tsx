import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LibraryPage from './pages/LibraryPage';
import AttemptPage from './pages/AttemptPage';
import ReferencePage from './pages/ReferencePage';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/attempt/:designId" element={<AttemptPage />} />
          <Route path="/reference/:refId" element={<ReferencePage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
