import type { HLDTopicContent, DeepDiveTopicContent } from '../types/design';
import ApproachCard from './ApproachCard';

interface QuestionRevealProps {
  topic: HLDTopicContent | DeepDiveTopicContent;
  topicType: 'highLevelDesign' | 'deepDive';
  revealedQuestions: number[];
  onRevealQuestion: (index: number) => void;
}

export default function QuestionReveal({
  topic,
  topicType,
  revealedQuestions,
  onRevealQuestion,
}: QuestionRevealProps) {
  const revealedSet = new Set(revealedQuestions);

  if (topicType === 'highLevelDesign') {
    const hldTopic = topic as HLDTopicContent;
    const totalItems = hldTopic.questions.length + 1; // sub-topics + system architecture table

    return (
      <div>
        {hldTopic.questions.map((question, index) => {
          const isRevealed = revealedSet.has(index);
          // Sequential: only show reveal button if previous question is revealed (or it's the first)
          const canReveal = index === 0 || revealedSet.has(index - 1);

          return (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', color: '#111827' }}>{question.subTopic}</h4>
              {isRevealed ? (
                <div>
                  {question.approaches.map((approach, ai) => (
                    <ApproachCard
                      key={ai}
                      approach={approach}
                      isRecommended={approach.isRecommended}
                    />
                  ))}
                </div>
              ) : canReveal ? (
                <button
                  onClick={() => onRevealQuestion(index)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Reveal
                </button>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  Reveal previous questions first
                </p>
              )}
            </div>
          );
        })}

        {/* System Architecture table — final item */}
        {(() => {
          const archIndex = hldTopic.questions.length;
          const isRevealed = revealedSet.has(archIndex);
          const canReveal = archIndex === 0 || revealedSet.has(archIndex - 1);

          return (
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', color: '#111827' }}>System Architecture</h4>
              {isRevealed ? (
                hldTopic.systemArchitecture.components.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #e5e7eb',
                            fontWeight: 600,
                          }}
                        >
                          Component
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #e5e7eb',
                            fontWeight: 600,
                          }}
                        >
                          Responsibility
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hldTopic.systemArchitecture.components.map((comp, ci) => (
                        <tr key={ci}>
                          <td
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid #e5e7eb',
                              fontWeight: 500,
                            }}
                          >
                            {comp.name}
                          </td>
                          <td
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid #e5e7eb',
                              color: '#374151',
                            }}
                          >
                            {comp.responsibility}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#6b7280', margin: 0 }}>No system architecture data available.</p>
                )
              ) : canReveal ? (
                <button
                  onClick={() => onRevealQuestion(archIndex)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Reveal
                </button>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  Reveal previous questions first
                </p>
              )}
            </div>
          );
        })()}

        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {revealedQuestions.length} / {totalItems} revealed
        </p>
      </div>
    );
  }

  // Deep Dive
  const ddTopic = topic as DeepDiveTopicContent;
  const totalItems = ddTopic.questions.length;

  return (
    <div>
      {ddTopic.questions.map((question, index) => {
        const isRevealed = revealedSet.has(index);
        const canReveal = index === 0 || revealedSet.has(index - 1);

        return (
          <div
            key={index}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#ffffff',
            }}
          >
            <h4 style={{ margin: '0 0 0.75rem', color: '#111827' }}>{question.title}</h4>
            {isRevealed ? (
              <p
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  color: '#374151',
                  fontSize: '0.9375rem',
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {question.content}
              </p>
            ) : canReveal ? (
              <button
                onClick={() => onRevealQuestion(index)}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Reveal
              </button>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                Reveal previous questions first
              </p>
            )}
          </div>
        );
      })}

      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        {revealedQuestions.length} / {totalItems} revealed
      </p>
    </div>
  );
}
