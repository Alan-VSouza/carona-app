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
      padding: '1rem 2rem',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <button
        onClick={handleBack}
        style={{
          background: 'var(--secondary-bg)',
          border: '1px solid var(--border)',
          width: '40px',
          height: '40px',
          borderRadius: '0.625rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '1.25rem'
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
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-primary)'
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
