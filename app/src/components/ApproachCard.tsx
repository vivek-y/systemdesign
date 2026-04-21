import type { Approach } from '../types/design';

interface ApproachCardProps {
  approach: Approach;
  isRecommended: boolean;
}

export default function ApproachCard({ approach, isRecommended }: ApproachCardProps) {
  const cardStyle: React.CSSProperties = {
    border: isRecommended ? '2px solid #16a34a' : '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.75rem',
    backgroundColor: isRecommended ? '#f0fdf4' : '#ffffff',
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{approach.title}</h4>
        {isRecommended && (
          <span
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
            }}
          >
            Recommended
          </span>
        )}
      </div>
      {approach.description && (
        <p style={{ margin: '0 0 0.5rem', color: '#374151', lineHeight: 1.6 }}>
          {approach.description}
        </p>
      )}
      {approach.tradeoff && (
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
          <strong>Trade-off:</strong> {approach.tradeoff}
        </p>
      )}
    </div>
  );
}
