import { Navigate } from 'react-router-dom'
import { useWorkspaceStore } from '@/store/workspaceStore'

export function WorkspaceRoute({ children }: { children: React.ReactNode }) {
  const { selected } = useWorkspaceStore()

  if (!selected) {
    return <Navigate to='/select-workspace' replace />
  }

  return <>{children}</>
}
