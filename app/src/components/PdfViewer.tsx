import { useEffect } from 'react';

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '1rem', fontWeight: 600, padding: '0.5rem 0' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
      </div>

      {/* Body — plain link, no JS tricks */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        backgroundColor: '#f8fafc',
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>

        <p style={{ color: '#374151', fontWeight: 600, fontSize: '1.0625rem', margin: 0, textAlign: 'center' }}>
          {title}
        </p>

        {/* Plain anchor — browser handles it natively */}
        <a
          href={url}
          style={{
            backgroundColor: '#0d9488',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '0.875rem 2.5rem',
            borderRadius: '10px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Open PDF
        </a>

        <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: 0, textAlign: 'center' }}>
          Use your browser's back button to return
        </p>
      </div>
    </div>
  );
}
