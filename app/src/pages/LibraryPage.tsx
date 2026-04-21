import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchIndex } from '../store/contentSlice';
import { clearProgress, hydrateProgress } from '../store/progressSlice';
import { loadAllProgressFromStorage } from '../store/localStorageMiddleware';
import type { Difficulty } from '../types/design';

// ── Difficulty badge ───────────────────────────────────────────────────────

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy:   '#16a34a',
  Medium: '#d97706',
  Hard:   '#dc2626',
};

function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span style={{ color: DIFFICULTY_COLOR[level], fontWeight: 600, fontSize: '0.875rem' }}>
      {level}
    </span>
  );
}

// ── PDF icon link ──────────────────────────────────────────────────────────

function WriteupLink({ pdfFile, href }: { pdfFile?: string; href?: string }) {
  const url = href ?? (pdfFile ? `${import.meta.env.BASE_URL}docs/system-design/${pdfFile}` : undefined);
  if (!url) return <span style={{ color: '#d1d5db' }}>—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title="Open PDF"
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
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          backgroundColor: '#f9fafb',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: open ? '1px solid #e5e7eb' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          {count !== undefined && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', backgroundColor: '#e5e7eb', borderRadius: '9999px', padding: '0.1rem 0.5rem' }}>
              {count}
            </span>
          )}
        </div>
        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div style={{ backgroundColor: '#ffffff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Design row ─────────────────────────────────────────────────────────────

interface DesignRowProps {
  name: string;
  difficulty: Difficulty;
  pdfFile?: string;
  hasProgress: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onStartOver: () => void;
}

function DesignRow({ name, difficulty, pdfFile, hasProgress, isCompleted, onStart, onStartOver }: DesignRowProps) {
  const [hovered, setHovered] = useState(false);
  const btn: React.CSSProperties = { border: 'none', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 };

  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered ? '#f9fafb' : '#ffffff' }}>
      <td style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem', color: '#111827', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {name}
          {isCompleted && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>✓ Done</span>
          )}
        </span>
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
        <DifficultyBadge level={difficulty} />
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
        <WriteupLink pdfFile={pdfFile} />
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={onStart} style={{ ...btn, backgroundColor: '#0d9488', color: '#ffffff' }}>
            {hasProgress && !isCompleted ? 'Resume' : 'Start'}
          </button>
          {hasProgress && (
            <button onClick={onStartOver} style={{ ...btn, backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #d1d5db' }}>
              ↺ Reset
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Behavioural row ────────────────────────────────────────────────────────

interface BehaviouralRowProps {
  name: string;
  description: string;
  sectionId: string;
  pdfFile: string;
}

function BehaviouralRow({ name, description, sectionId, pdfFile }: BehaviouralRowProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const pdfHref = `${import.meta.env.BASE_URL}docs/behavioural/${pdfFile}`;

  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered ? '#f9fafb' : '#ffffff' }}>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>{name}</div>
        <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>{description}</div>
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', width: '100px' }}>
        <WriteupLink href={pdfHref} />
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', width: '180px' }}>
        <button onClick={() => navigate(`/behavioural/${sectionId}`)}
          style={{ border: 'none', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600, backgroundColor: '#0d9488', color: '#ffffff' }}>
          Start
        </button>
      </td>
    </tr>
  );
}

// ── Reference row ──────────────────────────────────────────────────────────

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

interface RefSummary { id: string; name: string; }

function RefRow({ item, isLast, onNavigate }: { item: RefSummary; isLast: boolean; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(false);
  const pdfHref = REF_PDF[item.id] ? `${import.meta.env.BASE_URL}docs/reference/${REF_PDF[item.id]}` : undefined;
  const border = isLast ? 'none' : '1px solid #f3f4f6';

  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered ? '#f9fafb' : '#ffffff' }}>
      <td style={{ padding: '0.75rem 1rem', borderBottom: border }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>{item.name}</div>
        <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>{REF_DESC[item.id] ?? ''}</div>
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: border, width: '100px' }}>
        <WriteupLink href={pdfHref} />
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: border, width: '180px' }}>
        <button onClick={onNavigate}
          style={{ border: 'none', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600, backgroundColor: '#0d9488', color: '#ffffff' }}>
          Start
        </button>
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

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

  if (indexLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading…</div>;
  }

  if (!index || index.length === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>System Design Interview App</h1>
        <p style={{ color: '#6b7280' }}>No designs found.</p>
      </div>
    );
  }

  const makeDesignRows = (designs: typeof index) =>
    designs.map((design) => {
      const progress = records[design.id] ?? null;
      return (
        <DesignRow
          key={design.id}
          name={design.name}
          difficulty={design.difficulty ?? 'Medium'}
          pdfFile={design.pdfFile}
          hasProgress={progress !== null}
          isCompleted={progress?.completed ?? false}
          onStart={() => navigate(`/attempt/${design.id}`)}
          onStartOver={() => { dispatch(clearProgress(design.id)); navigate(`/attempt/${design.id}`); }}
        />
      );
    });

  const behaviouralItems: BehaviouralRowProps[] = [
    { name: 'Scenarios', description: 'Interview questions mapped to prepared answers', sectionId: 'scenarios', pdfFile: 'scenarios.pdf' },
    { name: 'Stories',   description: 'Personal leadership and engineering stories',    sectionId: 'stories',   pdfFile: 'stories.pdf'   },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>
        Interview Prep
      </h1>

      {/* ── Reference Docs ──────────────────────────────────────────────── */}
      {refs.length > 0 && (
        <Accordion title="Reference Docs" count={refs.length}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr><Th>Topic</Th><Th width="100px">Write-Up</Th><Th width="180px">Action</Th></tr>
            </thead>
            <tbody>
              {refs.map((ref, i) => (
                <RefRow key={ref.id} item={ref} isLast={i === refs.length - 1} onNavigate={() => navigate(`/reference-practice/${ref.id}`)} />
              ))}
            </tbody>
          </table>
        </Accordion>
      )}

      {/* ── Behavioural ─────────────────────────────────────────────────── */}
      <Accordion title="Behavioural" count={behaviouralItems.length}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr><Th>Topic</Th><Th width="100px">Write-Up</Th><Th width="180px">Action</Th></tr>
          </thead>
          <tbody>
            {behaviouralItems.map((item) => <BehaviouralRow key={item.sectionId} {...item} />)}
          </tbody>
        </table>
      </Accordion>

      {/* ── System Design ───────────────────────────────────────────────── */}
      <Accordion title="System Design" count={index.length}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <Th>Topic</Th>
              <Th width="120px">Difficulty</Th>
              <Th width="100px">Write-Up</Th>
              <Th width="180px">Action</Th>
            </tr>
          </thead>
          <tbody>{makeDesignRows(index)}</tbody>
        </table>
      </Accordion>
    </div>
  );
}
