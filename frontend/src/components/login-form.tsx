import { useState } from 'react'
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth'
import { useNavigate } from 'react-router-dom'

interface LoginFormProps {
  onForgotPassword: () => void
}

const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = email.trim().length > 0 && password.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError(null)
    try {
      await authService.signInWithEmail(email, password)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='userEmail'>Email address*</Label>
        <Input
          type='email'
          id='userEmail'
          placeholder='Enter your email address'
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='password'>Password*</Label>
        <div className='relative'>
          <Input
            id='password'
            type={isVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            variant='ghost'
            size='icon'
            type='button'
            onClick={() => setIsVisible(prev => !prev)}
            className='absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent text-(--muted-foreground)'
          >
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <p className='text-sm text-(--destructive)'>{error}</p>
      )}

      <div className='flex items-center justify-between gap-y-2'>
        <div className='flex items-center gap-3'>
          <Checkbox id='rememberMe' />
          <Label htmlFor='rememberMe' className='text-(--muted-foreground)'>Remember Me</Label>
        </div>
        <button
          type='button'
          onClick={onForgotPassword}
          className='text-sm hover:underline'
        >
          Forgot Password?
        </button>
      </div>

      <Button className='w-full' type='submit' disabled={!isValid || loading}>
        {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Signing in...</> : 'Sign in to Vantage 85'}
      </Button>
    </form>
  )
}

export default LoginForm
