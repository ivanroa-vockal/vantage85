import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, XIcon, ChevronDownIcon, TargetIcon, CheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createTactic, updateTactic } from '@/services/roadmap'
import { fetchObjectives, createObjective } from '@/services/objectives'
import type {
  Tactic, CreateTacticInput, UpdateTacticInput,
  TacticStatus, TacticPriority, DvcpCategory,
  BusinessObjective, ObjectiveScopeType,
} from '@/types/roadmap'

const DVCP_CATEGORIES: { value: DvcpCategory; label: string }[] = [
  { value: 'digital_foundation',    label: 'Digital foundation' },
  { value: 'revenue_growth_engine', label: 'Revenue growth engine' },
  { value: 'digital_efficiency',    label: 'Digital efficiency' },
  { value: 'data_ai_readiness',     label: 'Data & AI readiness' },
]

const STATUSES: { value: TacticStatus; label: string }[] = [
  { value: 'planned',     label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
  { value: 'blocked',     label: 'Blocked' },
]

const PRIORITIES: { value: TacticPriority; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
]

function formatScope(obj: BusinessObjective): string {
  if (obj.scopeType === 'percentage') {
    return `${obj.scopeValue}%${obj.scopeUnit ? ` ${obj.scopeUnit}` : ''}`
  }
  return `${obj.scopeValue.toLocaleString()}${obj.scopeUnit ? ` ${obj.scopeUnit}` : ''}`
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessId: string
  tactic?: Tactic
  existingTactics?: Tactic[]
  onSuccess?: (tactic: Tactic) => void
}

const EMPTY_FORM = {
  name: '',
  description: '',
  objectiveId: '' as string,
  dvcpCategory: '' as DvcpCategory | '',
  startDate: '',
  endDate: '',
  status: 'planned' as TacticStatus,
  priority: 'medium' as TacticPriority,
  progress: 0,
  areas: [] as string[],
  dependencies: [] as string[],
  areaInput: '',
}

const EMPTY_OBJ_FORM = {
  name: '',
  description: '',
  scopeType: 'number' as ObjectiveScopeType,
  scopeValue: '',
  scopeUnit: '',
}

function tacticToForm(t: Tactic): typeof EMPTY_FORM {
  return {
    name: t.name,
    description: t.description ?? '',
    objectiveId: t.objectiveId ?? '',
    dvcpCategory: t.dvcpCategory ?? '',
    startDate: t.startDate ?? '',
    endDate: t.endDate ?? '',
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    areas: t.areas,
    dependencies: t.dependencies,
    areaInput: '',
  }
}

export function CreateTacticModal({ open, onOpenChange, businessId, tactic, existingTactics = [], onSuccess }: Props) {
  const isEditing = !!tactic
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => tactic ? tacticToForm(tactic) : EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Objective creation inline state
  const [showNewObjective, setShowNewObjective] = useState(false)
  const [objForm, setObjForm] = useState(EMPTY_OBJ_FORM)
  const [objErrors, setObjErrors] = useState<Record<string, string>>({})

  const { data: objectives = [] } = useQuery({
    queryKey: ['objectives', businessId],
    queryFn: () => fetchObjectives(businessId),
    enabled: !!businessId,
  })

  const createObjectiveMutation = useMutation({
    mutationFn: () => createObjective({
      businessId,
      name: objForm.name,
      description: objForm.description || undefined,
      scopeType: objForm.scopeType,
      scopeValue: Number(objForm.scopeValue),
      scopeUnit: objForm.scopeUnit || undefined,
    }),
    onSuccess: (obj) => {
      queryClient.invalidateQueries({ queryKey: ['objectives', businessId] })
      setForm((f) => ({ ...f, objectiveId: obj.id }))
      setShowNewObjective(false)
      setObjForm(EMPTY_OBJ_FORM)
      setObjErrors({})
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateTacticInput) => createTactic(input),
    onSuccess: (t) => { queryClient.invalidateQueries({ queryKey: ['tactics', businessId] }); onSuccess?.(t); handleClose() },
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateTacticInput) => updateTactic(input),
    onSuccess: (t) => { queryClient.invalidateQueries({ queryKey: ['tactics', businessId] }); onSuccess?.(t); handleClose() },
  })

  const mutation = isEditing ? updateMutation : createMutation

  function handleClose() {
    onOpenChange(false)
    setForm(tactic ? tacticToForm(tactic) : EMPTY_FORM)
    setErrors({})
    setShowNewObjective(false)
    setObjForm(EMPTY_OBJ_FORM)
    setObjErrors({})
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.startDate) next.startDate = 'Start date is required.'
    if (!form.endDate) next.endDate = 'End date is required.'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      next.endDate = 'End date must be after start date.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function validateObjective(): boolean {
    const next: Record<string, string> = {}
    if (!objForm.name.trim()) next.name = 'Name is required.'
    if (!objForm.scopeValue || isNaN(Number(objForm.scopeValue))) next.scopeValue = 'Enter a valid number.'
    if (Number(objForm.scopeValue) <= 0) next.scopeValue = 'Must be greater than 0.'
    setObjErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSaveObjective() {
    if (!validateObjective()) return
    createObjectiveMutation.mutate()
  }

  function handleSubmit() {
    if (!validate()) return
    if (isEditing) {
      updateMutation.mutate({
        id: tactic!.id,
        name: form.name,
        description: form.description || undefined,
        objectiveId: form.objectiveId || undefined,
        dvcpCategory: form.dvcpCategory || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
        priority: form.priority,
        progress: form.progress,
        areas: form.areas,
        dependencies: form.dependencies,
      })
    } else {
      createMutation.mutate({
        businessId,
        name: form.name,
        description: form.description || undefined,
        objectiveId: form.objectiveId || undefined,
        dvcpCategory: form.dvcpCategory || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
        priority: form.priority,
        progress: form.progress,
        areas: form.areas,
        dependencies: form.dependencies,
      })
    }
  }

  function addArea() {
    const val = form.areaInput.trim()
    if (val && !form.areas.includes(val))
      setForm((f) => ({ ...f, areas: [...f.areas, val], areaInput: '' }))
  }

  function removeArea(area: string) {
    setForm((f) => ({ ...f, areas: f.areas.filter((a) => a !== area) }))
  }

  function toggleDependency(id: string) {
    setForm((f) => ({
      ...f,
      dependencies: f.dependencies.includes(id)
        ? f.dependencies.filter((d) => d !== id)
        : [...f.dependencies, id],
    }))
  }

  const selectedObjective = objectives.find((o) => o.id === form.objectiveId)
  const canSubmit = !!form.name.trim() && !!form.startDate && !!form.endDate && !mutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[min(720px,90vh)] flex-col gap-0 p-0 sm:max-w-lg'>

        {/* Fixed header */}
        <div className='shrink-0 border-b border-(--border) px-6 py-4 space-y-0.5 text-left'>
          <DialogTitle className='text-base'>{isEditing ? 'Edit Tactic' : 'New Tactic'}</DialogTitle>
          <DialogDescription className='text-sm text-(--muted-foreground)'>
            {isEditing ? 'Update the details of this tactic.' : 'Add a tactic to improve your DVCP performance.'}
          </DialogDescription>
        </div>

        {/* Scrollable body */}
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='px-6 py-4 space-y-5'>

            {/* Name */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Tactic Name <span className='text-(--destructive)'>*</span>
              </Label>
              <Input
                placeholder='e.g. Launch SEO content strategy'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className='h-9'
              />
              {errors.name && <p className='text-xs text-(--destructive)'>{errors.name}</p>}
            </div>

            {/* Description */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Description <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
              </Label>
              <Textarea
                placeholder='Describe the tactic and its expected impact…'
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className='resize-none text-sm'
              />
            </div>

            {/* Business Objective */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Business Objective <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
              </Label>

              {/* Selector */}
              <Select
                value={form.objectiveId}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, objectiveId: v }))
                  setShowNewObjective(false)
                }}
              >
                <SelectTrigger className='h-9 text-sm'>
                  <SelectValue placeholder='Select an objective…' />
                </SelectTrigger>
                <SelectContent>
                  {objectives.length === 0 && (
                    <div className='px-3 py-2 text-xs text-muted-foreground'>No objectives yet</div>
                  )}
                  {objectives.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <span className='flex items-center gap-2'>
                        <span>{o.name}</span>
                        <span className='text-muted-foreground text-xs'>{formatScope(o)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected objective preview */}
              {selectedObjective && (
                <div className='flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs'>
                  <TargetIcon className='size-3.5 shrink-0 mt-0.5 text-muted-foreground' />
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{selectedObjective.name}</p>
                    {selectedObjective.description && (
                      <p className='text-muted-foreground mt-0.5'>{selectedObjective.description}</p>
                    )}
                    <Badge variant='secondary' className='mt-1 text-xs h-4 px-1.5'>
                      {formatScope(selectedObjective)}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setForm((f) => ({ ...f, objectiveId: '' }))}
                    className='text-muted-foreground hover:text-foreground shrink-0'
                  >
                    <XIcon className='size-3.5' />
                  </button>
                </div>
              )}

              {/* Create new objective toggle */}
              <Collapsible open={showNewObjective} onOpenChange={setShowNewObjective}>
                <CollapsibleTrigger asChild>
                  <button className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1'>
                    <PlusIcon className='size-3.5' />
                    Create new objective
                    <ChevronDownIcon className={`size-3.5 transition-transform ${showNewObjective ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className='mt-3 rounded-md border bg-muted/30 p-4 space-y-3'>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>New objective</p>

                    <div className='space-y-1.5'>
                      <Label className='text-xs font-medium'>Name <span className='text-(--destructive)'>*</span></Label>
                      <Input
                        placeholder='e.g. Reach 1,000 customers'
                        value={objForm.name}
                        onChange={(e) => setObjForm((f) => ({ ...f, name: e.target.value }))}
                        className='h-8 text-sm'
                      />
                      {objErrors.name && <p className='text-xs text-(--destructive)'>{objErrors.name}</p>}
                    </div>

                    <div className='space-y-1.5'>
                      <Label className='text-xs font-medium'>Description <span className='text-(--muted-foreground) font-normal'>(Optional)</span></Label>
                      <Textarea
                        placeholder='Describe this objective…'
                        value={objForm.description}
                        onChange={(e) => setObjForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                        className='resize-none text-sm'
                      />
                    </div>

                    <Separator />

                    <div className='space-y-1.5'>
                      <Label className='text-xs font-medium'>Scope <span className='text-(--destructive)'>*</span></Label>
                      <div className='flex gap-2'>
                        <Select
                          value={objForm.scopeType}
                          onValueChange={(v) => setObjForm((f) => ({ ...f, scopeType: v as ObjectiveScopeType }))}
                        >
                          <SelectTrigger className='h-8 text-sm w-36 shrink-0'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='number'>Number</SelectItem>
                            <SelectItem value='percentage'>Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type='number'
                          min={0}
                          placeholder={objForm.scopeType === 'percentage' ? '50' : '1000'}
                          value={objForm.scopeValue}
                          onChange={(e) => setObjForm((f) => ({ ...f, scopeValue: e.target.value }))}
                          className='h-8 text-sm w-24 shrink-0'
                        />
                        <Input
                          placeholder={objForm.scopeType === 'percentage' ? 'customers (optional)' : 'customers (optional)'}
                          value={objForm.scopeUnit}
                          onChange={(e) => setObjForm((f) => ({ ...f, scopeUnit: e.target.value }))}
                          className='h-8 text-sm'
                        />
                      </div>
                      {objErrors.scopeValue && <p className='text-xs text-(--destructive)'>{objErrors.scopeValue}</p>}
                      <p className='text-xs text-muted-foreground'>
                        Preview:{' '}
                        <span className='font-medium text-foreground'>
                          {objForm.scopeValue
                            ? objForm.scopeType === 'percentage'
                              ? `${objForm.scopeValue}%${objForm.scopeUnit ? ` ${objForm.scopeUnit}` : ''}`
                              : `${Number(objForm.scopeValue).toLocaleString()}${objForm.scopeUnit ? ` ${objForm.scopeUnit}` : ''}`
                            : '—'}
                        </span>
                      </p>
                    </div>

                    <div className='flex justify-end gap-2 pt-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-7 text-xs'
                        onClick={() => { setShowNewObjective(false); setObjForm(EMPTY_OBJ_FORM); setObjErrors({}) }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        className='h-7 text-xs gap-1.5'
                        disabled={createObjectiveMutation.isPending}
                        onClick={handleSaveObjective}
                      >
                        <CheckIcon className='size-3.5' />
                        {createObjectiveMutation.isPending ? 'Saving…' : 'Save & select'}
                      </Button>
                    </div>

                    {createObjectiveMutation.isError && (
                      <p className='text-xs text-(--destructive)'>
                        {(createObjectiveMutation.error as Error)?.message ?? 'Something went wrong.'}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Value driver */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Value driver <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
              </Label>
              <Select
                value={form.dvcpCategory}
                onValueChange={(v) => setForm((f) => ({ ...f, dvcpCategory: v as DvcpCategory }))}
              >
                <SelectTrigger className='h-9 text-sm'>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {DVCP_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>
                  Start Date <span className='text-(--destructive)'>*</span>
                </Label>
                <Input
                  type='date'
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className='h-9 text-sm'
                />
                {errors.startDate && <p className='text-xs text-(--destructive)'>{errors.startDate}</p>}
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>
                  End Date <span className='text-(--destructive)'>*</span>
                </Label>
                <Input
                  type='date'
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className='h-9 text-sm'
                />
                {errors.endDate && <p className='text-xs text-(--destructive)'>{errors.endDate}</p>}
              </div>
            </div>

            {/* Status & Priority */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as TacticStatus }))}
                >
                  <SelectTrigger className='h-9 text-sm'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as TacticPriority }))}
                >
                  <SelectTrigger className='h-9 text-sm'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Progress */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Progress — {form.progress}%</Label>
              <input
                type='range'
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                className='w-full accent-primary'
              />
            </div>

            {/* Areas */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Areas <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
              </Label>
              <div className='flex gap-2'>
                <Input
                  placeholder='e.g. Marketing'
                  value={form.areaInput}
                  onChange={(e) => setForm((f) => ({ ...f, areaInput: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea() } }}
                  className='h-9 text-sm'
                />
                <Button type='button' variant='outline' size='icon' className='h-9 w-9 shrink-0' onClick={addArea}>
                  <PlusIcon className='size-4' />
                </Button>
              </div>
              {form.areas.length > 0 && (
                <div className='flex flex-wrap gap-1.5 pt-1'>
                  {form.areas.map((area) => (
                    <Badge key={area} variant='secondary' className='gap-1 text-xs'>
                      {area}
                      <button onClick={() => removeArea(area)} className='hover:text-destructive'>
                        <XIcon className='size-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Dependencies */}
            {existingTactics.length > 0 && (
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>
                  Dependencies <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
                </Label>
                <div className='flex flex-col gap-1 max-h-32 overflow-y-auto rounded-md border px-3 py-2'>
                  {existingTactics.map((t) => (
                    <label key={t.id} className='flex items-center gap-2 text-sm cursor-pointer py-0.5'>
                      <input
                        type='checkbox'
                        checked={form.dependencies.includes(t.id)}
                        onChange={() => toggleDependency(t.id)}
                        className='accent-primary'
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Error */}
        {mutation.isError && (
          <p className='px-6 pt-2 text-xs text-(--destructive)'>
            {(mutation.error as Error)?.message ?? 'Something went wrong. Please try again.'}
          </p>
        )}

        {/* Fixed footer */}
        <div className='shrink-0 flex items-center justify-between border-t border-(--border) px-6 py-4'>
          <DialogClose asChild>
            <Button variant='outline' size='sm' onClick={handleClose} disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button size='sm' disabled={!canSubmit} onClick={handleSubmit}>
            {mutation.isPending ? (isEditing ? 'Saving…' : 'Creating…') : (isEditing ? 'Save Changes' : 'Create Tactic')}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
