import { useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/stores/appStore';
import { useUIStore } from '@/stores/uiStore';
import { usersApi } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import FilesPage from '@/pages/FilesPage';
import CalendarPage from '@/pages/CalendarPage';
import Models3DPage from '@/pages/Models3DPage';
import SettingsPage from '@/pages/SettingsPage';
import SearchModal from '@/components/ui/SearchModal';

export default function App() {
  const { theme, setCurrentUser } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.matches ? root.classList.add('dark') : root.classList.remove('dark');
      const handler = (e: MediaQueryListEvent) =>
        e.matches ? root.classList.add('dark') : root.classList.remove('dark');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  // Auto-select first user as current user
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then((r) => r.data),
  });

  const { currentUser } = useAppStore();
  useEffect(() => {
    if (users?.length && !currentUser) setCurrentUser(users[0]);
  }, [users, currentUser, setCurrentUser]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useUIStore.getState().setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <BrowserRouter>
      <SearchModal />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="models" element={<Models3DPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
