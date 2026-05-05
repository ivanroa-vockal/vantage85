export interface Organization {
  id: string
  name: string
  slug: string
  code?: string
  description?: string
  logoUrl?: string
  businessCount: number
  createdAt: string
}

export interface CreateOrganizationInput {
  name: string
  code: string
  description?: string
}

export interface UpdateOrganizationInput {
  id: string
  name: string
  code: string
  description?: string
}

export interface Business {
  id: string
  name: string
  slug: string
  logoUrl?: string
  businessType: string
  organizationId: string
  organizationName: string
  websites: string[]
  description?: string
  createdAt: string
}

export interface CreateBusinessInput {
  name: string
  organizationId: string
  industry: string
  websites: string[]
  description?: string
  logoUrl?: string
}

export interface UpdateBusinessInput {
  id: string
  name: string
  industry: string
  websites: string[]
  description?: string
  logoUrl?: string
}

export interface Invitation {
  id: string
  organizationId: string
  email: string
  clientName?: string
  status: 'pending' | 'accepted' | 'expired'
  sentAt: string
  expiresAt?: string
}

export interface SendInvitationInput {
  organizationId: string
  email: string
  clientName?: string
}

export type WorkspaceType = 'organization' | 'business'

export interface SelectedWorkspace {
  id: string
  type: WorkspaceType
  name: string
  organizationId?: string
}
