export type TacticStatus = 'planned' | 'in_progress' | 'done' | 'blocked'
export type TacticPriority = 'low' | 'medium' | 'high' | 'critical'
export type DvcpCategory = 'digital_foundation' | 'revenue_growth_engine' | 'digital_efficiency' | 'data_ai_readiness'
export type ObjectiveScopeType = 'percentage' | 'number'

export interface BusinessObjective {
  id: string
  businessId: string
  name: string
  description?: string
  scopeType: ObjectiveScopeType
  scopeValue: number
  scopeUnit?: string
  createdAt: string
}

export interface CreateObjectiveInput {
  businessId: string
  name: string
  description?: string
  scopeType: ObjectiveScopeType
  scopeValue: number
  scopeUnit?: string
}

export interface Tactic {
  id: string
  businessId: string
  name: string
  description?: string
  objectiveId?: string
  valueDriverId?: string
  dvcpCategory?: DvcpCategory
  scorecardId?: string
  startDate?: string
  endDate?: string
  status: TacticStatus
  priority: TacticPriority
  ownerId?: string
  areas: string[]
  progress: number
  dependencies: string[]
  createdAt: string
}

export interface CreateTacticInput {
  businessId: string
  name: string
  description?: string
  objectiveId?: string
  valueDriverId?: string
  dvcpCategory?: DvcpCategory
  scorecardId?: string
  startDate?: string
  endDate?: string
  status: TacticStatus
  priority: TacticPriority
  ownerId?: string
  areas: string[]
  progress: number
  dependencies: string[]
}

export interface UpdateTacticInput extends Partial<CreateTacticInput> {
  id: string
}
