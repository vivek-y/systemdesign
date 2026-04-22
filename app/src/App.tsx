import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LibraryPage from './pages/LibraryPage';
import AttemptPage from './pages/AttemptPage';
import ReferencePage from './pages/ReferencePage';
import ReferencePracticePage from './pages/ReferencePracticePage';
import BehaviouralPage from './pages/BehaviouralPage';
import PdfViewerPage from './pages/PdfViewerPage';
import './index.css';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/attempt/:designId" element={<AttemptPage />} />
          <Route path="/reference/:refId" element={<ReferencePage />} />
          <Route path="/reference-practice/:refId" element={<ReferencePracticePage />} />
          <Route path="/behavioural/:sectionId" element={<BehaviouralPage />} />
          <Route path="/pdf" element={<PdfViewerPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
