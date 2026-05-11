import { create } from 'zustand'

export const useFilterStore = create((set) => ({
  category: 'all',
  search: '',
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  reset: () => set({ category: 'all', search: '' }),
}))
