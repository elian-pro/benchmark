
import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-ds-theme') === 'dark') {
    return 'dark';
  }
  return 'light';
};

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-ds-theme', 'dark');
    } else {
      root.removeAttribute('data-ds-theme');
    }
    try {
      localStorage.setItem('ZEBRA_THEME', theme);
    } catch (e) {
      /* almacenamiento no disponible: el tema sigue aplicado en memoria */
    }
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Activar modo día' : 'Activar modo noche'}
      title={isDark ? 'Modo día' : 'Modo noche'}
      className="w-9 h-9 flex items-center justify-center text-muted hover:text-text hover:bg-surface-2 rounded-btn border border-line transition-all"
    >
      {isDark ? (
        // Sol (modo día). Icono lucide monolínea, stroke 1.5 (ZR-19).
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Luna (modo noche).
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
