import { ArrowUpRightIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryBar } from '@/components/ui/category-bar'

import { cn } from '@/lib/utils'

type ChannelSegment = {
  label: string
  value: number
  color: string
}

export type RevenueDistributionCardProps = {
  title: string
  subtitle: string
  valuePrefix?: string
  streams: ChannelSegment[]
  className?: string
}

const RevenueDistributionCard = ({
  title,
  subtitle,
  valuePrefix = '',
  streams,
  className
}: RevenueDistributionCardProps) => {
  const total = streams.reduce((sum, s) => sum + s.value, 0)

  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader>
        <CardDescription className='text-base'>{title}</CardDescription>
        <CardTitle className='text-3xl tracking-tight'>
          {valuePrefix}
          {total.toLocaleString()}
        </CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <div className='space-y-2'>
          <p className='text-muted-foreground text-sm'>{subtitle}</p>
          <CategoryBar values={streams.map(s => s.value)} colors={streams.map(s => s.color)} showLabels={false} />
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {streams.map(s => {
            const pct = ((s.value / total) * 100).toFixed(1)
            const formatted = `${valuePrefix}${(s.value / 1000).toFixed(1)}K`

            return (
              <a href='#' key={s.label} className='group'>
                <Card className='rounded-md py-2 shadow-none transition-shadow duration-300 group-hover:shadow-md'>
                  <CardContent className='flex items-center gap-3 px-4'>
                    <div className={cn('h-9 w-1 rounded-full', s.color)} />
                    <div className='flex grow items-center justify-between'>
                      <div className='space-y-1'>
                        <span className='text-sm font-medium'>{s.label}</span>
                        <p className='text-lg font-semibold tabular-nums'>
                          {pct}%<span className='text-muted-foreground text-base font-normal'> - {formatted}</span>
                        </p>
                      </div>
                      <ArrowUpRightIcon className='text-muted-foreground group-hover:text-foreground size-3.5 transition-colors duration-300' />
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default RevenueDistributionCard
