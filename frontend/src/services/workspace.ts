import { supabase } from '@/lib/supabase'
import type {
  Organization, Business,
  CreateOrganizationInput, UpdateOrganizationInput, CreateBusinessInput, UpdateBusinessInput,
  Invitation, SendInvitationInput,
} from '@/types/workspace'

// Auto-generate slug from name: "Arcadia Capital" → "arcadia-capital"
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, code, description, logo_url, created_at, businesses(count)')
    .order('name')

  if (error) throw error

  return (data ?? []).map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    code: org.code ?? undefined,
    description: org.description ?? undefined,
    logoUrl: org.logo_url ?? undefined,
    businessCount: (org.businesses as unknown as { count: number }[])?.[0]?.count ?? 0,
    createdAt: org.created_at,
  }))
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  const slug = toSlug(input.name)

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name: input.name.trim(),
      slug,
      code: input.code.trim(),
      description: input.description?.trim() || null,
    })
    .select('id, name, slug, code, description, logo_url, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    code: data.code ?? undefined,
    description: data.description ?? undefined,
    logoUrl: data.logo_url ?? undefined,
    businessCount: 0,
    createdAt: data.created_at,
  }
}

async function uniqueBusinessSlug(base: string): Promise<string> {
  const { data } = await supabase
    .from('businesses')
    .select('slug')
    .or(`slug.eq.${base},slug.like.${base}-%`)

  const existing = new Set((data ?? []).map((r) => r.slug))
  if (!existing.has(base)) return base

  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export async function updateOrganization(input: UpdateOrganizationInput): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      name: input.name.trim(),
      code: input.code.trim(),
      description: input.description?.trim() || null,
    })
    .eq('id', input.id)
    .select('id, name, slug, code, description, logo_url, created_at, businesses(count)')
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    code: data.code ?? undefined,
    description: data.description ?? undefined,
    logoUrl: data.logo_url ?? undefined,
    businessCount: (data.businesses as unknown as { count: number }[])?.[0]?.count ?? 0,
    createdAt: data.created_at,
  }
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const slug = await uniqueBusinessSlug(toSlug(input.name))

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name: input.name.trim(),
      slug,
      organization_id: input.organizationId,
      business_type: input.industry,
      websites: input.websites.filter(Boolean),
      description: input.description?.trim() || null,
      logo_url: input.logoUrl ?? null,
    })
    .select('id, name, slug, logo_url, business_type, organization_id, organizations(name), websites, description, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url ?? undefined,
    businessType: data.business_type ?? '',
    organizationId: data.organization_id,
    organizationName: (data.organizations as unknown as { name: string })?.name ?? '',
    websites: (data as Record<string, unknown>).websites as string[] ?? [],
    description: (data as Record<string, unknown>).description as string | undefined ?? undefined,
    createdAt: data.created_at,
  }
}

export async function updateBusiness(input: UpdateBusinessInput): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .update({
      name: input.name.trim(),
      business_type: input.industry,
      websites: input.websites.filter(Boolean),
      description: input.description?.trim() || null,
      logo_url: input.logoUrl ?? null,
    })
    .eq('id', input.id)
    .select('id, name, slug, logo_url, business_type, organization_id, organizations(name), websites, description, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url ?? undefined,
    businessType: data.business_type ?? '',
    organizationId: data.organization_id,
    organizationName: (data.organizations as unknown as { name: string })?.name ?? '',
    websites: (data as Record<string, unknown>).websites as string[] ?? [],
    description: (data as Record<string, unknown>).description as string | undefined ?? undefined,
    createdAt: data.created_at,
  }
}

export async function deleteBusiness(id: string): Promise<void> {
  const { error } = await supabase.from('businesses').delete().eq('id', id)
  if (error) throw error
}

// ── Invitations ────────────────────────────────────────────────────────────

export async function fetchInvitations(organizationId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('id, organization_id, email, client_name, status, sent_at, expires_at')
    .eq('organization_id', organizationId)
    .order('sent_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    email: row.email,
    clientName: row.client_name ?? undefined,
    status: row.status,
    sentAt: row.sent_at,
    expiresAt: row.expires_at ?? undefined,
  }))
}

export async function sendInvitation(input: SendInvitationInput): Promise<Invitation> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: input.organizationId,
      email: input.email.trim(),
      client_name: input.clientName?.trim() || null,
      status: 'pending',
      sent_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .select('id, organization_id, email, client_name, status, sent_at, expires_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    organizationId: data.organization_id,
    email: data.email,
    clientName: data.client_name ?? undefined,
    status: data.status,
    sentAt: data.sent_at,
    expiresAt: data.expires_at ?? undefined,
  }
}

export async function resendInvitation(id: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'pending', sent_at: new Date().toISOString(), expires_at: expiresAt })
    .eq('id', id)

  if (error) throw error
}

export async function deleteInvitation(id: string): Promise<void> {
  const { error } = await supabase.from('invitations').delete().eq('id', id)
  if (error) throw error
}

export async function fetchBusinesses(): Promise<Business[]> {
  // Base query — always works
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, logo_url, business_type, organization_id, organizations(name), created_at')
    .order('name')

  if (error) throw error

  // Extended fields — graceful fallback if columns not yet migrated
  const { data: extData } = await supabase
    .from('businesses')
    .select('id, websites, description')

  const extMap = new Map((extData ?? []).map((r) => [r.id, r]))

  return (data ?? []).map((biz) => {
    const ext = extMap.get(biz.id) as { websites?: string[]; description?: string } | undefined
    return {
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      logoUrl: biz.logo_url ?? undefined,
      businessType: biz.business_type ?? '',
      organizationId: biz.organization_id,
      organizationName: (biz.organizations as unknown as { name: string })?.name ?? '',
      websites: ext?.websites ?? [],
      description: ext?.description ?? undefined,
      createdAt: biz.created_at,
    }
  })
}
