import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { initAttempt, navigateTo, revealTopic, revealQuestion, markComplete } from '../store/attemptSlice';
import { useDesignContent } from '../hooks/useDesignContent';
import ProgressBar from '../components/ProgressBar';
import TopicView from '../components/TopicView';
import QuestionReveal from '../components/QuestionReveal';
import { TOPIC_ORDER } from '../types/design';
import type { TopicKey } from '../types/design';

export default function AttemptPage() {
  const { designId } = useParams<{ designId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const progressRecords = useAppSelector((state) => state.progress.records);
  const currentStep = useAppSelector((state) => state.attempt.currentStep);
  const revealedTopics = useAppSelector((state) => state.attempt.revealedTopics);
  const revealedQuestions = useAppSelector((state) => state.attempt.revealedQuestions);

  const { content, loading, error } = useDesignContent(designId ?? '');

  useEffect(() => {
    if (!designId) {
      navigate('/');
      return;
    }
    dispatch(initAttempt({ designId, savedProgress: progressRecords[designId] ?? null }));
  }, [designId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!designId) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Loading design…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ color: '#dc2626' }}>Error loading design: {error}</p>
        <Link to="/" style={{ color: '#2563eb' }}>← Back to Library</Link>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Loading…
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    alignItems: 'center',
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.625rem 1.25rem',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 500,
  };

  const btnSecondary: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.625rem 1.25rem',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 500,
  };

  const btnDisabled: React.CSSProperties = {
    ...btnPrimary,
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  };

  // Step 0: Overview
  if (currentStep === 0) {
    return (
      <div style={containerStyle}>
        <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Library
        </Link>
        <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{content.name}</h1>
        <h2 style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '1rem' }}>
          Problem Overview
        </h2>
        <pre
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '1rem',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {content.overview}
        </pre>
        <div style={navStyle}>
          <button style={btnPrimary} onClick={() => dispatch(navigateTo(1))}>
            Begin →
          </button>
        </div>
      </div>
    );
  }

  // Steps 1-8: Topics
  const topicIndex = currentStep - 1; // 0-indexed into TOPIC_ORDER
  const topicKey: TopicKey = TOPIC_ORDER[topicIndex];
  const isLastStep = currentStep === 8;
  const isHLD = topicKey === 'highLevelDesign';
  const isDeepDive = topicKey === 'deepDive';
  const isQuestionTopic = isHLD || isDeepDive;

  // Determine if Next is enabled
  let nextEnabled = true;
  if (isHLD) {
    const hldTopic = content.topics.highLevelDesign;
    const totalHLD = hldTopic.questions.length + 1;
    nextEnabled = revealedQuestions.highLevelDesign.length >= totalHLD;
  } else if (isDeepDive) {
    const ddTopic = content.topics.deepDive;
    const totalDD = ddTopic.questions.length;
    nextEnabled = revealedQuestions.deepDive.length >= totalDD;
  } else {
    nextEnabled = revealedTopics[topicKey] === true;
  }

  const currentTopic = content.topics[topicKey];

  return (
    <div style={containerStyle}>
      <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>
        ← Library
      </Link>
      <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{content.name}</h1>

      <ProgressBar current={currentStep - 1} total={8} />

      <h2 style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '1rem' }}>
        {isHLD
          ? 'High Level Design'
          : isDeepDive
          ? 'Deep Dive'
          : topicKey === 'functionalRequirements'
          ? 'Functional Requirements'
          : topicKey === 'nonFunctionalRequirements'
          ? 'Non-Functional Requirements'
          : topicKey === 'coreEntities'
          ? 'Core Entities'
          : topicKey === 'apiDesign'
          ? 'API Design'
          : topicKey === 'design'
          ? 'Design'
          : 'What to Study Further'}
      </h2>

      {isQuestionTopic ? (
        <QuestionReveal
          topic={isHLD ? content.topics.highLevelDesign : content.topics.deepDive}
          topicType={isHLD ? 'highLevelDesign' : 'deepDive'}
          revealedQuestions={isHLD ? revealedQuestions.highLevelDesign : revealedQuestions.deepDive}
          onRevealQuestion={(index) =>
            dispatch(revealQuestion({ topicKey: isHLD ? 'highLevelDesign' : 'deepDive', index }))
          }
        />
      ) : (
        <TopicView
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          topic={currentTopic as any}
          topicKey={topicKey}
          revealed={revealedTopics[topicKey]}
          onReveal={() => dispatch(revealTopic(topicKey))}
        />
      )}

      <div style={navStyle}>
        {currentStep > 0 && (
          <button style={btnSecondary} onClick={() => dispatch(navigateTo(currentStep - 1))}>
            ← Back
          </button>
        )}

        {isLastStep ? (
          <button
            style={nextEnabled ? btnPrimary : btnDisabled}
            disabled={!nextEnabled}
            onClick={() => {
              dispatch(markComplete());
              navigate('/');
            }}
          >
            Finish ✓
          </button>
        ) : (
          <button
            style={nextEnabled ? btnPrimary : btnDisabled}
            disabled={!nextEnabled}
            onClick={() => dispatch(navigateTo(currentStep + 1))}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
