import { useState, useMemo, useEffect } from 'react'
import {
  KanbanProvider, KanbanBoard, KanbanHeader, KanbanCards, KanbanCard as KanbanCardItem,
} from '@/components/kibo-ui/kanban'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon, Route, CalendarIcon, AlertCircleIcon,
  MoreHorizontalIcon, PencilIcon, Trash2Icon, SearchIcon, SlidersHorizontalIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog'
import {
  GanttProvider, GanttSidebar, GanttSidebarItem, GanttSidebarGroup,
  GanttTimeline, GanttHeader, GanttFeatureList, GanttFeatureListGroup,
  GanttFeatureRow, GanttFeatureItemCard,
  GanttToday,
} from '@/components/kibo-ui/gantt'
import type { GanttFeature } from '@/components/kibo-ui/gantt'
import { CreateTacticModal } from '@/components/modals/CreateTacticModal'
import { TacticsStatsCard } from '@/components/blocks/TacticsStatsCard'
import { fetchTactics, deleteTactic, updateTactic } from '@/services/roadmap'
import { fetchObjectives } from '@/services/objectives'
import { useWorkspaceStore } from '@/store/workspaceStore'
import type { Tactic, TacticStatus, TacticPriority, DvcpCategory } from '@/types/roadmap'

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TacticStatus, { label: string; className: string; dotColor: string }> = {
  planned:     { label: 'Planned',     className: 'bg-muted text-muted-foreground',                      dotColor: '#9ca3af' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',     dotColor: '#3b82f6' },
  done:        { label: 'Done',        className: 'bg-green-500/10 text-green-600 dark:text-green-400',  dotColor: '#22c55e' },
  blocked:     { label: 'Blocked',     className: 'bg-destructive/10 text-destructive',                  dotColor: '#ef4444' },
}

const VALUE_DRIVER_LABELS: Record<string, string> = {
  digital_foundation:    'Digital foundation',
  revenue_growth_engine: 'Revenue growth engine',
  digital_efficiency:    'Digital efficiency',
  data_ai_readiness:     'Data & AI readiness',
}

const PRIORITY_CONFIG: Record<TacticPriority, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'bg-muted text-muted-foreground' },
  medium:   { label: 'Medium',   className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  high:     { label: 'High',     className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive' },
}

function StatusBadge({ status }: { status: TacticStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <Badge className={`${cfg.className} border-0 font-medium`}>{cfg.label}</Badge>
}

function PriorityBadge({ priority }: { priority: TacticPriority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return <Badge className={`${cfg.className} border-0 font-medium`}>{cfg.label}</Badge>
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Tactic Actions Dropdown ─────────────────────────────────────────────────

function TacticActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-8 shrink-0'>
          <MoreHorizontalIcon className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon className='size-4 mr-2' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className='text-destructive focus:text-destructive'>
          <Trash2Icon className='size-4 mr-2' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  tactic,
  onConfirm,
  onCancel,
  isPending,
}: {
  tactic: Tactic | null
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={!!tactic} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className='flex flex-col gap-0 p-0 sm:max-w-sm'>
        <div className='shrink-0 border-b border-(--border) px-6 py-4 space-y-0.5 text-left'>
          <DialogTitle className='text-base'>Delete Tactic</DialogTitle>
          <DialogDescription className='text-sm text-(--muted-foreground)'>
            This action cannot be undone.
          </DialogDescription>
        </div>
        <div className='px-6 py-4'>
          <p className='text-sm text-(--foreground)'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>"{tactic?.name}"</span>?
          </p>
        </div>
        <div className='shrink-0 flex items-center justify-between border-t border-(--border) px-6 py-4'>
          <DialogClose asChild>
            <Button variant='outline' size='sm' disabled={isPending} onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant='destructive' size='sm' disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Deleting…' : 'Delete Tactic'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── List View ───────────────────────────────────────────────────────────────

function ListView({ tactics, onEdit, onDelete }: { tactics: Tactic[]; onEdit: (t: Tactic) => void; onDelete: (t: Tactic) => void }) {
  return (
    <div className='rounded-lg border overflow-hidden'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50 text-muted-foreground'>
          <tr>
            <th className='text-left px-4 py-3 font-medium'>Tactic</th>
            <th className='text-left px-4 py-3 font-medium'>Value driver</th>
            <th className='text-left px-4 py-3 font-medium'>Status</th>
            <th className='text-left px-4 py-3 font-medium'>Priority</th>
            <th className='text-left px-4 py-3 font-medium'>Start</th>
            <th className='text-left px-4 py-3 font-medium'>End</th>
            <th className='text-left px-4 py-3 font-medium w-40'>Progress</th>
            <th className='px-4 py-3 w-10' />
          </tr>
        </thead>
        <tbody className='divide-y'>
          {tactics.map((t) => (
            <tr key={t.id} className='hover:bg-muted/30 transition-colors'>
              <td className='px-4 py-3'>
                <p className='font-medium'>{t.name}</p>
                {t.description && (
                  <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>{t.description}</p>
                )}
                {t.areas.length > 0 && (
                  <div className='flex gap-1 mt-1 flex-wrap'>
                    {t.areas.map((a) => (
                      <Badge key={a} variant='outline' className='text-xs py-0'>{a}</Badge>
                    ))}
                  </div>
                )}
              </td>
              <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>
                {t.dvcpCategory ? VALUE_DRIVER_LABELS[t.dvcpCategory] : '—'}
              </td>
              <td className='px-4 py-3'><StatusBadge status={t.status} /></td>
              <td className='px-4 py-3'><PriorityBadge priority={t.priority} /></td>
              <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>{formatDate(t.startDate)}</td>
              <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>{formatDate(t.endDate)}</td>
              <td className='px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <Progress value={t.progress} className='h-1.5 flex-1' />
                  <span className='text-xs text-muted-foreground w-8 text-right'>{t.progress}%</span>
                </div>
              </td>
              <td className='px-2 py-3'>
                <TacticActions onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Kanban View ─────────────────────────────────────────────────────────────

type KanbanTacticItem = Tactic & { column: string } & Record<string, unknown>

const KANBAN_COLUMNS = [
  { id: 'planned',     name: 'Planned' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'done',        name: 'Done' },
  { id: 'blocked',     name: 'Blocked' },
]

function KanbanView({
  tactics, onEdit, onDelete, onStatusChange,
}: {
  tactics: Tactic[]
  onEdit: (t: Tactic) => void
  onDelete: (t: Tactic) => void
  onStatusChange: (id: string, status: TacticStatus) => void
}) {
  const [data, setData] = useState<KanbanTacticItem[]>(
    () => tactics.map((t) => ({ ...t, column: t.status }))
  )

  // Sync server data back into local state only when tactics actually change
  useEffect(() => {
    setData(tactics.map((t) => ({ ...t, column: t.status })))
  }, [tactics])

  function handleDataChange(next: KanbanTacticItem[]) {
    setData(next)
    next.forEach((item) => {
      const original = tactics.find((t) => t.id === item.id)
      if (original && original.status !== item.column) {
        onStatusChange(item.id, item.column as TacticStatus)
      }
    })
  }

  return (
    <KanbanProvider<KanbanTacticItem>
      columns={KANBAN_COLUMNS}
      data={data}
      onDataChange={handleDataChange}
    >
      {(column) => {
        const cfg = STATUS_CONFIG[column.id as TacticStatus]
        return (
          <KanbanBoard key={column.id} id={column.id}>
            <KanbanHeader className='px-3 py-2.5'>
              <div className='inline-flex items-center gap-2'>
                <span className='size-2 rounded-full shrink-0' style={{ backgroundColor: cfg.dotColor }} />
                <span className='text-xs font-bold'>{cfg.label}</span>
              </div>
            </KanbanHeader>
            <KanbanCards<KanbanTacticItem> id={column.id}>
              {(item: KanbanTacticItem) => {
                const tactic = item as Tactic
                return (
                  <KanbanCardItem key={item.id} id={item.id} name={item.name} column={item.column}>
                    <div className='flex items-start justify-between gap-1'>
                      <p className='font-medium text-sm leading-snug'>{tactic.name}</p>
                      <TacticActions onEdit={() => onEdit(tactic)} onDelete={() => onDelete(tactic)} />
                    </div>
                    {tactic.description && (
                      <p className='text-xs text-muted-foreground line-clamp-2'>{tactic.description}</p>
                    )}
                    <div className='flex flex-wrap gap-1'>
                      <PriorityBadge priority={tactic.priority} />
                      {tactic.dvcpCategory && (
                        <Badge variant='outline' className='text-xs capitalize'>{tactic.dvcpCategory}</Badge>
                      )}
                    </div>
                    {(tactic.startDate || tactic.endDate) && (
                      <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <CalendarIcon className='size-3' />
                        {formatDate(tactic.startDate)} → {formatDate(tactic.endDate)}
                      </div>
                    )}
                    <div className='flex items-center gap-2'>
                      <Progress value={tactic.progress} className='h-1 flex-1' />
                      <span className='text-xs text-muted-foreground'>{tactic.progress}%</span>
                    </div>
                  </KanbanCardItem>
                )
              }}
            </KanbanCards>
          </KanbanBoard>
        )
      }}
    </KanbanProvider>
  )
}

// ─── Gantt View ──────────────────────────────────────────────────────────────


function progressColor(progress: number): string {
  if (progress === 100) return '#22c55e'
  if (progress >= 51)   return '#eab308'
  return '#9ca3af'
}

function tacticToFeature(t: Tactic): GanttFeature {
  const color = progressColor(t.progress)
  return {
    id: t.id,
    name: t.name,
    startAt: new Date(t.startDate!),
    endAt: new Date(t.endDate!),
    status: { id: t.status, name: STATUS_CONFIG[t.status].label, color },
  }
}

function GanttView({
  tactics, onMove, onEdit, onDelete,
}: {
  tactics: Tactic[]
  onMove: (id: string, startAt: Date, endAt: Date | null) => void
  onEdit: (t: Tactic) => void
  onDelete: (t: Tactic) => void
}) {
  const withDates = tactics.filter((t) => t.startDate && t.endDate)
  const withoutDates = tactics.filter((t) => !t.startDate || !t.endDate)

  if (withDates.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 gap-2 text-center text-muted-foreground'>
        <CalendarIcon className='size-8' />
        <p className='text-sm'>No tactics have start and end dates defined yet.</p>
        <p className='text-xs'>Add dates to your tactics to see them in the Gantt view.</p>
      </div>
    )
  }

  const featureMap = new Map(withDates.map((t) => [t.id, tacticToFeature(t)]))

  const DVCP_GROUPS = [
    { id: 'digital_foundation',    label: 'Digital foundation' },
    { id: 'revenue_growth_engine', label: 'Revenue growth engine' },
    { id: 'digital_efficiency',    label: 'Digital efficiency' },
    { id: 'data_ai_readiness',     label: 'Data & AI readiness' },
  ]

  const grouped = DVCP_GROUPS
    .map((g) => ({
      ...g,
      tactics: withDates.filter((t) => t.dvcpCategory === g.id),
    }))
    .filter((g) => g.tactics.length > 0)

  const uncategorized = withDates.filter((t) => !t.dvcpCategory)

  const allGroups = [
    ...grouped,
    ...(uncategorized.length > 0 ? [{ id: 'uncategorized', label: 'Uncategorized', tactics: uncategorized }] : []),
  ]

  function handleSelect(id: string) {
    const tactic = tactics.find((t) => t.id === id)
    if (tactic) onEdit(tactic)
  }

  function handleDeleteItem(id: string) {
    const tactic = tactics.find((t) => t.id === id)
    if (tactic) onDelete(tactic)
  }

  return (
    <div className='flex flex-col gap-3 flex-1 min-h-0'>
      <div className='flex-1 min-h-0 overflow-hidden rounded-lg border'>
        <GanttProvider zoom={100} range='monthly'>
          <GanttSidebar count={withDates.length}>
            {allGroups.map((g) => (
              <GanttSidebarGroup key={g.id} name={g.label}>
                {g.tactics.map((t) => (
                  <GanttSidebarItem
                    key={t.id}
                    feature={featureMap.get(t.id)!}
                    onSelectItem={handleSelect}
                    onDeleteItem={handleDeleteItem}
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
                  {g.tactics.map((t) => {
                    const f = featureMap.get(t.id)!
                    return (
                      <GanttFeatureRow key={f.id} features={[f]} onMove={onMove}>
                        {() => (
                          <GanttFeatureItemCard
                            id={f.id}
                            className='bg-foreground border-0 shadow-none cursor-pointer p-0 rounded-full overflow-hidden'
                            onSelect={() => handleSelect(f.id)}
                          >
                            <p className='flex-1 truncate text-xs font-medium text-background px-4'>{f.name}</p>
                          </GanttFeatureItemCard>
                        )}
                      </GanttFeatureRow>
                    )
                  })}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>
            <GanttToday />
          </GanttTimeline>
        </GanttProvider>
      </div>

      {withoutDates.length > 0 && (
        <div className='flex items-start gap-2 text-xs text-muted-foreground'>
          <AlertCircleIcon className='size-4 shrink-0 mt-0.5' />
          <span>{withoutDates.length} tactic{withoutDates.length > 1 ? 's' : ''} not shown — missing start or end date.</span>
        </div>
      )}
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className='flex flex-col gap-3'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className='h-14 w-full rounded-lg' />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Roadmap() {
  const { selected } = useWorkspaceStore()
  const businessId = selected?.id ?? ''
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null)
  const [deletingTactic, setDeletingTactic] = useState<Tactic | null>(null)
  const [activeTab, setActiveTab] = useState<'gantt' | 'kanban' | 'list'>('gantt')
  const [search, setSearch] = useState('')
  const [valueDriverFilter, setValueDriverFilter] = useState<DvcpCategory | null>(null)
  const [objectiveFilter, setObjectiveFilter] = useState<string | null>(null)

  const { data: objectives = [] } = useQuery({
    queryKey: ['objectives', businessId],
    queryFn: () => fetchObjectives(businessId),
    enabled: !!businessId,
  })

  const { data: tactics = [], isLoading } = useQuery({
    queryKey: ['tactics', businessId],
    queryFn: () => fetchTactics(businessId),
    enabled: !!businessId,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTactic(deletingTactic!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactics', businessId] })
      setDeletingTactic(null)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TacticStatus }) =>
      updateTactic({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactics', businessId] })
    },
  })

  const dateMutation = useMutation({
    mutationFn: ({ id, startAt, endAt }: { id: string; startAt: Date; endAt: Date | null }) =>
      updateTactic({
        id,
        startDate: startAt.toISOString().slice(0, 10),
        endDate: endAt ? endAt.toISOString().slice(0, 10) : undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tactics', businessId] }),
  })

  function handleEdit(tactic: Tactic) { setEditingTactic(tactic) }
  function handleDelete(tactic: Tactic) { setDeletingTactic(tactic) }
  function handleStatusChange(id: string, status: TacticStatus) {
    statusMutation.mutate({ id, status })
  }
  function handleGanttMove(id: string, startAt: Date, endAt: Date | null) {
    dateMutation.mutate({ id, startAt, endAt })
  }

  const filteredTactics = useMemo(() =>
    tactics
      .filter((t) => !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => !valueDriverFilter || t.dvcpCategory === valueDriverFilter)
      .filter((t) => !objectiveFilter || t.objectiveId === objectiveFilter),
    [tactics, search, valueDriverFilter, objectiveFilter]
  )

  const hasActiveFilter = !!valueDriverFilter || !!objectiveFilter

  return (
    <div className='flex flex-col gap-6 h-full'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-base font-semibold leading-6'>Roadmap</h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Create tactics to improve your DVCP performance
          </p>
        </div>
      </div>

      {/* Tactics Stats */}
      {!isLoading && tactics.length > 0 && (
        <TacticsStatsCard tactics={tactics} />
      )}

      {/* Tabs row + Add button */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className='flex flex-col flex-1 min-h-0'>
        <div className='flex items-center justify-between gap-4'>
          <TabsList>
            <TabsTrigger value='gantt'>Gantt</TabsTrigger>
            <TabsTrigger value='kanban'>Kanban</TabsTrigger>
            <TabsTrigger value='list'>List</TabsTrigger>
          </TabsList>
          <div className='flex items-center gap-2 ml-auto'>
            <div className='relative'>
              <SearchIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
              <Input
                placeholder='Search tactics…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='h-9 w-56 pl-8 text-sm'
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon' className={hasActiveFilter ? 'border-foreground text-foreground' : ''}>
                  <SlidersHorizontalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                {hasActiveFilter && (
                  <>
                    <DropdownMenuItem
                      onClick={() => { setValueDriverFilter(null); setObjectiveFilter(null) }}
                      className='text-muted-foreground text-xs'
                    >
                      Clear all filters
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

                <DropdownMenuSeparator />

                <div className='px-2 py-1 text-xs font-medium text-muted-foreground'>Business objective</div>
                {objectives.length === 0 ? (
                  <div className='px-2 py-1.5 text-xs text-muted-foreground'>No objectives created yet</div>
                ) : (
                  objectives.map((o) => (
                    <DropdownMenuItem
                      key={o.id}
                      onClick={() => setObjectiveFilter(objectiveFilter === o.id ? null : o.id)}
                      className='flex items-center justify-between'
                    >
                      <span className='truncate'>{o.name}</span>
                      {objectiveFilter === o.id && <span className='size-1.5 rounded-full bg-foreground shrink-0 ml-2' />}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setModalOpen(true)}>
              <PlusIcon className='size-4' />
              Add tactic
            </Button>
          </div>
        </div>

        {/* Content area */}
        {isLoading ? (
          <div className='mt-4'>
            <LoadingSkeleton />
          </div>
        ) : tactics.length === 0 ? (
          <div className='mt-4 rounded-xl border bg-card min-h-[420px] flex flex-col items-center justify-center gap-3 text-center px-6'>
            <div className='rounded-xl bg-foreground p-3'>
              <Route className='size-6 text-background' />
            </div>
            <div>
              <p className='font-semibold text-sm'>No tactics yet</p>
              <p className='text-sm text-muted-foreground mt-1'>
                Start building your roadmap by creating your first tactic.
              </p>
            </div>
          </div>
        ) : (
          <>
            <TabsContent value='gantt' className='mt-4 flex-1 min-h-0 flex flex-col'>
              <GanttView tactics={filteredTactics} onMove={handleGanttMove} onEdit={handleEdit} onDelete={handleDelete} />
            </TabsContent>
            <TabsContent value='kanban' className='mt-4'>
              <KanbanView tactics={filteredTactics} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value='list' className='mt-4'>
              <ListView tactics={filteredTactics} onEdit={handleEdit} onDelete={handleDelete} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Create modal */}
      <CreateTacticModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        businessId={businessId}
        existingTactics={tactics}
      />

      {/* Edit modal */}
      <CreateTacticModal
        key={editingTactic?.id ?? 'edit'}
        open={!!editingTactic}
        onOpenChange={(v) => { if (!v) setEditingTactic(null) }}
        businessId={businessId}
        tactic={editingTactic ?? undefined}
        existingTactics={tactics.filter((t) => t.id !== editingTactic?.id)}
      />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        tactic={deletingTactic}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeletingTactic(null)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
