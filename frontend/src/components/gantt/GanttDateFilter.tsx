import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { addDays, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format } from 'date-fns'
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type DateFilterValue = DateRange | undefined

const PRESETS = [
  {
    label: 'This week',
    getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }),
  },
  {
    label: 'Last week',
    getValue: () => {
      const last = subWeeks(new Date(), 1)
      return { from: startOfWeek(last, { weekStartsOn: 1 }), to: endOfWeek(last, { weekStartsOn: 1 }) }
    },
  },
  {
    label: 'This month',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Last month',
    getValue: () => {
      const last = subMonths(new Date(), 1)
      return { from: startOfMonth(last), to: endOfMonth(last) }
    },
  },
  {
    label: 'Last 3 months',
    getValue: () => ({ from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Last 6 months',
    getValue: () => ({ from: startOfMonth(subMonths(new Date(), 5)), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Next 3 months',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(addMonths(new Date(), 2)) }),
  },
  {
    label: 'Next 6 months',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(addMonths(new Date(), 5)) }),
  },
]

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return 'Filter by date'
  if (!range.to) return format(range.from, 'MMM d, yyyy')
  return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yyyy')}`
}

interface GanttDateFilterProps {
  value: DateFilterValue
  onChange: (value: DateFilterValue) => void
}

export function GanttDateFilter({ value, onChange }: GanttDateFilterProps) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const hasFilter = !!value?.from

  function applyPreset(preset: typeof PRESETS[0]) {
    setActivePreset(preset.label)
    onChange(preset.getValue())
  }

  function clearFilter() {
    setActivePreset(null)
    onChange(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-9 gap-1.5 text-sm', hasFilter && 'border-foreground text-foreground')}
        >
          <CalendarIcon className='size-3.5' />
          <span className='max-w-40 truncate'>{hasFilter ? formatRange(value) : 'Date range'}</span>
          <ChevronDownIcon className='size-3.5 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-auto p-0 overflow-hidden' align='end'>
        <div className='flex'>
          {/* Presets */}
          <div className='flex flex-col border-r p-2 gap-0.5 w-40'>
            <p className='px-2 py-1 text-xs font-medium text-muted-foreground'>Quick select</p>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors',
                  activePreset === preset.label && 'bg-muted font-medium'
                )}
              >
                {preset.label}
              </button>
            ))}
            {hasFilter && (
              <>
                <div className='my-1 border-t' />
                <button
                  onClick={clearFilter}
                  className='text-left px-2 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-muted transition-colors'
                >
                  Clear filter
                </button>
              </>
            )}
          </div>

          {/* Calendar */}
          <div className='p-3 min-w-[560px]'>
            <Calendar
              mode='range'
              selected={value}
              onSelect={(range) => {
                setActivePreset(null)
                onChange(range)
              }}
              numberOfMonths={2}
              defaultMonth={value?.from ?? addDays(new Date(), -30)}
              className='[--cell-size:2.5rem] w-full'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
