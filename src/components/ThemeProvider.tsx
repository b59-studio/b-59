'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react';
import { DARK_QUERY, resolveTheme, THEME_KEY, type Theme } from '@/lib/theme';

const THEME_CHANGE = 'b59-theme-change';

function getThemeSnapshot(): Theme {
  return resolveTheme();
}

function getServerThemeSnapshot(): Theme {
  return 'light';
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  const query = window.matchMedia(DARK_QUERY);
  window.addEventListener(THEME_CHANGE, handler);
  window.addEventListener('storage', handler);
  // A reader who has not chosen is following their device, so follow it when
  // it switches — at sunset, on a schedule, or by hand — not only at load.
  query.addEventListener('change', handler);
  return () => {
    window.removeEventListener(THEME_CHANGE, handler);
    window.removeEventListener('storage', handler);
    query.removeEventListener('change', handler);
  };
}

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = resolveTheme() === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    window.dispatchEvent(new Event(THEME_CHANGE));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
