import { useNavigate } from 'react-router-dom';

export function Header({ title, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 4vw, 2rem)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(0.75rem, 3vw, 1rem)'
    }}>
      <button
        onClick={handleBack}
        style={{
          background: 'var(--secondary-bg)',
          border: '1px solid var(--border)',
          width: 'clamp(36px, 10vw, 44px)',
          height: 'clamp(36px, 10vw, 44px)',
          minWidth: '36px',
          minHeight: '36px',
          borderRadius: '0.625rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-sm)',
          fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--tertiary-bg)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--secondary-bg)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        title="Voltar"
      >
        ←
      </button>
      <h2 style={{
        margin: 0,
        fontSize: 'clamp(1.0625rem, 5vw, 1.25rem)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {title}
      </h2>
    </header>
  );
}

export function HeaderDark() {
  return (
    <div style={{ height: '80px' }} />
  );
}
