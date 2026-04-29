import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      style={{
        border: 'none',
        background: 'var(--secondary-bg)',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.625rem',
        cursor: 'pointer',
        fontSize: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: 'var(--shadow-sm)',
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 1000
      }}
      title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
