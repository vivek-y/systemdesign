import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TextBlock  { type: 'text';  content: string }
interface TableBlock { type: 'table'; headers: string[]; rows: string[][] }
type DocBlock = TextBlock | TableBlock;

interface ReferenceDoc {
  id: string;
  name: string;
  blocks: DocBlock[];
}

// ── Text formatter ────────────────────────────────────────────────────────────

type ParsedLine =
  | { kind: 'title';    text: string }
  | { kind: 'h1';       text: string }
  | { kind: 'h2';       text: string }
  | { kind: 'question'; text: string }
  | { kind: 'example';  text: string }
  | { kind: 'bullet';   text: string }
  | { kind: 'numbered'; n: number; text: string }
  | { kind: 'rule';     text: string }
  | { kind: 'para';     text: string };

function parseTextBlock(raw: string): ParsedLine[] {
  const lines = raw.split('\n');
  const out: ParsedLine[] = [];
  let i = 0;
  let titleDone = false;
  const titleLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i].trim();
    i++;
    if (!line) continue;

    // ── Title (lines before first numbered section) ──────────────────────
    if (!titleDone) {
      const isSection =
        /^\d+\.\s/.test(line) || /^[IVX]+\.\s/.test(line) ||
        /^Pattern\s+\d+:/i.test(line) || /^Q:\s/.test(line);
      if (!isSection) { titleLines.push(line); continue; }
      if (titleLines.length) { out.push({ kind: 'title', text: titleLines.join(' ') }); titleLines.length = 0; }
      titleDone = true;
    }

    // ── Numbered top-level section ───────────────────────────────────────
    if (/^\d+\.\s+\S/.test(line) || /^[IVX]+\.\s+\S/.test(line)) {
      out.push({ kind: 'h1', text: line }); continue;
    }
    if (/^Pattern\s+\d+:/i.test(line)) {
      out.push({ kind: 'h1', text: line }); continue;
    }

    // ── Question ─────────────────────────────────────────────────────────
    if (/^Q:\s/.test(line)) {
      let q = line;
      while (i < lines.length && lines[i].trim() && !/^[Q■\x7f\d]/.test(lines[i].trim())) {
        q += ' ' + lines[i].trim(); i++;
      }
      out.push({ kind: 'question', text: q.replace(/^Q:\s*/, '') }); continue;
    }

    // ── Example callout ──────────────────────────────────────────────────
    if (line.startsWith('■')) {
      out.push({ kind: 'example', text: line.replace(/^■\s*/, '') }); continue;
    }

    // ── Bullet ───────────────────────────────────────────────────────────
    if (line.startsWith('\x7f') || line.startsWith('•') || line.startsWith('▪')) {
      let b = line.replace(/^[\x7f•▪]\s*/, '');
      while (i < lines.length) {
        const nl = lines[i].trim();
        if (!nl || nl.startsWith('\x7f') || nl.startsWith('•') || nl.startsWith('■') ||
            /^[Q:]/.test(nl) || /^\d+\.\s/.test(nl) || /^[IVX]+\.\s/.test(nl) ||
            /^Pattern\s+\d+:/i.test(nl)) break;
        b += ' ' + nl; i++;
      }
      out.push({ kind: 'bullet', text: b }); continue;
    }

    // ── Lone digit = numbered step ────────────────────────────────────────
    if (/^\d+$/.test(line)) {
      const n = parseInt(line, 10);
      let content = '';
      if (i < lines.length && lines[i].trim()) {
        content = lines[i].trim(); i++;
        while (i < lines.length && lines[i].trim() &&
               !/^\d+$/.test(lines[i].trim()) && !lines[i].trim().startsWith('\x7f') &&
               !lines[i].trim().startsWith('■')) {
          content += ' ' + lines[i].trim(); i++;
        }
      }
      if (content) out.push({ kind: 'numbered', n, text: content });
      continue;
    }

    // ── Rule / Pattern summary ────────────────────────────────────────────
    if (/^(Pattern|Rule):\s/i.test(line)) {
      out.push({ kind: 'rule', text: line }); continue;
    }

    // ── Sub-section heading ───────────────────────────────────────────────
    if (line.length < 60 && !line.endsWith('.') && !line.endsWith(',') &&
        /^[A-Z]/.test(line) && !/^(Used in|The |Once |These |Every |Distilled|Compiled)/.test(line)) {
      const nextLine = lines[i]?.trim() ?? '';
      if (nextLine.startsWith('\x7f') || nextLine.startsWith('•') || nextLine.startsWith('■') ||
          /^\d+$/.test(nextLine) || nextLine === '') {
        out.push({ kind: 'h2', text: line }); continue;
      }
    }

    // ── Paragraph ─────────────────────────────────────────────────────────
    let para = line;
    while (i < lines.length && lines[i].trim() &&
           !lines[i].trim().startsWith('\x7f') && !lines[i].trim().startsWith('•') &&
           !lines[i].trim().startsWith('■') && !/^Q:\s/.test(lines[i].trim()) &&
           !/^\d+\.\s/.test(lines[i].trim()) && !/^[IVX]+\.\s/.test(lines[i].trim()) &&
           !/^Pattern\s+\d+:/i.test(lines[i].trim()) && !/^\d+$/.test(lines[i].trim())) {
      para += ' ' + lines[i].trim(); i++;
    }
    out.push({ kind: 'para', text: para });
  }

  if (titleLines.length) out.push({ kind: 'title', text: titleLines.join(' ') });
  return out;
}

// ── Render helpers ────────────────────────────────────────────────────────────

const pre: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
};

function renderParsedLines(lines: ParsedLine[]): React.ReactNode[] {
  const els: React.ReactNode[] = [];
  let bullets: string[] = [];
  let numbered: { n: number; text: string }[] = [];

  function flushBullets() {
    if (!bullets.length) return;
    els.push(
      <ul key={`ul${els.length}`} style={{ paddingLeft: '1.5rem', margin: '0.4rem 0 0.9rem', lineHeight: 1.85 }}>
        {bullets.map((b, i) => <li key={i} style={{ color: '#374151', marginBottom: '0.15rem' }}>{b}</li>)}
      </ul>
    );
    bullets = [];
  }
  function flushNumbered() {
    if (!numbered.length) return;
    els.push(
      <ol key={`ol${els.length}`} style={{ paddingLeft: '1.5rem', margin: '0.4rem 0 0.9rem', lineHeight: 1.85 }}>
        {numbered.map((item, i) => <li key={i} style={{ color: '#374151', marginBottom: '0.25rem' }}>{item.text}</li>)}
      </ol>
    );
    numbered = [];
  }

  for (const ln of lines) {
    if (ln.kind !== 'bullet')   flushBullets();
    if (ln.kind !== 'numbered') flushNumbered();

    switch (ln.kind) {
      case 'title':
        // Skip — the page already shows the doc name as a heading
        break;
      case 'h1':
        els.push(
          <h2 key={els.length} style={{ margin: '2.25rem 0 0.5rem', fontSize: '1.05rem', fontWeight: 700,
            color: '#1d4ed8', paddingBottom: '0.3rem', borderBottom: '1px solid #dbeafe' }}>
            {ln.text}
          </h2>
        );
        break;
      case 'h2':
        els.push(
          <h3 key={els.length} style={{ margin: '1rem 0 0.3rem', fontSize: '0.75rem', fontWeight: 700,
            color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' } as React.CSSProperties}>
            {ln.text}
          </h3>
        );
        break;
      case 'question':
        els.push(
          <div key={els.length} style={{ margin: '1.5rem 0 0.5rem', padding: '0.75rem 1rem',
            backgroundColor: '#eff6ff', borderLeft: '3px solid #2563eb', borderRadius: '0 6px 6px 0' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', lineHeight: 1.65 }}>{ln.text}</p>
          </div>
        );
        break;
      case 'example':
        els.push(
          <div key={els.length} style={{ margin: '0.6rem 0', padding: '0.45rem 0.875rem',
            backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', borderRadius: '0 6px 6px 0',
            fontSize: '0.875rem', color: '#15803d' }}>
            <strong>Example:</strong> {ln.text.replace(/^Example:\s*/i, '')}
          </div>
        );
        break;
      case 'bullet':
        bullets.push(ln.text);
        break;
      case 'numbered':
        numbered.push(ln);
        break;
      case 'rule':
        els.push(
          <div key={els.length} style={{ margin: '0.9rem 0', padding: '0.6rem 1rem',
            backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '6px',
            fontSize: '0.875rem', color: '#713f12', ...pre }}>
            {ln.text}
          </div>
        );
        break;
      case 'para':
        els.push(
          <p key={els.length} style={{ margin: '0.4rem 0 0.7rem', color: '#374151', lineHeight: 1.8 }}>
            {ln.text}
          </p>
        );
        break;
    }
  }
  flushBullets();
  flushNumbered();
  return els;
}

// ── Table renderer ────────────────────────────────────────────────────────────

function ReferenceTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Mobile: stacked card layout ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ margin: '0.75rem 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* First cell as card header */}
            <div style={{
              backgroundColor: '#1e3a5f',
              color: '#ffffff',
              padding: '0.6rem 0.875rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              lineHeight: 1.5,
            }}>
              {row[0]}
            </div>
            {/* Remaining cells as label: value rows */}
            {row.slice(1).map((cell, ci) => (
              <div key={ci} style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                borderTop: '1px solid #f3f4f6',
                backgroundColor: ci % 2 === 0 ? '#ffffff' : '#f9fafb',
                alignItems: 'start',
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  paddingTop: '0.15rem',
                  whiteSpace: 'nowrap',
                }}>
                  {headers[ci + 1]}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                }}>
                  {cell}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop: standard table ──────────────────────────────────────────────
  const cellBase: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    verticalAlign: 'top',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
  };

  const thStyle: React.CSSProperties = {
    ...cellBase,
    backgroundColor: '#1e3a5f',
    color: '#ffffff',
    fontWeight: 700,
  };

  const tdStyle = (ci: number): React.CSSProperties => ({
    ...cellBase,
    color: ci === 0 ? '#111827' : '#374151',
    fontWeight: ci === 0 ? 600 : 400,
  });

  return (
    <div style={{ overflowX: 'auto', margin: '0.75rem 0 1.5rem' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.875rem',
        tableLayout: 'auto',
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={tdStyle(ci)}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function ReferencePage() {
  const { refId } = useParams<{ refId: string }>();
  const [doc, setDoc] = useState<ReferenceDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!refId) return;
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}data/reference/${refId}.json`)
      .then((r) => { if (!r.ok) throw new Error(`Failed to load: ${r.status}`); return r.json(); })
      .then((data: ReferenceDoc) => { setDoc(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [refId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading…</div>;
  if (error || !doc) return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <p style={{ color: '#dc2626' }}>Error: {error}</p>
      <Link to="/" style={{ color: '#2563eb' }}>← Back to Library</Link>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>
        ← Library
      </Link>
      <div style={{ marginTop: '1.5rem' }}>
        {doc.blocks.map((block, i) => {
          if (block.type === 'table') {
            return <ReferenceTable key={i} headers={block.headers} rows={block.rows} />;
          }
          // text block
          const parsed = parseTextBlock(block.content);
          return <div key={i}>{renderParsedLines(parsed)}</div>;
        })}
      </div>
    </div>
  );
}
