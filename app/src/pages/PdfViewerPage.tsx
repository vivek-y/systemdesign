import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function PdfViewerPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const url = params.get('url') ?? '';
  const title = params.get('title') ?? 'Document';
  const [loaded, setLoaded] = useState(false);

  // Decode the URL (it was encoded before navigating here)
  const pdfUrl = decodeURIComponent(url);

  useEffect(() => {
    if (!pdfUrl) navigate('/');
  }, [pdfUrl, navigate]);

  if (!pdfUrl) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#1e293b', zIndex: 100 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#1e293b',
        flexShrink: 0,
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.9375rem', fontWeight: 600, padding: '0.25rem 0',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        {/* Open externally as fallback */}
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
          title="Open in browser"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Content */}
      {isIOS() ? (
        // iOS can't embed PDFs in iframe — show a prominent open button
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', padding: '2rem', backgroundColor: '#f8fafc',
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          <p style={{ color: '#374151', fontWeight: 600, fontSize: '1.0625rem', margin: 0, textAlign: 'center' }}>{title}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
            Tap below to open the PDF in Safari.
          </p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#0d9488', color: '#ffffff',
              fontWeight: 700, fontSize: '1rem',
              padding: '0.75rem 2rem', borderRadius: '10px',
              textDecoration: 'none', display: 'inline-block',
            }}
          >
            Open PDF
          </a>
        </div>
      ) : (
        // Android / desktop — embed in iframe
        <div style={{ flex: 1, position: 'relative' }}>
          {!loaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
              <span style={{ color: '#6b7280', fontSize: '0.9375rem' }}>Loading PDF…</span>
            </div>
          )}
          <iframe
            src={pdfUrl}
            title={title}
            onLoad={() => setLoaded(true)}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}
