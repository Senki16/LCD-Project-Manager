import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  currentUser: User | null;
  activeProjectId: string | null;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setActiveProjectId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      currentUser: null,
      activeProjectId: null,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
    }),
    { name: 'lcd-app-store', partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed, currentUser: s.currentUser }) }
  )
);
