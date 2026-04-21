import type {
  StandardTopicContent,
  DesignTopicContent,
  FunctionalRequirementsContent,
  NonFunctionalRequirementsContent,
  CoreEntitiesContent,
  ApiDesignContent,
  TopicKey,
} from '../types/design';
import { TOPIC_DISPLAY_NAMES } from '../types/design';

type TopicData =
  | FunctionalRequirementsContent
  | NonFunctionalRequirementsContent
  | CoreEntitiesContent
  | ApiDesignContent
  | DesignTopicContent
  | StandardTopicContent;

interface TopicViewProps {
  topic: TopicData;
  topicKey: TopicKey;
  revealed: boolean;
  onReveal: () => void;
}

const preStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '1rem',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: '0.875rem',
  lineHeight: 1.7,
  margin: 0,
};

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET:    { bg: '#dbeafe', text: '#1d4ed8' },
  POST:   { bg: '#dcfce7', text: '#15803d' },
  PUT:    { bg: '#fef9c3', text: '#a16207' },
  PATCH:  { bg: '#ffedd5', text: '#c2410c' },
  DELETE: { bg: '#fee2e2', text: '#b91c1c' },
};

export default function TopicView({ topic, topicKey, revealed, onReveal }: TopicViewProps) {
  const displayName = TOPIC_DISPLAY_NAMES[topicKey];

  if (!revealed) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Think through <strong>{displayName}</strong> before revealing.
        </p>
        <button
          onClick={onReveal}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.625rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Reveal Answer
        </button>
      </div>
    );
  }

  // ── Functional Requirements ──────────────────────────────────────────────
  if (topicKey === 'functionalRequirements') {
    const t = topic as FunctionalRequirementsContent;
    if (!t.inScope || t.inScope.length === 0) {
      return <p style={{ color: '#6b7280' }}>No functional requirements found.</p>;
    }
    return (
      <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, margin: 0 }}>
        {t.inScope.map((item, i) => (
          <li key={i} style={{ color: '#111827', marginBottom: '0.25rem' }}>{item}</li>
        ))}
      </ul>
    );
  }

  // ── Non-Functional Requirements ──────────────────────────────────────────
  if (topicKey === 'nonFunctionalRequirements') {
    const t = topic as NonFunctionalRequirementsContent;
    if (!t.items || t.items.length === 0) {
      return <p style={{ color: '#6b7280' }}>No non-functional requirements found.</p>;
    }
    // First item is the scale/capacity line (starts with "Support"), rest are out-of-scope constraints
    const scaleItems = t.items.filter(item => /^Support\s+\d/i.test(item));
    const outOfScope = t.items.filter(item => !/^Support\s+\d/i.test(item));
    return (
      <div>
        {scaleItems.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700,
              color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Scale &amp; Capacity
            </h4>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, margin: 0 }}>
              {scaleItems.map((item, i) => (
                <li key={i} style={{ color: '#111827', marginBottom: '0.25rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {outOfScope.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700,
              color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Non-Functional Requirements
            </h4>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, margin: 0 }}>
              {outOfScope.map((item, i) => (
                <li key={i} style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ── Core Entities ────────────────────────────────────────────────────────
  if (topicKey === 'coreEntities') {
    const t = topic as CoreEntitiesContent;
    if (!t.entities || t.entities.length === 0) {
      return <p style={{ color: '#6b7280' }}>No entities found.</p>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {t.entities.map((entity, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#f3f4f6',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <strong style={{ fontSize: '1rem', color: '#111827' }}>{entity.name}</strong>
            </div>
            <pre style={{ ...preStyle, borderRadius: 0, border: 'none', margin: 0 }}>
              {entity.schema}
            </pre>
          </div>
        ))}
      </div>
    );
  }

  // ── API Design ───────────────────────────────────────────────────────────
  if (topicKey === 'apiDesign') {
    const t = topic as ApiDesignContent;
    if (!t.endpoints || t.endpoints.length === 0) {
      return <p style={{ color: '#6b7280' }}>No API endpoints found.</p>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {t.endpoints.map((ep, i) => {
          const colors = METHOD_COLORS[ep.method] ?? { bg: '#f3f4f6', text: '#374151' };
          return (
            <div
              key={i}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 1rem',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}
                >
                  {ep.method}
                </span>
                <code
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: '0.9rem',
                    color: '#111827',
                    fontWeight: 600,
                  }}
                >
                  {ep.path}
                </code>
                {ep.description && (
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    — {ep.description}
                  </span>
                )}
              </div>
              {/* Body */}
              {(ep.request || ep.response) && (
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ep.request && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Request
                      </span>
                      <pre style={{ ...preStyle, marginTop: '0.25rem', fontSize: '0.8125rem' }}>
                        {ep.request}
                      </pre>
                    </div>
                  )}
                  {ep.response && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Response
                      </span>
                      <pre style={{ ...preStyle, marginTop: '0.25rem', fontSize: '0.8125rem' }}>
                        {ep.response}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Design (architecture diagram + key flows) ────────────────────────────
  if (topicKey === 'design') {
    const t = topic as DesignTopicContent;
    return (
      <div>
        {t.diagram && (
          <pre style={preStyle}>{t.diagram}</pre>
        )}
        {t.keyFlows && t.keyFlows.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Key Flows</h4>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
              {t.keyFlows.map((flow, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>{flow}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  // ── What to Study Further ───────────────────────────────────────────────
  const t = topic as StandardTopicContent;
  if (!t.content) return <p style={{ color: '#6b7280' }}>No content found.</p>;

  // Split on "Expert Note:" prefix — each note becomes a styled card
  const notes = t.content
    .split(/(?=Expert Note:)/g)
    .map(s => s.trim())
    .filter(Boolean);

  if (notes.length > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notes.map((note, i) => {
          const body = note.replace(/^Expert Note:\s*/i, '');
          return (
            <div key={i} style={{
              border: '1px solid #e5e7eb',
              borderLeft: '3px solid #6366f1',
              borderRadius: '0 8px 8px 0',
              padding: '0.75rem 1rem',
              backgroundColor: '#fafafa',
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1',
                textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block',
                marginBottom: '0.25rem' }}>
                Expert Note
              </span>
              <p style={{ margin: 0, color: '#374151', lineHeight: 1.75, fontSize: '0.9375rem' }}>
                {body}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: plain text
  return (
    <p style={{ color: '#374151', lineHeight: 1.8, fontSize: '0.9375rem', margin: 0 }}>
      {t.content}
    </p>
  );
}
