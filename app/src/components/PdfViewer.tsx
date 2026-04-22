import { useEffect, useState } from 'react';

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  const [loaded, setLoaded] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e293b',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        backgroundColor: '#1e293b',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.9375rem', fontWeight: 600, padding: '0.5rem 0',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer" title="Open in browser"
          style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Body */}
      {isIOS() ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', backgroundColor: '#f8fafc' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          <p style={{ color: '#374151', fontWeight: 600, fontSize: '1.0625rem', margin: 0, textAlign: 'center' }}>{title}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
            Tap below to open the PDF in Safari.<br />Use the Back button above to return.
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 700, fontSize: '1rem', padding: '0.75rem 2rem', borderRadius: '10px', textDecoration: 'none', display: 'inline-block' }}>
            Open PDF
          </a>
        </div>
      ) : (
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#f8fafc' }}>
          {!loaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#6b7280' }}>Loading…</span>
            </div>
          )}
          <iframe src={url} title={title} onLoad={() => setLoaded(true)}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
        </div>
      )}
    </div>
  );
}
