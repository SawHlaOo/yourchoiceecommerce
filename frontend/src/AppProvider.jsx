import { useCallback, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './AppRouter';
import { authApi } from './api/authApi';
import { AppContext, queryClient } from './appContext';

const THEME_MODE_KEY = 'theme-mode';

export default function AppProvider() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [mode, setModeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const storedMode = localStorage.getItem(THEME_MODE_KEY);
    return storedMode === 'dark' ? 'dark' : 'light';
  });
  const [user, setUser] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const setMode = useCallback((nextMode) => {
    const resolvedMode = typeof nextMode === 'function' ? nextMode(mode) : nextMode;
    const validMode = resolvedMode === 'dark' ? 'dark' : 'light';
    setModeState(validMode);
    localStorage.setItem(THEME_MODE_KEY, validMode);
  }, [mode]);

  const syncUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await authApi.verify();
      const nextUser = response?.user ?? response;
      setUser(nextUser ?? null);
      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  useEffect(() => {
    const handleStorage = () => {
      const storedMode = localStorage.getItem(THEME_MODE_KEY);
      if (storedMode === 'light' || storedMode === 'dark') {
        setModeState(storedMode);
      }

      const stored = localStorage.getItem('user');
      try {
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void syncUser();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [syncUser]);

  return (
    <AppContext.Provider value={{ mode, setMode, openDrawer, setOpenDrawer, user, setUser, syncUser }}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </AppContext.Provider>
  );
}
