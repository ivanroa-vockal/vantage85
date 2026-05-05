import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryBar } from '@/components/ui/category-bar'
import { cn } from '@/lib/utils'
import type { Tactic, TacticStatus } from '@/types/roadmap'

const STATUS_SEGMENTS: { status: TacticStatus; label: string; color: string }[] = [
  { status: 'done',        label: 'Done',        color: 'bg-green-500' },
  { status: 'in_progress', label: 'In progress',  color: 'bg-blue-500' },
  { status: 'planned',     label: 'Planned',      color: 'bg-[var(--muted-foreground)]/40' },
  { status: 'blocked',     label: 'Blocked',      color: 'bg-destructive' },
]

interface TacticsStatsCardProps {
  tactics: Tactic[]
  className?: string
}

export function TacticsStatsCard({ tactics, className }: TacticsStatsCardProps) {
  const total = tactics.length

  const counts = STATUS_SEGMENTS.map((s) => ({
    ...s,
    count: tactics.filter((t) => t.status === s.status).length,
  }))

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div>
        <p className='text-sm text-muted-foreground'>Total tactics</p>
        <p className='text-3xl font-semibold tracking-tight'>{total}</p>
      </div>

      <div className='space-y-2'>
        <p className='text-muted-foreground text-sm'>Status distribution</p>
        <CategoryBar
          values={counts.map((s) => s.count)}
          colors={counts.map((s) => s.color)}
          showLabels={false}
        />
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {counts.map((s) => {
          const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : '0.0'

          return (
            <Card key={s.status} className='rounded-md shadow-none'>
              <CardContent className='flex items-center gap-3 px-4 py-3'>
                <div className={cn('h-6 w-1 rounded-full shrink-0', s.color)} />
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-sm font-medium'>{s.label}</span>
                    <Badge variant='secondary' className='h-4 px-1.5 text-xs font-medium rounded-full'>
                      {s.count}
                    </Badge>
                  </div>
                  <p className='text-base font-semibold tabular-nums leading-none'>
                    {pct}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
