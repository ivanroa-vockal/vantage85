import { useNavigate } from 'react-router-dom'
import {
  ChartPieIcon, CandlestickChartIcon, RouteIcon, LibraryBigIcon, ArrowRightIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

// ── types ──────────────────────────────────────────────────────────────────

type ProgressStat = {
  kind: 'progress'
  icon: ComponentType<{ className?: string }>
  title: string
  current: number
  max: number
  unit: string
  to: string
}

type NumberStat = {
  kind: 'number'
  icon: ComponentType<{ className?: string }>
  title: string
  value: number
  label: string
  to: string
}

type Stat = ProgressStat | NumberStat

// ── card components ────────────────────────────────────────────────────────

function ProgressCard({ stat }: { stat: ProgressStat }) {
  const navigate = useNavigate()
  const remaining = stat.max - stat.current
  const remainingPct = stat.max === 0 ? 0 : Math.round((remaining / stat.max) * 100)

  return (
    <Card
      className='group relative cursor-pointer transition-shadow hover:shadow-md'
      onClick={() => navigate(stat.to)}
    >
      <CardContent className='flex flex-col gap-4 p-5'>
        {/* Header */}
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Avatar className='size-8 rounded-md'>
              <AvatarFallback className='bg-primary/10 text-primary size-8 rounded-md'>
                <stat.icon className='size-4' />
              </AvatarFallback>
            </Avatar>
            <span className='text-sm font-medium'>{stat.title}</span>
          </div>
          <button
            type='button'
            onClick={(e) => { e.stopPropagation(); navigate(stat.to) }}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-muted-foreground',
              'opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all'
            )}
          >
            <ArrowRightIcon className='size-4' />
          </button>
        </div>

        {/* Remaining */}
        <div>
          <p className='text-xs text-muted-foreground mb-0.5'>Remaining</p>
          <p className='text-2xl font-semibold tracking-tight leading-none'>
            {remaining}
            <span className='text-muted-foreground ml-1.5 text-sm font-normal'>
              / {stat.max} {stat.unit}
            </span>
          </p>
        </div>

        {/* Progress */}
        <div className='flex flex-col gap-1.5'>
          <Progress value={remainingPct} className='h-1.5' />
          <span className='text-xs text-muted-foreground'>{remainingPct}% left</span>
        </div>
      </CardContent>
    </Card>
  )
}

function NumberCard({ stat }: { stat: NumberStat }) {
  const navigate = useNavigate()

  return (
    <Card
      className='group relative cursor-pointer transition-shadow hover:shadow-md'
      onClick={() => navigate(stat.to)}
    >
      <CardContent className='flex flex-col gap-4 p-5'>
        {/* Header */}
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Avatar className='size-8 rounded-md'>
              <AvatarFallback className='bg-primary/10 text-primary size-8 rounded-md'>
                <stat.icon className='size-4' />
              </AvatarFallback>
            </Avatar>
            <span className='text-sm font-medium'>{stat.title}</span>
          </div>
          <button
            type='button'
            onClick={(e) => { e.stopPropagation(); navigate(stat.to) }}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-muted-foreground',
              'opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all'
            )}
          >
            <ArrowRightIcon className='size-4' />
          </button>
        </div>

        {/* Value */}
        <div>
          <p className='text-2xl font-semibold tracking-tight leading-none'>{stat.value}</p>
          <p className='text-xs text-muted-foreground mt-1'>{stat.label}</p>
        </div>

      </CardContent>
    </Card>
  )
}

// ── main export ────────────────────────────────────────────────────────────

interface Props {
  scorecardsCompleted?: number
  scorecardsTotal?: number
  businessMetrics?: number
  tacticsCompleted?: number
  tacticsTotal?: number
  fileCount?: number
}

export function BusinessStats({
  scorecardsCompleted = 0,
  scorecardsTotal = 16,
  businessMetrics = 0,
  tacticsCompleted = 0,
  tacticsTotal = 0,
  fileCount = 0,
}: Props) {
  const stats: Stat[] = [
    {
      kind: 'progress',
      icon: ChartPieIcon,
      title: 'Scorecards',
      current: scorecardsCompleted,
      max: scorecardsTotal,
      unit: 'audits',
      to: '/scorecards',
    },
    {
      kind: 'number',
      icon: CandlestickChartIcon,
      title: 'Business Metrics',
      value: businessMetrics,
      label: 'metrics tracked',
      to: '/scorecards',
    },
    {
      kind: 'progress',
      icon: RouteIcon,
      title: 'Tactic Roadmap',
      current: tacticsCompleted,
      max: tacticsTotal,
      unit: 'tactics',
      to: '/roadmap',
    },
    {
      kind: 'number',
      icon: LibraryBigIcon,
      title: 'File Library',
      value: fileCount,
      label: 'files uploaded',
      to: '/file-library',
    },
  ]

  return (
    <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
      {stats.map((stat) =>
        stat.kind === 'progress'
          ? <ProgressCard key={stat.title} stat={stat} />
          : <NumberCard key={stat.title} stat={stat} />
      )}
    </div>
  )
}
