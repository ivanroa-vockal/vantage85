import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { PencilIcon, CalendarIcon, TargetIcon, AlignLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tactic, TacticStatus, BusinessObjective } from '@/types/roadmap'

const STATUS_CONFIG: Record<TacticStatus, { label: string; dotColor: string }> = {
  planned:     { label: 'Planned',     dotColor: '#9ca3af' },
  in_progress: { label: 'In Progress', dotColor: '#3b82f6' },
  done:        { label: 'Done',        dotColor: '#22c55e' },
  blocked:     { label: 'Blocked',     dotColor: '#ef4444' },
}

const VALUE_DRIVER_LABELS: Record<string, string> = {
  digital_foundation:    'Digital foundation',
  revenue_growth_engine: 'Revenue growth engine',
  digital_efficiency:    'Digital efficiency',
  data_ai_readiness:     'Data & AI readiness',
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface GanttBarPopoverProps {
  tactic: Tactic
  objective?: BusinessObjective
  open: boolean
  position: { x: number; y: number }
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  readOnly?: boolean
}

function formatScope(objective: BusinessObjective): string {
  if (objective.scopeType === 'percentage') {
    return `${objective.scopeValue}%`
  }
  return objective.scopeUnit
    ? `${objective.scopeValue.toLocaleString()} ${objective.scopeUnit}`
    : objective.scopeValue.toLocaleString()
}

export function GanttBarPopover({ tactic, objective, open, position, onOpenChange, onEdit, readOnly = false }: GanttBarPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const statusCfg = STATUS_CONFIG[tactic.status]

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onOpenChange])

  if (!open) return null

  // Clamp so popover stays inside viewport
  const popoverWidth = 288
  const x = Math.min(position.x, window.innerWidth - popoverWidth - 16)
  const y = position.y - 8

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        transform: 'translateY(-100%)',
        zIndex: 9999,
        width: popoverWidth,
      }}
      className='rounded-lg border bg-popover text-popover-foreground shadow-md'
    >
      {/* Header */}
      <div className='px-4 py-3 border-b flex items-start justify-between gap-2'>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold leading-snug truncate'>{tactic.name}</p>
          <div className='flex items-center gap-1.5 mt-1'>
            <span className='size-1.5 rounded-full shrink-0' style={{ backgroundColor: statusCfg.dotColor }} />
            <span className='text-xs text-muted-foreground'>{statusCfg.label}</span>
            <span className='text-muted-foreground/40 text-xs'>·</span>
            <span className='text-xs font-medium'>{tactic.progress}%</span>
          </div>
        </div>
        {!readOnly && (
          <Button
            variant='ghost'
            size='icon'
            className='size-7 shrink-0 -mr-1 -mt-0.5'
            onClick={(e) => { e.stopPropagation(); onOpenChange(false); onEdit() }}
          >
            <PencilIcon className='size-3.5' />
          </Button>
        )}
      </div>

      {/* Body */}
      <div className='px-4 py-3 space-y-3'>
        {tactic.description && (
          <div className='flex gap-2'>
            <AlignLeftIcon className='size-3.5 text-muted-foreground shrink-0 mt-0.5' />
            <p className='text-xs text-muted-foreground leading-relaxed line-clamp-3'>
              {tactic.description}
            </p>
          </div>
        )}

        <div className='flex gap-2'>
          <TargetIcon className='size-3.5 text-muted-foreground shrink-0 mt-0.5' />
          <div className='flex-1 min-w-0'>
            <p className='text-xs text-muted-foreground'>Business objective</p>
            {objective ? (
              <div className='mt-1'>
                <Badge className='text-xs bg-primary/10 text-primary border-0 font-semibold pointer-events-none select-none'>
                  Target: {formatScope(objective)}
                </Badge>
              </div>
            ) : (
              <p className='text-xs text-muted-foreground mt-0.5 italic'>Undefined</p>
            )}
          </div>
        </div>

        {(tactic.startDate || tactic.endDate) && (
          <div className='flex gap-2'>
            <CalendarIcon className='size-3.5 text-muted-foreground shrink-0 mt-0.5' />
            <p className='text-xs text-muted-foreground'>
              {formatDate(tactic.startDate)} → {formatDate(tactic.endDate)}
            </p>
          </div>
        )}

        {tactic.dvcpCategory && (
          <Badge variant='outline' className='text-xs'>
            {VALUE_DRIVER_LABELS[tactic.dvcpCategory]}
          </Badge>
        )}
      </div>
    </div>,
    document.body
  )
}
