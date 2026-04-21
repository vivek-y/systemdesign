import { useNavigate, useLocation } from 'react-router-dom';

// Only shown on mobile (≤768px) via CSS media query approach using inline style + window check
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  // Determine active section
  const isHome = path === '/';
  const isSystemDesign = path.startsWith('/attempt/');
  const isBehavioural = path.startsWith('/behavioural/');
  const isReference = path.startsWith('/reference');

  const tabs = [
    {
      label: 'Home',
      active: isHome,
      onClick: () => navigate('/'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'System Design',
      active: isSystemDesign,
      onClick: () => navigate('/'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      label: 'Behavioural',
      active: isBehavioural,
      onClick: () => navigate('/behavioural/scenarios'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      label: 'Reference',
      active: isReference,
      onClick: () => navigate('/reference-practice/cheat-sheet'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden behind the nav */}
      <div style={{ height: '64px', display: 'block' }} className="bottom-nav-spacer" />

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 100,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        // Only show on mobile — hide on desktop via paddingBottom trick
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={tab.onClick}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: tab.active ? '#0d9488' : '#9ca3af',
              padding: '0.25rem 0',
              transition: 'color 0.15s',
            }}
          >
            {tab.icon}
            <span style={{ fontSize: '0.625rem', fontWeight: tab.active ? 700 : 500, letterSpacing: '0.02em' }}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
