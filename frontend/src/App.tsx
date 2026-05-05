import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { WorkspaceRoute } from '@/components/WorkspaceRoute'
import { useAuthStore } from '@/store/authStore'
import Dashboard from '@/pages/Dashboard'
import FigmaExplorer from '@/pages/FigmaExplorer'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import AuthCallback from '@/pages/AuthCallback'
import SelectWorkspace from '@/pages/SelectWorkspace'
import BusinessProfile from '@/pages/BusinessProfile'
import Roadmap from '@/pages/Roadmap'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function AppRoutes() {
  const { initialize, session, initialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-(--border) border-t-(--primary)' />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path='/login'
        element={session ? <Navigate to='/select-workspace' replace /> : <Login />}
      />
      <Route path='/auth/callback' element={<AuthCallback />} />
      <Route
        path='/select-workspace'
        element={
          <ProtectedRoute>
            <SelectWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <WorkspaceRoute>
              <AppLayout />
            </WorkspaceRoute>
          </ProtectedRoute>
        }
      >
        <Route path='/' element={<Dashboard />} />
        <Route path='/business-profile' element={<BusinessProfile />} />
        <Route path='/roadmap' element={<Roadmap />} />
        <Route path='/figma' element={<FigmaExplorer />} />
        <Route path='/settings' element={<Settings />} />
      </Route>
      <Route path='*' element={<Navigate to='/select-workspace' replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
