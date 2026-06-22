import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  ArrowLeftIcon, HomeIcon, ChevronRightIcon, ChevronDownIcon,
  DownloadIcon, CalendarIcon, SearchIcon, FilterIcon, AlertCircleIcon,
  RouteIcon, BarChart2Icon,
} from 'lucide-react'
import { Bar, BarChart, Cell } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import {
  GanttProvider, GanttSidebar, GanttSidebarItem, GanttSidebarGroup,
  GanttTimeline, GanttHeader, GanttFeatureList, GanttFeatureListGroup,
  GanttFeatureRow, GanttFeatureItemCard, GanttToday,
} from '@/components/kibo-ui/gantt'
import type { GanttFeature } from '@/components/kibo-ui/gantt'
import { GanttBarPopover } from '@/components/gantt/GanttBarPopover'
import { GanttDateFilter } from '@/components/gantt/GanttDateFilter'
import type { DateFilterValue } from '@/components/gantt/GanttDateFilter'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchOrganizations, fetchBusinesses } from '@/services/workspace'
import { fetchTactics } from '@/services/roadmap'
import { fetchObjectives } from '@/services/objectives'
import logoWordmarkUrl from '@/assets/logo-wordmark.png'
import type { Tactic, TacticStatus, TacticPriority, DvcpCategory, BusinessObjective } from '@/types/roadmap'
import type { Business, Organization } from '@/types/workspace'

// ── Constants ─────────────────────────────────────────────────────────────────

const DVCP_PILLARS = [
  {
    key: 'digital_foundation',
    label: 'Digital Foundation',
    desc: 'Covers compliance/risk and enablement.',
  },
  {
    key: 'revenue_growth_engine',
    label: 'Revenue Growth Engine',
    desc: 'Covers revenue drivers (e.g. increase leads).',
  },
  {
    key: 'digital_efficiency',
    label: 'Digital Efficiency',
    desc: 'Covers what we currently bucket in EBITDA.',
  },
  {
    key: 'data_ai_readiness',
    label: 'Data & AI Readiness',
    desc: 'New category that will have some overlap with Digital Foundation.',
  },
]

const STATUS_CONFIG: Record<TacticStatus, { label: string; className: string; dotColor: string }> = {
  planned:     { label: 'Planned',     className: 'bg-muted text-muted-foreground',                     dotColor: '#9ca3af' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',    dotColor: '#3b82f6' },
  done:        { label: 'Done',        className: 'bg-green-500/10 text-green-600 dark:text-green-400', dotColor: '#22c55e' },
  blocked:     { label: 'Blocked',     className: 'bg-destructive/10 text-destructive',                 dotColor: '#ef4444' },
}

const SCORE_BARS = 10

const scoreChartConfig: ChartConfig = { v: { label: 'Score' } }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function avgProgress(tactics: Tactic[]): number {
  if (!tactics.length) return 0
  return Math.round(tactics.reduce((sum, t) => sum + t.progress, 0) / tactics.length)
}

function pillarProgress(tactics: Tactic[], key: string): number {
  const f = tactics.filter((t) => t.dvcpCategory === key)
  if (!f.length) return 0
  return Math.round(f.reduce((sum, t) => sum + t.progress, 0) / f.length)
}

function formatLastUpdated(isoDate: string): string {
  const d = new Date(isoDate)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

function makeScoreBars(pct: number) {
  const filled = Math.round((pct * SCORE_BARS) / 100)
  return Array.from({ length: SCORE_BARS }, (_, i) => ({ v: i < filled ? 1 : 0.001 }))
}

function scoreColor(pct: number): string {
  if (pct < 40) return 'var(--destructive)'
  if (pct < 75) return 'var(--dvcp)'
  return '#22c55e'
}

function pillarBadgeClass(pct: number): string {
  if (pct < 40) return 'bg-destructive/10 text-destructive border-0'
  if (pct < 75) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0'
  return 'bg-green-500/10 text-green-600 dark:text-green-400 border-0'
}

function pillarBadgeLabel(pct: number): string {
  if (pct < 40) return 'Low'
  if (pct < 75) return 'Mid'
  return 'High'
}

function tacticProgressColor(progress: number): string {
  if (progress === 100) return '#22c55e'
  if (progress >= 51) return '#eab308'
  return '#9ca3af'
}

function tacticToFeature(t: Tactic): GanttFeature {
  const color = tacticProgressColor(t.progress)
  return {
    id: t.id,
    name: t.name,
    startAt: new Date(t.startDate!),
    endAt: new Date(t.endDate!),
    status: { id: t.status, name: STATUS_CONFIG[t.status].label, color },
  }
}

// ── Score bar chart ────────────────────────────────────────────────────────────

function ScoreBarChart({ pct }: { pct: number }) {
  const barData = makeScoreBars(pct)
  const color = scoreColor(pct)
  return (
    <ChartContainer config={scoreChartConfig} className='h-9 w-20'>
      <BarChart data={barData} margin={{ left: 0, right: 0 }} maxBarSize={16} accessibilityLayer>
        <Bar
          dataKey='v'
          radius={12}
          background={{ fill: 'color-mix(in oklab, var(--primary) 10%, transparent)', radius: 12 }}
        >
          {barData.map((entry, i) => (
            <Cell key={i} fill={entry.v > 0.001 ? color : 'transparent'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// ── Business info section ─────────────────────────────────────────────────────

function BusinessInfoSection({
  business,
  tactics,
}: {
  business: Business
  tactics: Tactic[]
}) {
  const avg = avgProgress(tactics)
  const score = Math.round(avg / 10)
  const lastUpdated = formatLastUpdated(business.createdAt)

  return (
    <div className='flex items-center gap-4'>
      <Avatar className='size-14 shrink-0 rounded-xl after:border-0'>
        {business.logoUrl && <AvatarImage src={business.logoUrl} alt='' className='object-cover' />}
        <AvatarFallback className='rounded-xl bg-muted text-base font-bold'>
          {getInitials(business.name)}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <p className='text-xl font-semibold leading-snug truncate'>{business.name}</p>
      </div>

      <div className='flex items-center gap-3 shrink-0'>
        <ScoreBarChart pct={avg} />
        <div className='text-left'>
          <p className='text-sm font-semibold leading-snug'>
            {score}
            <span className='text-muted-foreground font-normal text-xs'>/10</span>
            <span className='text-muted-foreground font-normal text-xs ml-1'>Overall Score</span>
          </p>
          <p className='text-xs text-muted-foreground whitespace-nowrap'>Last updated on {lastUpdated}</p>
        </div>
      </div>
    </div>
  )
}

// ── Digital Thesis section ────────────────────────────────────────────────────

function DigitalThesisSection({ description }: { description: string }) {
  const [showMore, setShowMore] = useState(false)
  const truncated = description.length > 200 && !showMore
  const displayed = truncated ? description.slice(0, 200) + '…' : description

  return (
    <div className='flex items-start justify-between gap-6'>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-semibold mb-2'>Digital Thesis</p>
        <p className='text-sm text-muted-foreground leading-relaxed'>{displayed}</p>
        {description.length > 200 && (
          <button
            onClick={() => setShowMore((v) => !v)}
            className='mt-1.5 text-xs font-medium text-primary hover:underline'
          >
            {showMore ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      <Button
        variant='outline'
        size='sm'
        className='shrink-0'
        onClick={() => window.print()}
      >
        <DownloadIcon className='size-3.5 mr-1.5' />
        Download DVCP
      </Button>
    </div>
  )
}

// ── DVCP Pillar cards ─────────────────────────────────────────────────────────

function PillarCard({
  pillar,
  tactics,
}: {
  pillar: (typeof DVCP_PILLARS)[number]
  tactics: Tactic[]
}) {
  const pillarTactics = tactics.filter((t) => t.dvcpCategory === (pillar.key as DvcpCategory))
  const pct = pillarProgress(tactics, pillar.key)
  const score = Math.round(pct / 10)

  return (
    <Card>
      <CardContent className='p-5 space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <p className='text-sm font-semibold leading-snug'>{pillar.label}</p>
          <Badge variant='outline' className='text-[10px] font-semibold shrink-0'>
            {pillarTactics.length} area{pillarTactics.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-bold tracking-tight'>
            {score}
            <span className='text-muted-foreground text-sm font-normal'>/10</span>
          </span>
          <Badge className={pillarBadgeClass(pct)}>
            {pillarBadgeLabel(pct)}
          </Badge>
        </div>
        <p className='text-xs text-muted-foreground leading-relaxed'>{pillar.desc}</p>
      </CardContent>
    </Card>
  )
}

// ── Read-only Gantt ────────────────────────────────────────────────────────────

const DVCP_GROUPS = [
  { id: 'digital_foundation',    label: 'Digital Foundation' },
  { id: 'revenue_growth_engine', label: 'Revenue Growth Engine' },
  { id: 'digital_efficiency',    label: 'Digital Efficiency' },
  { id: 'data_ai_readiness',     label: 'Data & AI Readiness' },
]

const VALUE_DRIVER_LABELS: Record<string, string> = {
  digital_foundation:    'Digital Foundation',
  revenue_growth_engine: 'Revenue Growth Engine',
  digital_efficiency:    'Digital Efficiency',
  data_ai_readiness:     'Data & AI Readiness',
}

function GanttBarRow({ tactic, feature, objective }: {
  tactic: Tactic
  feature: GanttFeature
  objective?: BusinessObjective
}) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  return (
    <GanttFeatureRow features={[feature]} onMove={() => {}}>
      {() => (
        <>
          <GanttFeatureItemCard
            id={feature.id}
            className='border-0 shadow-none cursor-pointer p-0 rounded-full overflow-hidden'
            style={{ backgroundColor: feature.status.color }}
            onSelect={() => {}}
          >
            <p
              className='flex-1 truncate text-xs font-medium text-white px-4'
              onPointerUp={(e) => {
                setMousePos({ x: e.clientX, y: e.clientY })
                setPopoverOpen((v) => !v)
              }}
            >
              {tactic.progress}% — {feature.name}
            </p>
          </GanttFeatureItemCard>
          <GanttBarPopover
            tactic={tactic}
            objective={objective}
            open={popoverOpen}
            position={mousePos}
            onOpenChange={setPopoverOpen}
            onEdit={() => {}}
            readOnly
          />
        </>
      )}
    </GanttFeatureRow>
  )
}

function ReadOnlyGantt({ tactics, objectives }: { tactics: Tactic[]; objectives: BusinessObjective[] }) {
  const [search, setSearch] = useState('')
  const [valueDriverFilter, setValueDriverFilter] = useState<DvcpCategory | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilterValue>(undefined)

  const filtered = useMemo(() =>
    tactics
      .filter((t) => !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => !valueDriverFilter || t.dvcpCategory === valueDriverFilter)
      .filter((t) => {
        if (!dateFilter?.from || !t.startDate || !t.endDate) return true
        const start = new Date(t.startDate)
        const end = new Date(t.endDate)
        const filterEnd = dateFilter.to ?? dateFilter.from
        return start <= filterEnd && end >= dateFilter.from
      }),
    [tactics, search, valueDriverFilter, dateFilter]
  )

  const withDates = filtered.filter((t) => t.startDate && t.endDate)
  const withoutDates = filtered.filter((t) => !t.startDate || !t.endDate)
  const hasActiveFilter = !!valueDriverFilter

  const featureMap = new Map(withDates.map((t) => [t.id, tacticToFeature(t)]))

  const grouped = DVCP_GROUPS
    .map((g) => ({ ...g, tactics: withDates.filter((t) => t.dvcpCategory === g.id) }))
    .filter((g) => g.tactics.length > 0)

  const uncategorized = withDates.filter((t) => !t.dvcpCategory)

  const allGroups = [
    ...grouped,
    ...(uncategorized.length > 0 ? [{ id: 'uncategorized', label: 'Uncategorized', tactics: uncategorized }] : []),
  ]

  return (
    <div className='flex flex-col gap-3'>
      {/* Filter bar */}
      <div className='flex items-center gap-2'>
        <div className='relative flex-1 max-w-xs'>
          <SearchIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
          <Input
            placeholder='Search tactics…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-9 pl-8 text-sm'
          />
        </div>
        <GanttDateFilter value={dateFilter} onChange={setDateFilter} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='icon' className={`h-9 w-9 ${hasActiveFilter ? 'border-foreground' : ''}`}>
              <FilterIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-52'>
            {hasActiveFilter && (
              <>
                <DropdownMenuItem
                  onClick={() => setValueDriverFilter(null)}
                  className='text-muted-foreground text-xs'
                >
                  Clear filter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <div className='px-2 py-1 text-xs font-medium text-muted-foreground'>Value driver</div>
            {Object.entries(VALUE_DRIVER_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setValueDriverFilter(valueDriverFilter === value ? null : value as DvcpCategory)}
                className='flex items-center justify-between'
              >
                {label}
                {valueDriverFilter === value && <span className='size-1.5 rounded-full bg-foreground shrink-0' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {withDates.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 gap-2 text-center text-muted-foreground'>
          <CalendarIcon className='size-7' />
          <p className='text-sm'>No tactics match the current filters.</p>
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border'>
          <GanttProvider zoom={100} range='monthly'>
            <GanttSidebar count={withDates.length}>
              {allGroups.map((g) => (
                <GanttSidebarGroup key={g.id} name={g.label}>
                  {g.tactics.map((t) => (
                    <GanttSidebarItem
                      key={t.id}
                      feature={featureMap.get(t.id)!}
                      onSelectItem={() => {}}
                      onDeleteItem={() => {}}
                    />
                  ))}
                </GanttSidebarGroup>
              ))}
            </GanttSidebar>
            <GanttTimeline>
              <GanttHeader />
              <GanttFeatureList>
                {allGroups.map((g) => (
                  <GanttFeatureListGroup key={g.id}>
                    {g.tactics.map((t) => (
                      <GanttBarRow
                        key={t.id}
                        tactic={t}
                        feature={featureMap.get(t.id)!}
                        objective={objectives.find((o) => o.id === t.objectiveId)}
                      />
                    ))}
                  </GanttFeatureListGroup>
                ))}
              </GanttFeatureList>
              <GanttToday />
            </GanttTimeline>
          </GanttProvider>
        </div>
      )}

      {withoutDates.length > 0 && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <AlertCircleIcon className='size-4 shrink-0' />
          <span>{withoutDates.length} tactic{withoutDates.length > 1 ? 's' : ''} not shown — missing start or end date.</span>
        </div>
      )}
    </div>
  )
}

// ── Tactics list ──────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TacticPriority, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'bg-muted text-muted-foreground' },
  medium:   { label: 'Medium',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  high:     { label: 'High',     className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  critical: { label: 'Critical', className: 'bg-destructive/15 text-destructive' },
}

function PriorityBadge({ priority }: { priority: TacticPriority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return <Badge className={`${cfg.className} border-0 font-medium`}>{cfg.label}</Badge>
}

function StatusBadge({ status }: { status: TacticStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <Badge className={`${cfg.className} border-0 font-medium`}>{cfg.label}</Badge>
}

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const DVCP_OPTIONS: { value: DvcpCategory | 'all'; label: string }[] = [
  { value: 'all',                  label: 'All value drivers' },
  { value: 'digital_foundation',   label: 'Digital Foundation' },
  { value: 'revenue_growth_engine',label: 'Revenue Growth Engine' },
  { value: 'digital_efficiency',   label: 'Digital Efficiency' },
  { value: 'data_ai_readiness',    label: 'Data & AI Readiness' },
]

function TacticsList({ tactics, objectives }: { tactics: Tactic[]; objectives: BusinessObjective[] }) {
  const [dvcpFilter, setDvcpFilter] = useState<DvcpCategory | 'all'>('all')

  const filtered = useMemo(() =>
    dvcpFilter === 'all' ? tactics : tactics.filter((t) => t.dvcpCategory === dvcpFilter),
    [tactics, dvcpFilter]
  )

  const tabs: { value: string; label: string; filter: (t: Tactic) => boolean }[] = [
    { value: 'all',         label: 'All',         filter: () => true },
    { value: 'planned',     label: 'To do',       filter: (t) => t.status === 'planned' },
    { value: 'in_progress', label: 'In Progress', filter: (t) => t.status === 'in_progress' },
    { value: 'done',        label: 'Done',        filter: (t) => t.status === 'done' },
  ]

  return (
    <div className='flex flex-col gap-3'>
      <Tabs defaultValue='all'>
        <div className='flex items-center justify-between gap-3 mb-3'>
          <TabsList>
            {tabs.map((tab) => {
              const count = filtered.filter(tab.filter).length
              return (
                <TabsTrigger key={tab.value} value={tab.value} className='gap-1.5'>
                  {tab.label}
                  <Badge variant='outline' className='text-[10px] font-semibold px-1.5 py-0 h-4'>
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-1.5 h-9 text-sm shrink-0'>
                <FilterIcon className='size-3.5' />
                {DVCP_OPTIONS.find((o) => o.value === dvcpFilter)?.label ?? 'All value drivers'}
                <ChevronDownIcon className='size-3.5 text-muted-foreground' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-52'>
              {DVCP_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setDvcpFilter(opt.value)}
                  className='flex items-center justify-between'
                >
                  {opt.label}
                  {dvcpFilter === opt.value && <span className='size-1.5 rounded-full bg-foreground shrink-0' />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {tabs.map((tab) => {
          const rows = filtered.filter(tab.filter)
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {rows.length === 0 ? (
                <p className='text-sm text-muted-foreground py-6 text-center'>No tactics in this category.</p>
              ) : (
                <div className='rounded-lg border overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50 text-muted-foreground'>
                      <tr>
                        <th className='text-left px-4 py-3 font-medium'>Tactic</th>
                        <th className='text-left px-4 py-3 font-medium'>Status</th>
                        <th className='text-left px-4 py-3 font-medium w-80'>Business objective</th>
                        <th className='text-left px-4 py-3 font-medium'>Start</th>
                        <th className='text-left px-4 py-3 font-medium'>End</th>
                        <th className='text-left px-4 py-3 font-medium w-40'>Progress</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {rows.map((t) => (
                        <tr key={t.id} className='hover:bg-muted/30 transition-colors'>
                          <td className='px-4 py-3'>
                            {t.dvcpCategory && (
                              <Badge variant='outline' className='text-[10px] font-medium mb-1'>
                                {VALUE_DRIVER_LABELS[t.dvcpCategory]}
                              </Badge>
                            )}
                            <p className='font-medium'>{t.name}</p>
                            {t.description && (
                              <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>{t.description}</p>
                            )}
                            {t.areas && t.areas.length > 0 && (
                              <div className='flex gap-1 mt-1 flex-wrap'>
                                {t.areas.map((a) => (
                                  <Badge key={a} variant='outline' className='text-xs py-0'>{a}</Badge>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className='px-4 py-3'><StatusBadge status={t.status} /></td>
                          <td className='px-4 py-3'>
                            {(() => {
                              const obj = objectives.find((o) => o.id === t.objectiveId)
                              return obj
                                ? <Badge className='bg-primary/10 text-primary border-0 font-semibold pointer-events-none'>{obj.name}</Badge>
                                : <span className='text-xs text-muted-foreground italic'>—</span>
                            })()}
                          </td>
                          <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>{formatDate(t.startDate)}</td>
                          <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>{formatDate(t.endDate)}</td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-2'>
                              <Progress value={t.progress} className='h-1.5 flex-1' />
                              <span className='text-xs text-muted-foreground w-8 text-right'>{t.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ClientBusiness() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orgId = params.get('org')
  const businessId = params.get('business')



  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    enabled: !!orgId,
  })

  const { data: allBusinesses = [], isLoading: bizLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
    enabled: !!orgId,
  })

  const { data: tactics = [], isLoading: tacticsLoading } = useQuery({
    queryKey: ['tactics', businessId],
    queryFn: () => fetchTactics(businessId!),
    enabled: !!businessId,
  })

  const { data: objectives = [] } = useQuery<BusinessObjective[]>({
    queryKey: ['objectives', businessId],
    queryFn: () => fetchObjectives(businessId!),
    enabled: !!businessId,
  })

  const org: Organization | undefined = useMemo(
    () => orgs.find((o) => o.id === orgId),
    [orgs, orgId]
  )

  const business: Business | undefined = useMemo(
    () => allBusinesses.find((b) => b.id === businessId),
    [allBusinesses, businessId]
  )

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const isLoading = orgsLoading || bizLoading || tacticsLoading



  if (!orgId || !businessId) {
    return (
      <div className='flex h-screen items-center justify-center text-muted-foreground text-sm'>
        Missing organization or business parameter.
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>

      {/* ── Dark primary band: topbar + breadcrumb ───────────────────────── */}
      <div className='bg-primary text-primary-foreground'>

        {/* Topbar */}
        <header className='sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 backdrop-blur-sm'>
          <div className='mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-8'>

            {/* Left: Vockal brand + org name */}
            <div className='flex items-center gap-3'>
              <img
                src={logoWordmarkUrl}
                alt='Vockal'
                className='h-5 w-auto object-contain brightness-0 invert'
              />
              <div className='h-4 w-px bg-primary-foreground/20' />
              {orgsLoading ? (
                <Skeleton className='h-4 w-40 bg-primary-foreground/20' />
              ) : (
                <span className='text-sm font-medium text-primary-foreground/80'>
                  {org?.name ?? 'Organization'}
                </span>
              )}
            </div>

            {/* Right: date + back */}
            <div className='flex items-center gap-3'>
              <span className='hidden font-mono text-[11px] text-primary-foreground/50 sm:block'>{today}</span>
              <button
                onClick={() => navigate(`/client-dashboard?org=${orgId}`)}
                className='inline-flex items-center gap-1.5 rounded-(--radius) border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/20'
              >
                <ArrowLeftIcon className='size-3' />
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className='mx-auto max-w-[1200px] px-8 py-3'>
          <nav className='flex items-center gap-1.5 text-xs text-primary-foreground/60'>
            <button
              onClick={() => navigate(`/client-dashboard?org=${orgId}`)}
              className='hover:text-primary-foreground transition-colors'
              aria-label='Home'
            >
              <HomeIcon className='size-3.5' />
            </button>
            <ChevronRightIcon className='size-3' />
            {bizLoading ? (
              <Skeleton className='h-3 w-32 bg-primary-foreground/20' />
            ) : (
              <span className='text-primary-foreground/80 font-medium'>
                {business?.name ?? 'Business'}
              </span>
            )}
          </nav>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className='mx-auto max-w-[1200px] px-8 py-8'>
        <Card>
          <CardContent className='p-6 space-y-6'>

            {/* Back button + title */}
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                className='size-8 shrink-0'
                onClick={() => navigate(-1)}
                aria-label='Go back'
              >
                <ArrowLeftIcon className='size-4' />
              </Button>
              <h1 className='text-lg font-semibold'>Business Profile</h1>
            </div>

            {/* Business info */}
            {isLoading ? (
              <div className='flex items-center gap-4'>
                <Skeleton className='size-14 rounded-xl shrink-0' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-48' />
                  <Skeleton className='h-4 w-64' />
                </div>
                <Skeleton className='h-9 w-28' />
              </div>
            ) : business ? (
              <>
                <BusinessInfoSection
                  business={business}
                  tactics={tactics}
                />

                <div className='space-y-6 pt-2'>

                  {/* Digital Thesis */}
                  {business.description ? (
                    <DigitalThesisSection description={business.description} />
                  ) : (
                    <div className='flex items-center justify-between gap-6'>
                      <div>
                        <p className='text-sm font-semibold mb-1'>Digital Thesis</p>
                        <p className='text-sm text-muted-foreground'>No digital thesis description available.</p>
                      </div>
                      <Button variant='outline' size='sm' onClick={() => window.print()}>
                        <DownloadIcon className='size-3.5 mr-1.5' />
                        Download DVCP
                      </Button>
                    </div>
                  )}

                  {/* DVCP Pillar cards */}
                  <div>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                      {DVCP_PILLARS.map((pillar) => (
                        <PillarCard key={pillar.key} pillar={pillar} tactics={tactics} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className='text-sm text-muted-foreground'>Business not found.</p>
            )}

            {/* Main tabs: Roadmap / Metrics */}
            {!isLoading && business && (
              <Tabs defaultValue='roadmap' className='pt-2'>
                <TabsList className='mb-6 w-full'>
                  <TabsTrigger value='roadmap' className='flex-1 gap-2'>
                    <RouteIcon className='size-4' />Roadmap
                  </TabsTrigger>
                  <TabsTrigger value='metrics' className='flex-1 gap-2'>
                    <BarChart2Icon className='size-4' />Metrics
                  </TabsTrigger>
                </TabsList>

                {/* ── Roadmap tab ── */}
                <TabsContent value='roadmap'>
                  <div className='flex flex-col gap-8'>
                    <div>
                      <div className='flex items-center gap-2 mb-3'>
                        <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                          Roadmap
                        </p>
                        <div className='h-px flex-1 bg-border' />
                      </div>
                      <ReadOnlyGantt tactics={tactics} objectives={objectives} />
                    </div>

                    <div>
                      <div className='flex items-center gap-2 mb-3'>
                        <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground'>
                          Tactics
                        </p>
                        <Badge variant='outline' className='text-[10px] font-semibold'>
                          {tactics.length}
                        </Badge>
                        <div className='h-px flex-1 bg-border' />
                      </div>
                      {tactics.length === 0 ? (
                        <p className='text-sm text-muted-foreground py-6 text-center'>No tactics found.</p>
                      ) : (
                        <TacticsList tactics={tactics} objectives={objectives} />
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Metrics tab ── */}
                <TabsContent value='metrics'>
                  <div className='flex flex-col gap-6'>
                    <div className='flex items-center gap-2'>
                      <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap'>
                        Corral Data Dashboards
                      </p>
                      <div className='h-px flex-1 bg-border' />
                    </div>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className='rounded-lg border bg-muted/30 overflow-hidden'
                          style={{ minHeight: 280 }}
                        >
                          <div className='flex items-center justify-between px-4 py-2.5 border-b bg-background'>
                            <span className='text-xs font-medium text-muted-foreground'>Dashboard {n}</span>
                            <Badge variant='outline' className='text-[10px] pointer-events-none'>Corral Data</Badge>
                          </div>
                          <div className='flex flex-col items-center justify-center h-[240px] gap-2 text-muted-foreground/40'>
                            <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                              <rect x='3' y='3' width='18' height='18' rx='2' />
                              <path d='M3 9h18M9 21V9' />
                            </svg>
                            <span className='text-xs'>Embed URL pending</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {isLoading && (
              <div className='flex flex-col gap-8 pt-2'>
                {[0, 1].map((i) => (
                  <div key={i} className='space-y-3'>
                    <Skeleton className='h-4 w-24' />
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className='h-10 w-full rounded-lg' />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className='border-t mt-auto'>
        <div className='mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4'>
          <span className='text-[11px] text-muted-foreground'>@2025 Vantage 85 · Powered by VOKAL</span>
          <span className='font-mono text-[11px] text-muted-foreground'>Confidential</span>
        </div>
      </footer>
    </div>
  )
}
