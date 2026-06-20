import { create } from 'zustand';

interface UIState {
  searchOpen: boolean;
  searchQuery: string;
  openModal: string | null;
  modalData: any;

  setSearchOpen: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  openModalWith: (id: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  searchQuery: '',
  openModal: null,
  modalData: null,

  setSearchOpen: (v) => set({ searchOpen: v, searchQuery: '' }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  openModalWith: (id, data) => set({ openModal: id, modalData: data }),
  closeModal: () => set({ openModal: null, modalData: null }),
}));
