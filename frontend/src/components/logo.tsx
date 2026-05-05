import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center', className)}>
      <img src='/logo.png' alt='Vantage 85' className='h-8 w-auto' />
    </div>
  )
}

export default Logo
