import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchIndex } from '../store/contentSlice';
import { clearProgress, hydrateProgress } from '../store/progressSlice';
import { loadAllProgressFromStorage } from '../store/localStorageMiddleware';
import type { Difficulty } from '../types/design';

// ── Mobile detection ───────────────────────────────────────────────────────
function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// ── Difficulty badge ───────────────────────────────────────────────────────
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy:   '#16a34a',
  Medium: '#d97706',
  Hard:   '#dc2626',
};

function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span style={{ color: DIFFICULTY_COLOR[level], fontWeight: 600, fontSize: '0.8125rem' }}>
      {level}
    </span>
  );
}

// ── PDF icon link ──────────────────────────────────────────────────────────
// On mobile: navigate to in-app /pdf viewer (has a Back button)
// On desktop: open in new tab

function WriteupBtn({ url, title }: { url: string; title: string }) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile()) {
      e.preventDefault();
      navigate(`/pdf?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`);
    }
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title="Open PDF"
      onClick={handleClick}
      style={{ color: '#0d9488', display: 'inline-flex', alignItems: 'center' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    </a>
  );
}

// ── Table header cell ──────────────────────────────────────────────────────
function Th({ children, width }: { children: React.ReactNode; width?: string }) {
  return (
    <th style={{ textAlign: 'left', padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', width, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────
function Accordion({ title, count, defaultOpen = true, children }: {
  title: string; count?: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', backgroundColor: '#f9fafb', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: open ? '1px solid #e5e7eb' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
          {count !== undefined && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', backgroundColor: '#e5e7eb', borderRadius: '9999px', padding: '0.1rem 0.5rem' }}>{count}</span>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div style={{ backgroundColor: '#ffffff' }}>{children}</div>}
    </div>
  );
}

// ── Action buttons (mobile card) ───────────────────────────────────────────
function ActionBtns({ label, onStart, onReset, pdfUrl, pdfTitle }: {
  label: string; onStart: () => void; onReset?: () => void; pdfUrl?: string; pdfTitle?: string;
}) {
  const btn: React.CSSProperties = { border: 'none', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 };
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {pdfUrl && <WriteupBtn url={pdfUrl} title={pdfTitle ?? ''} />}
      <button onClick={onStart} style={{ ...btn, backgroundColor: '#0d9488', color: '#ffffff' }}>{label}</button>
      {onReset && <button onClick={onReset} style={{ ...btn, backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #d1d5db' }}>↺</button>}
    </div>
  );
}

// ── Design section ─────────────────────────────────────────────────────────
interface DesignItem {
  id: string; name: string; difficulty: Difficulty; pdfUrl?: string;
  hasProgress: boolean; isCompleted: boolean;
  onStart: () => void; onStartOver: () => void;
}

function DesignSection({ items }: { items: DesignItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const btn: React.CSSProperties = { border: 'none', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 };

  return (
    <>
      <div className="library-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr><Th>Topic</Th><Th width="120px">Difficulty</Th><Th width="100px">Write-Up</Th><Th width="180px">Action</Th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)}
                style={{ backgroundColor: hovered === item.id ? '#f9fafb' : '#ffffff' }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem', color: '#111827', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.name}
                    {item.isCompleted && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>✓ Done</span>}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}><DifficultyBadge level={item.difficulty} /></td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                  {item.pdfUrl ? <WriteupBtn url={item.pdfUrl} title={item.name} /> : <span style={{ color: '#d1d5db' }}>—</span>}
                </td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={item.onStart} style={{ ...btn, backgroundColor: '#0d9488', color: '#ffffff' }}>
                      {item.hasProgress && !item.isCompleted ? 'Resume' : 'Start'}
                    </button>
                    {item.hasProgress && <button onClick={item.onStartOver} style={{ ...btn, backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #d1d5db' }}>↺ Reset</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="library-cards">
        {items.map((item) => (
          <div key={item.id} className="library-card">
            <div className="library-card-left">
              <div className="library-card-name">
                {item.name}
                {item.isCompleted && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>✓</span>}
              </div>
              <div className="library-card-meta"><DifficultyBadge level={item.difficulty} /></div>
            </div>
            <div className="library-card-actions">
              <ActionBtns
                label={item.hasProgress && !item.isCompleted ? 'Resume' : 'Start'}
                onStart={item.onStart}
                onReset={item.hasProgress ? item.onStartOver : undefined}
                pdfUrl={item.pdfUrl}
                pdfTitle={item.name}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Simple section (Reference + Behavioural) ───────────────────────────────
interface SimpleItem {
  id: string; name: string; description: string;
  onNavigate: () => void; pdfUrl: string;
}

function SimpleSection({ items }: { items: SimpleItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const btn: React.CSSProperties = { border: 'none', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600, backgroundColor: '#0d9488', color: '#ffffff' };

  return (
    <>
      <div className="library-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr><Th>Topic</Th><Th width="100px">Write-Up</Th><Th width="180px">Action</Th></tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const border = i < items.length - 1 ? '1px solid #f3f4f6' : 'none';
              return (
                <tr key={item.id} onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)}
                  style={{ backgroundColor: hovered === item.id ? '#f9fafb' : '#ffffff' }}>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: border }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>{item.description}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: border, width: '100px' }}><WriteupBtn url={item.pdfUrl} title={item.name} /></td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: border, width: '180px' }}><button onClick={item.onNavigate} style={btn}>Start</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="library-cards">
        {items.map((item) => (
          <div key={item.id} className="library-card">
            <div className="library-card-left">
              <div className="library-card-name">{item.name}</div>
              <div className="library-card-desc">{item.description}</div>
            </div>
            <div className="library-card-actions">
              <WriteupBtn url={item.pdfUrl} title={item.name} />
              <button onClick={item.onNavigate} style={{ ...btn, padding: '0.375rem 0.75rem' }}>Start</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
interface RefSummary { id: string; name: string; }

const REF_PDF: Record<string, string> = {
  'cheat-sheet':         'CheatSheet.pdf',
  'common-patterns':     'CommonPatterns.pdf',
  'follow-up-questions': 'FollowUpQuestions.pdf',
};

const REF_DESC: Record<string, string> = {
  'cheat-sheet':         'Quick-reference cards for system design concepts',
  'common-patterns':     'Reusable architectural patterns and when to use them',
  'follow-up-questions': 'Deep-dive questions interviewers commonly ask',
};

export default function LibraryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const index = useAppSelector((state) => state.content.index);
  const indexLoading = useAppSelector((state) => state.content.loading['__index__'] ?? false);
  const records = useAppSelector((state) => state.progress.records);
  const [refs, setRefs] = useState<RefSummary[]>([]);

  useEffect(() => {
    dispatch(fetchIndex());
    dispatch(hydrateProgress(loadAllProgressFromStorage()));
    fetch(`${import.meta.env.BASE_URL}data/reference/index.json`)
      .then((r) => r.ok ? r.json() : { references: [] })
      .then((data) => setRefs(data.references ?? []))
      .catch(() => setRefs([]));
  }, [dispatch]);

  if (indexLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading…</div>;

  if (!index || index.length === 0) return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Interview Prep</h1>
      <p style={{ color: '#6b7280' }}>No designs found.</p>
    </div>
  );

  const designItems: DesignItem[] = index.map((design) => {
    const progress = records[design.id] ?? null;
    const pdfUrl = design.pdfFile ? `${import.meta.env.BASE_URL}docs/system-design/${design.pdfFile}` : undefined;
    return {
      id: design.id, name: design.name, difficulty: design.difficulty ?? 'Medium', pdfUrl,
      hasProgress: progress !== null, isCompleted: progress?.completed ?? false,
      onStart: () => navigate(`/attempt/${design.id}`),
      onStartOver: () => { dispatch(clearProgress(design.id)); navigate(`/attempt/${design.id}`); },
    };
  });

  const refItems: SimpleItem[] = refs.map((ref) => ({
    id: ref.id, name: ref.name, description: REF_DESC[ref.id] ?? '',
    onNavigate: () => navigate(`/reference-practice/${ref.id}`),
    pdfUrl: REF_PDF[ref.id] ? `${import.meta.env.BASE_URL}docs/reference/${REF_PDF[ref.id]}` : '',
  }));

  const behaviouralItems: SimpleItem[] = [
    { id: 'scenarios', name: 'Scenarios', description: 'Interview questions mapped to prepared answers', onNavigate: () => navigate('/behavioural/scenarios'), pdfUrl: `${import.meta.env.BASE_URL}docs/behavioural/scenarios.pdf` },
    { id: 'stories',   name: 'Stories',   description: 'Personal leadership and engineering stories',    onNavigate: () => navigate('/behavioural/stories'),   pdfUrl: `${import.meta.env.BASE_URL}docs/behavioural/stories.pdf` },
  ];

  return (
    <div className="library-page" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>Interview Prep</h1>

      {refItems.length > 0 && (
        <Accordion title="Reference Docs" count={refItems.length}>
          <SimpleSection items={refItems} />
        </Accordion>
      )}

      <Accordion title="Behavioural" count={behaviouralItems.length}>
        <SimpleSection items={behaviouralItems} />
      </Accordion>

      <Accordion title="System Design" count={designItems.length}>
        <DesignSection items={designItems} />
      </Accordion>
    </div>
  );
}
