interface ProgressBarProps {
  current: number; // 0-indexed step
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <nav aria-label="progress" style={{ marginBottom: '1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        Step {current + 1} of {total}
      </p>
      <div
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current + 1} of ${total}`}
        style={{
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: '#2563eb',
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </nav>
  );
}
