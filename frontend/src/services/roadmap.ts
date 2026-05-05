import { supabase } from '@/lib/supabase'
import type { Tactic, CreateTacticInput, UpdateTacticInput } from '@/types/roadmap'

function mapRow(row: Record<string, unknown>): Tactic {
  return {
    id: row.id as string,
    businessId: row.business_id as string,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    objectiveId: (row.objective_id as string) ?? undefined,
    valueDriverId: (row.value_driver_id as string) ?? undefined,
    dvcpCategory: (row.dvcp_category as Tactic['dvcpCategory']) ?? undefined,
    scorecardId: (row.scorecard_id as string) ?? undefined,
    startDate: (row.start_date as string) ?? undefined,
    endDate: (row.end_date as string) ?? undefined,
    status: row.status as Tactic['status'],
    priority: row.priority as Tactic['priority'],
    ownerId: (row.owner_id as string) ?? undefined,
    areas: (row.areas as string[]) ?? [],
    progress: (row.progress as number) ?? 0,
    dependencies: (row.dependencies as string[]) ?? [],
    createdAt: row.created_at as string,
  }
}

export async function fetchTactics(businessId: string): Promise<Tactic[]> {
  const { data, error } = await supabase
    .from('tactics')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createTactic(input: CreateTacticInput): Promise<Tactic> {
  const { data, error } = await supabase
    .from('tactics')
    .insert({
      business_id: input.businessId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      objective_id: input.objectiveId || null,
      value_driver_id: input.valueDriverId || null,
      dvcp_category: input.dvcpCategory || null,
      scorecard_id: input.scorecardId || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      status: input.status,
      priority: input.priority,
      owner_id: input.ownerId || null,
      areas: input.areas,
      progress: input.progress,
      dependencies: input.dependencies,
    })
    .select('*')
    .single()

  if (error) throw error
  return mapRow(data)
}

export async function updateTactic(input: UpdateTacticInput): Promise<Tactic> {
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.description !== undefined) patch.description = input.description?.trim() || null
  if (input.objectiveId !== undefined) patch.objective_id = input.objectiveId || null
  if (input.valueDriverId !== undefined) patch.value_driver_id = input.valueDriverId || null
  if (input.dvcpCategory !== undefined) patch.dvcp_category = input.dvcpCategory || null
  if (input.scorecardId !== undefined) patch.scorecard_id = input.scorecardId || null
  if (input.startDate !== undefined) patch.start_date = input.startDate || null
  if (input.endDate !== undefined) patch.end_date = input.endDate || null
  if (input.status !== undefined) patch.status = input.status
  if (input.priority !== undefined) patch.priority = input.priority
  if (input.ownerId !== undefined) patch.owner_id = input.ownerId || null
  if (input.areas !== undefined) patch.areas = input.areas
  if (input.progress !== undefined) patch.progress = input.progress
  if (input.dependencies !== undefined) patch.dependencies = input.dependencies

  const { data, error } = await supabase
    .from('tactics')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) throw error
  return mapRow(data)
}

export async function deleteTactic(id: string): Promise<void> {
  const { error } = await supabase.from('tactics').delete().eq('id', id)
  if (error) throw error
}
