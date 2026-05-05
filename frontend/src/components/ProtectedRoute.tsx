import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { session, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-(--border) border-t-(--primary)' />
      </div>
    )
  }

  if (!session) {
    return <Navigate to='/login' replace />
  }

  return children ? <>{children}</> : <Outlet />
}
