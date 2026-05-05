import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Logo from '@/components/logo'
import LogoVector from '@/assets/svg/logo-vector'
import LoginForm from '@/components/login-form'
import { authService } from '@/services/auth'

const GoogleIcon = () => (
  <svg viewBox='0 0 24 24' className='size-4' xmlns='http://www.w3.org/2000/svg'>
    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z' fill='#FBBC05' />
    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
  </svg>
)

const MagicLinkForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isValid = email.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError(null)
    try {
      await authService.sendMagicLink(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className='space-y-3 rounded-lg border border-(--border) bg-(--muted) p-4 text-center'>
        <p className='text-sm font-medium'>Check your inbox</p>
        <p className='text-sm text-(--muted-foreground)'>
          We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
        </p>
        <Button variant='ghost' size='sm' onClick={() => { setSent(false); setEmail('') }}>
          Use a different email
        </Button>
      </div>
    )
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='clientEmail'>Email address*</Label>
        <Input
          type='email'
          id='clientEmail'
          placeholder='Enter your email address'
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && <p className='text-sm text-(--destructive)'>{error}</p>}
      <Button className='w-full' type='submit' disabled={!isValid || loading}>
        {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Sending...</> : 'Send magic link'}
      </Button>
      <p className='text-(--muted-foreground) text-center text-sm'>
        Need help?{' '}
        <a href='#' className='text-(--foreground) hover:underline font-medium'>Contact support</a>
      </p>
    </form>
  )
}

const ForgotPasswordView = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isValid = email.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError(null)
    try {
      await authService.sendPasswordReset(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-1 text-2xl font-semibold'>Forgot Password?</h2>
        <p className='text-(--muted-foreground)'>No worries, we'll send you reset instructions.</p>
      </div>

      {sent ? (
        <div className='space-y-3 rounded-lg border border-(--border) bg-(--muted) p-4 text-center'>
          <p className='text-sm font-medium'>Check your inbox</p>
          <p className='text-sm text-(--muted-foreground)'>
            We sent reset instructions to <strong>{email}</strong>.
          </p>
        </div>
      ) : (
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-1'>
            <Label className='leading-5' htmlFor='resetEmail'>Email address*</Label>
            <Input
              type='email'
              id='resetEmail'
              placeholder='Enter your email address'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className='text-sm text-(--destructive)'>{error}</p>}
          <Button className='w-full' type='submit' disabled={!isValid || loading}>
            {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Sending...</> : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <Button variant='ghost' className='w-full group' type='button' onClick={onBack}>
        <ArrowLeft className='h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5' />
        Back to login
      </Button>
    </div>
  )
}

const Login = () => {
  const [showForgot, setShowForgot] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await authService.signInWithGoogle()
    } catch {
      setGoogleLoading(false)
    }
  }

  return (
    <div className='h-dvh lg:grid lg:grid-cols-2'>
      {/* Left — Decorative panel */}
      <div className='bg-(--muted) h-screen p-5 max-lg:hidden'>
        <Card className='bg-(--primary) relative h-full overflow-hidden border-none py-8 flex flex-col'>
          <CardHeader className='gap-6 px-8'>
            <CardTitle className='text-(--primary-foreground) text-2xl font-bold lg:text-3xl xl:text-4xl/tight'>
              Powered by our Digital Value Creation Plan (DVCP)
            </CardTitle>
            <p className='text-(--primary-foreground) text-xl opacity-80'>
              The platform generates a digital scorecard to quickly understand a company's digital maturity. It maps high-impact growth opportunities across marketing, data, and technology, and creates an actionable roadmap to track how performance improves over time.
            </p>
            <div className='flex justify-center w-full mt-[30px]'>
              <img
                src='/login-preview.png'
                alt='Platform preview'
                width={458}
                height={334}
                className='w-full max-w-[458px] rounded-2xl object-contain drop-shadow-xl'
              />
            </div>
          </CardHeader>

          <LogoVector className='text-(--primary-foreground)/10 pointer-events-none absolute bottom-30 -left-50 size-130' />

          <div className='px-8 pb-8 mt-auto flex items-center justify-center gap-4'>
            <p className='text-sm' style={{ color: 'var(--ring)' }}>Powered By:</p>
            <img src='/vokal-logo.png' alt='Vokal' className='h-5 w-auto opacity-60' />
          </div>
        </Card>
      </div>

      {/* Right — Form */}
      <div className='flex h-full items-center justify-center sm:px-6 md:px-8'>
        <div className='flex w-full flex-col gap-6 p-6 sm:max-w-lg'>

          {!showForgot && <Logo className='gap-3' />}

          {showForgot ? (
            <ForgotPasswordView onBack={() => setShowForgot(false)} />
          ) : (
            <>
              <div>
                <h2 className='mb-1 text-2xl font-semibold'>Welcome to the Admin Platform</h2>
                <p className='text-(--muted-foreground)'>Sign in to continue</p>
              </div>

              <Tabs defaultValue='admin' className='w-full'>
                <TabsList className='w-full'>
                  <TabsTrigger value='admin' className='flex-1'>Admin</TabsTrigger>
                  <TabsTrigger value='client' className='flex-1'>Client</TabsTrigger>
                </TabsList>

                <TabsContent value='admin' className='mt-6 space-y-6'>
                  <Button
                    variant='outline'
                    className='w-full gap-3'
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    type='button'
                  >
                    {googleLoading
                      ? <Loader2 className='h-4 w-4 animate-spin' />
                      : <GoogleIcon />
                    }
                    Continue with Google
                  </Button>

                  <div className='flex items-center gap-4'>
                    <Separator className='flex-1' />
                    <p className='text-sm text-(--muted-foreground) whitespace-nowrap'>Or continue with Email</p>
                    <Separator className='flex-1' />
                  </div>

                  <div className='space-y-4'>
                    <LoginForm onForgotPassword={() => setShowForgot(true)} />
                    <p className='text-(--muted-foreground) text-center text-sm'>
                      Need help?{' '}
                      <a href='#' className='text-(--foreground) hover:underline font-medium'>Contact support</a>
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value='client' className='mt-6'>
                  <MagicLinkForm />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
