import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

const ALLOWED_DOMAIN = 'vokal.io'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      const email = data.session?.user?.email ?? ''
      const domain = email.split('@')[1]

      if (domain !== ALLOWED_DOMAIN) {
        await supabase.auth.signOut()
        setError(`Access restricted to @${ALLOWED_DOMAIN} accounts.`)
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      navigate('/select-workspace')
    }

    handleCallback()
  }, [navigate])

  return (
    <div className='flex h-screen flex-col items-center justify-center gap-4'>
      {error ? (
        <div className='text-center space-y-2'>
          <p className='text-sm font-medium text-(--destructive)'>{error}</p>
          <p className='text-xs text-(--muted-foreground)'>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <Loader2 className='h-8 w-8 animate-spin text-(--primary)' />
          <p className='text-sm text-(--muted-foreground)'>Signing you in...</p>
        </>
      )}
    </div>
  )
}
