import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────

interface StoryItem {
  id: string;
  title: string;
  content: string;
  followUp?: string;
}

interface ScenarioItem {
  id: string;
  question: string;
  story: string;
  answer: string;
  insight: string;
}

type AnyItem = StoryItem | ScenarioItem;

interface BehaviouralDoc {
  id: string;
  name: string;
  items: AnyItem[];
}

// ── Module-level cache ─────────────────────────────────────────────────────
const docCache: Record<string, BehaviouralDoc> = {};
const fetchPromises: Record<string, Promise<BehaviouralDoc> | undefined> = {};

// Allowed section IDs — prevents path traversal
const ALLOWED_SECTIONS = new Set(['stories', 'scenarios']);

function loadDoc(sectionId: string): Promise<BehaviouralDoc> {
  if (!ALLOWED_SECTIONS.has(sectionId)) {
    return Promise.reject(new Error('Invalid section'));
  }
  if (docCache[sectionId]) return Promise.resolve(docCache[sectionId]);
  if (fetchPromises[sectionId]) return fetchPromises[sectionId];

  fetchPromises[sectionId] = fetch(`${import.meta.env.BASE_URL}data/behavioural/${sectionId}.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
      return r.json() as Promise<BehaviouralDoc>;
    })
    .then((data) => {
      docCache[sectionId] = data;
      return data;
    });

  return fetchPromises[sectionId];
}

// ── helpers ────────────────────────────────────────────────────────────────

function isScenario(item: AnyItem): item is ScenarioItem {
  return 'question' in item;
}

function formatBody(text: string) {
  return text.split('\n\n').map((para, i) => (
    <p key={i} style={{ margin: '0 0 1rem', color: '#374151', lineHeight: 1.85 }}>
      {para}
    </p>
  ));
}

// ── Cards ──────────────────────────────────────────────────────────────────

function StoryCard({ item }: { item: StoryItem }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
        {item.title}
      </h2>
      <div style={{ fontSize: '0.9375rem' }}>{formatBody(item.content)}</div>
      {item.followUp && (
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', borderRadius: '0 8px 8px 0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Follow-up
          </div>
          <p style={{ margin: 0, color: '#374151', lineHeight: 1.8, fontSize: '0.9375rem' }}>{item.followUp}</p>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ item }: { item: ScenarioItem }) {
  return (
    <div>
      <div style={{ padding: '1rem 1.25rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #2563eb', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
          Interview Question
        </div>
        <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', lineHeight: 1.65, fontSize: '1rem' }}>{item.question}</p>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '9999px', padding: '0.2rem 0.75rem' }}>
          📖 {item.story}
        </span>
      </div>
      <div style={{ fontSize: '0.9375rem', marginBottom: '1.5rem' }}>{formatBody(item.answer)}</div>
      <div style={{ padding: '1rem 1.25rem', backgroundColor: '#fefce8', borderLeft: '3px solid #eab308', borderRadius: '0 8px 8px 0' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Key Insight
        </div>
        <p style={{ margin: 0, color: '#374151', lineHeight: 1.8, fontSize: '0.9375rem' }}>{item.insight}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function BehaviouralPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [doc, setDoc] = useState<BehaviouralDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!sectionId) return;
    let alive = true;

    loadDoc(sectionId)
      .then((data) => { if (alive) { setDoc(data); setIndex(0); } })
      .catch((e) => { if (alive) setError(e.message); });

    return () => { alive = false; };
  }, [sectionId]);

  // ── loading state: only show spinner if we have no doc yet ───────────────
  if (!doc && !error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '780px', margin: '0 auto' }}>
        <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>← Library</Link>
        <div style={{ marginTop: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading…</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
        <Link to="/" style={{ color: '#2563eb' }}>← Back to Library</Link>
      </div>
    );
  }

  const items = doc.items;
  const total = items.length;
  const current = items[index];

  return (
    <div style={{ padding: '2rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Back */}
      <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>
        ← Library
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0 2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: '#111827' }}>{doc.name}</h1>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{index + 1} / {total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', backgroundColor: '#e5e7eb', borderRadius: '9999px', marginBottom: '2rem' }}>
        <div style={{ height: '100%', width: `${((index + 1) / total) * 100}%`, backgroundColor: '#0d9488', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', minHeight: '300px' }}>
        {isScenario(current) ? <ScenarioCard item={current} /> : <StoryCard item={current} />}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: index === 0 ? '#f9fafb' : '#ffffff', color: index === 0 ? '#d1d5db' : '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: index === 0 ? 'not-allowed' : 'pointer' }}
        >
          ← Prev
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px' }}>
          {items.slice(0, 15).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{ width: i === index ? '20px' : '8px', height: '8px', borderRadius: '9999px', border: 'none', backgroundColor: i === index ? '#0d9488' : i < index ? '#99f6e4' : '#e5e7eb', cursor: 'pointer', padding: 0, transition: 'all 0.2s ease' }}
            />
          ))}
          {total > 15 && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>+{total - 15}</span>}
        </div>

        <button
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: index === total - 1 ? '#e5e7eb' : '#0d9488', color: index === total - 1 ? '#9ca3af' : '#ffffff', fontWeight: 600, fontSize: '0.875rem', cursor: index === total - 1 ? 'not-allowed' : 'pointer' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
