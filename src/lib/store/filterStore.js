import { create } from 'zustand'

export const useFilterStore = create((set) => ({
  category: 'all',
  search: '',
  featured: false,
  trending: false,
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  setFeatured: (featured) => set({ featured }),
  setTrending: (trending) => set({ trending }),
  reset: () => set({ category: 'all', search: '', featured: false, trending: false }),
}))
