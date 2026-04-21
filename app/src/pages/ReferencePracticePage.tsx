import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────

interface TextBlock  { type: 'text';  content: string }
interface TableBlock { type: 'table'; headers: string[]; rows: string[][] }
type DocBlock = TextBlock | TableBlock;

interface ReferenceDoc { id: string; name: string; blocks: DocBlock[] }

interface Section { heading: string; body: string; table?: TableBlock }

// ── Cache ──────────────────────────────────────────────────────────────────

const docCache: Record<string, ReferenceDoc> = {};
const fetchPromises: Record<string, Promise<ReferenceDoc> | undefined> = {};

// Allowed reference IDs — prevents path traversal
const ALLOWED_REFS = new Set(['cheat-sheet', 'common-patterns', 'follow-up-questions']);

function loadDoc(refId: string): Promise<ReferenceDoc> {
  if (!ALLOWED_REFS.has(refId)) {
    return Promise.reject(new Error('Invalid reference'));
  }
  if (docCache[refId]) return Promise.resolve(docCache[refId]);
  if (fetchPromises[refId]) return fetchPromises[refId];
  fetchPromises[refId] = fetch(`${import.meta.env.BASE_URL}data/reference/${refId}.json`)
    .then((r) => { if (!r.ok) throw new Error(`Failed: ${r.status}`); return r.json(); })
    .then((data: ReferenceDoc) => { docCache[refId] = data; return data; });
  return fetchPromises[refId];
}

// ── Parser ─────────────────────────────────────────────────────────────────

function parseIntoSections(docId: string, blocks: DocBlock[]): Section[] {
  const sections: Section[] = [];

  // follow-up-questions: one card per Q:, drop Roman numeral group headings
  if (docId === 'follow-up-questions') {
    for (const block of blocks) {
      if (block.type !== 'text') continue;
      let currentQ = '';
      let currentBody: string[] = [];

      const flush = () => {
        if (currentQ) {
          sections.push({ heading: currentQ, body: currentBody.join('\n').trim() });
          currentQ = '';
          currentBody = [];
        }
      };

      for (const line of block.content.split('\n')) {
        if (/^Q:\s/.test(line)) {
          flush();
          currentQ = line.replace(/^Q:\s*/, '');
        } else if (currentQ) {
          if (/^[IVX]+\.\s+\S/.test(line)) continue; // skip group headings
          currentBody.push(line);
        }
      }
      flush();
    }
    return sections.filter((s) => s.heading);
  }

  // cheat-sheet & common-patterns: split on "N. Title" or "Pattern N: Title"
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];

    if (block.type === 'table') {
      if (sections.length > 0 && !sections[sections.length - 1].table) {
        sections[sections.length - 1].table = block;
      } else {
        sections.push({ heading: '', body: '', table: block });
      }
      continue;
    }

    let currentHeading = '';
    let currentBody: string[] = [];

    const flush = () => {
      if (currentHeading || currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
        currentHeading = '';
        currentBody = [];
      }
    };

    for (const line of block.content.split('\n')) {
      if (/^\d+\.\s+\S/.test(line)) {
        flush();
        currentHeading = line;
      } else if (/^Pattern\s+\d+:\s*/i.test(line)) {
        flush();
        // Strip "Pattern N: " prefix — just keep the name
        currentHeading = line.replace(/^Pattern\s+\d+:\s*/i, '');
      } else {
        currentBody.push(line);
      }
    }
    flush();
  }

  return sections.filter((s) => s.heading);
}

// ── Renderers ──────────────────────────────────────────────────────────────

function renderBody(text: string) {
  if (!text) return null;
  const lines = text.split('\n').filter((l) => l.trim());
  const els: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ■ Example callout
    if (/^■/.test(line)) {
      els.push(
        <div key={i} style={{ margin: '0.5rem 0', padding: '0.4rem 0.875rem', backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', borderRadius: '0 6px 6px 0', fontSize: '0.875rem', color: '#15803d' }}>
          {line.replace(/^■\s*/, '')}
        </div>
      );
      continue;
    }

    // Lone digit = numbered step (digit on its own line, next line is the text)
    if (/^\d+$/.test(line) && i + 1 < lines.length && lines[i + 1]?.trim()) {
      els.push(
        <div key={i} style={{ display: 'flex', gap: '0.625rem', margin: '0.3rem 0', color: '#374151', lineHeight: 1.75, fontSize: '0.9375rem' }}>
          <span style={{ color: '#0d9488', fontWeight: 700, flexShrink: 0, minWidth: '1.25rem' }}>{line}.</span>
          <span>{lines[i + 1].trim()}</span>
        </div>
      );
      i++;
      continue;
    }

    // Bullet
    if (/^[•\x7f▪\-]\s/.test(line)) {
      els.push(
        <div key={i} style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0', color: '#374151', lineHeight: 1.75, fontSize: '0.9375rem' }}>
          <span style={{ color: '#0d9488', flexShrink: 0 }}>•</span>
          <span>{line.replace(/^[•\x7f▪\-]\s*/, '')}</span>
        </div>
      );
      continue;
    }

    // Sub-heading: short, uppercase start, no trailing period/comma
    if (line.length < 70 && !line.endsWith('.') && !line.endsWith(',') && /^[A-Z]/.test(line)) {
      els.push(
        <p key={i} style={{ margin: '0.875rem 0 0.25rem', fontWeight: 700, color: '#374151', fontSize: '0.9375rem' }}>
          {line}
        </p>
      );
      continue;
    }

    els.push(
      <p key={i} style={{ margin: '0.25rem 0 0.5rem', color: '#374151', lineHeight: 1.8, fontSize: '0.9375rem' }}>
        {line}
      </p>
    );
  }

  return <div>{els}</div>;
}

function TableCard({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const cell: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e5e7eb',
    fontSize: '0.8125rem',
    lineHeight: 1.6,
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{
      overflowX: 'auto',
      marginTop: '1rem',
      marginLeft: '-1rem',
      marginRight: '-1rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={{ ...cell, backgroundColor: '#1e3a5f', color: '#fff', fontWeight: 700 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#f9fafb' }}>
              {row.map((c, ci) => (
                <td key={ci} style={{
                  ...cell,
                  fontWeight: ci === 0 ? 600 : 400,
                  color: ci === 0 ? '#111827' : '#374151',
                  whiteSpace: ci === 0 ? 'nowrap' : 'normal',
                  maxWidth: ci === 0 ? '140px' : '200px',
                }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionCard({ section, isQuestion }: { section: Section; isQuestion?: boolean }) {
  return (
    <div>
      {section.heading && (
        isQuestion ? (
          <div style={{ padding: '1rem 1.25rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #2563eb', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Interview Question
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', lineHeight: 1.65, fontSize: '1rem' }}>
              {section.heading}
            </p>
          </div>
        ) : (
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d4ed8', margin: '0 0 1rem', paddingBottom: '0.4rem', borderBottom: '1px solid #dbeafe' }}>
            {section.heading}
          </h2>
        )
      )}
      {renderBody(section.body)}
      {section.table && <TableCard headers={section.table.headers} rows={section.table.rows} />}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ReferencePracticePage() {
  const { refId } = useParams<{ refId: string }>();
  const [doc, setDoc] = useState<ReferenceDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!refId) return;
    let alive = true;
    loadDoc(refId)
      .then((data) => { if (alive) { setDoc(data); setIndex(0); } })
      .catch((e) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [refId]);

  if (!doc && !error) return (
    <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
      <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>← Library</Link>
      <div style={{ marginTop: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading…</div>
    </div>
  );

  if (error || !doc) return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <p style={{ color: '#dc2626' }}>Error: {error}</p>
      <Link to="/" style={{ color: '#2563eb' }}>← Back to Library</Link>
    </div>
  );

  const sections = parseIntoSections(doc.id, doc.blocks);
  const total = sections.length;
  const current = sections[index];

  return (
    <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
      <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>← Library</Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0 2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: '#111827' }}>{doc.name}</h1>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{index + 1} / {total}</span>
      </div>

      <div style={{ height: '4px', backgroundColor: '#e5e7eb', borderRadius: '9999px', marginBottom: '2rem' }}>
        <div style={{ height: '100%', width: `${((index + 1) / total) * 100}%`, backgroundColor: '#0d9488', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', minHeight: '200px', overflow: 'hidden' }}>
        <SectionCard section={current} isQuestion={doc.id === 'follow-up-questions'} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: index === 0 ? '#f9fafb' : '#ffffff', color: index === 0 ? '#d1d5db' : '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: index === 0 ? 'not-allowed' : 'pointer' }}>
          ← Prev
        </button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '500px' }}>
          {sections.slice(0, 20).map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} title={sections[i].heading || `${i + 1}`}
              style={{ width: i === index ? '20px' : '8px', height: '8px', borderRadius: '9999px', border: 'none', backgroundColor: i === index ? '#0d9488' : i < index ? '#99f6e4' : '#e5e7eb', cursor: 'pointer', padding: 0, transition: 'all 0.2s ease' }} />
          ))}
          {total > 20 && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>+{total - 20}</span>}
        </div>

        <button onClick={() => setIndex((i) => Math.min(total - 1, i + 1))} disabled={index === total - 1}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: index === total - 1 ? '#e5e7eb' : '#0d9488', color: index === total - 1 ? '#9ca3af' : '#ffffff', fontWeight: 600, fontSize: '0.875rem', cursor: index === total - 1 ? 'not-allowed' : 'pointer' }}>
          Next →
        </button>
      </div>
    </div>
  );
}
