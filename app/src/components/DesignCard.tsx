import type { DesignSummary, AttemptProgress } from '../types/design';

interface DesignCardProps {
  design: DesignSummary;
  progress: AttemptProgress | null;
  onStart: () => void;
  onContinue: () => void;
  onStartOver: () => void;
}

export default function DesignCard({
  design,
  progress,
  onStart,
  onContinue,
  onStartOver,
}: DesignCardProps) {
  const btnBase: React.CSSProperties = {
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: 500,
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
          {design.name}
        </h3>
        {progress?.completed && (
          <span
            style={{
              backgroundColor: '#dcfce7',
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
            }}
          >
            ✓ Complete
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {progress === null ? (
          <button
            onClick={onStart}
            style={{ ...btnBase, backgroundColor: '#2563eb', color: '#ffffff' }}
          >
            Start
          </button>
        ) : (
          <>
            <button
              onClick={onContinue}
              style={{ ...btnBase, backgroundColor: '#2563eb', color: '#ffffff' }}
            >
              Continue
            </button>
            <button
              onClick={onStartOver}
              style={{
                ...btnBase,
                backgroundColor: '#ffffff',
                color: '#6b7280',
                border: '1px solid #d1d5db',
              }}
            >
              Start Over
            </button>
          </>
        )}
      </div>
    </div>
  );
}
