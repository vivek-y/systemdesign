import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchIndex } from '../store/contentSlice';
import { clearProgress, hydrateProgress } from '../store/progressSlice';
import { loadAllProgressFromStorage } from '../store/localStorageMiddleware';
import DesignCard from '../components/DesignCard';

interface RefSummary {
  id: string;
  name: string;
}

const REF_ICONS: Record<string, string> = {
  'cheat-sheet': '📋',
  'common-patterns': '🔁',
  'follow-up-questions': '❓',
};

export default function LibraryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const index = useAppSelector((state) => state.content.index);
  const indexLoading = useAppSelector((state) => state.content.loading['__index__'] ?? false);
  const records = useAppSelector((state) => state.progress.records);

  const [refs, setRefs] = useState<RefSummary[]>([]);

  useEffect(() => {
    dispatch(fetchIndex());
    dispatch(hydrateProgress(loadAllProgressFromStorage()));
    // Load reference index
    fetch('/data/reference/index.json')
      .then((r) => r.ok ? r.json() : { references: [] })
      .then((data) => setRefs(data.references ?? []))
      .catch(() => setRefs([]));
  }, [dispatch]);

  if (indexLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Loading designs…
      </div>
    );
  }

  if (!index || index.length === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>System Design Interview App</h1>
        <p style={{ color: '#6b7280', lineHeight: 1.7 }}>
          No designs found. Run the PDF extractor to generate content:
        </p>
        <pre
          style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '1rem',
            fontSize: '0.875rem',
          }}
        >
          python extract_pdfs.py --pdf-dir . --output-dir app/public/data
        </pre>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Then restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>System Design Interview App</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        {index.length} designs available. Pick one to start practicing.
      </p>

      {/* ── Reference Docs ─────────────────────────────────────────────── */}
      {refs.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: '#374151' }}>
            Reference Docs
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {refs.map((ref) => (
              <button
                key={ref.id}
                onClick={() => navigate(`/reference/${ref.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.625rem 1.125rem',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#111827',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              >
                <span>{REF_ICONS[ref.id] ?? '📄'}</span>
                {ref.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Design Cards ───────────────────────────────────────────────── */}
      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: '#374151' }}>
        System Designs
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {index.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
            progress={records[design.id] ?? null}
            onStart={() => navigate(`/attempt/${design.id}`)}
            onContinue={() => navigate(`/attempt/${design.id}`)}
            onStartOver={() => {
              dispatch(clearProgress(design.id));
              navigate(`/attempt/${design.id}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
