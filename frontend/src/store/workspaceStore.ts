import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SelectedWorkspace } from '@/types/workspace'

interface WorkspaceState {
  selected: SelectedWorkspace | null
  setWorkspace: (ws: SelectedWorkspace) => void
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selected: null,
      setWorkspace: (selected) => set({ selected }),
      clearWorkspace: () => set({ selected: null }),
    }),
    { name: 'vantage85-workspace' }
  )
)
