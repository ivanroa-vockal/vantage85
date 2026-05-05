import { supabase } from '@/lib/supabase'
import type { BusinessObjective, CreateObjectiveInput } from '@/types/roadmap'

function mapRow(row: Record<string, unknown>): BusinessObjective {
  return {
    id: row.id as string,
    businessId: row.business_id as string,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    scopeType: row.scope_type as BusinessObjective['scopeType'],
    scopeValue: row.scope_value as number,
    scopeUnit: (row.scope_unit as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}

export async function fetchObjectives(businessId: string): Promise<BusinessObjective[]> {
  const { data, error } = await supabase
    .from('business_objectives')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createObjective(input: CreateObjectiveInput): Promise<BusinessObjective> {
  const { data, error } = await supabase
    .from('business_objectives')
    .insert({
      business_id: input.businessId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      scope_type: input.scopeType,
      scope_value: input.scopeValue,
      scope_unit: input.scopeUnit?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return mapRow(data)
}
