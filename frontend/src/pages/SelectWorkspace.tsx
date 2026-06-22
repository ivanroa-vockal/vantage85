import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Briefcase, ArrowRight, LogOut, Search, X, Tag, WifiOff, Plus, FlaskConical, RefreshCw, Check, ExternalLink } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { fetchOrganizations, fetchBusinesses, createOrganization } from '@/services/workspace'
import type { Organization, Business } from '@/types/workspace'

type Scenario = 'default' | 'connection-error' | 'empty-orgs'

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'default',          label: 'Default' },
  { value: 'connection-error', label: 'Connection error' },
  { value: 'empty-orgs',       label: 'Empty — Organizations' },
]

const SKELETON_COUNT = 9

// Generate initials from a name: "Mercado Libre" → "ML"
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}


// Format "2024-01-15T..." → "March 05, 2026"
function formatCreatedAt(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(
    new Date(dateStr)
  )
}

export default function SelectWorkspace() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setWorkspace } = useWorkspaceStore()
  const { signOut, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'organizations' | 'businesses'>('organizations')
  const [query, setQuery] = useState('')
  const [scenario, setScenario] = useState<Scenario>('default')
  const [modalOpen, setModalOpen] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgCode, setOrgCode] = useState('')
  const [orgDescription, setOrgDescription] = useState('')

  const handleCloseModal = () => {
    setModalOpen(false)
    setOrgName('')
    setOrgCode('')
    setOrgDescription('')
  }

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      handleCloseModal()
    },
  })

  const handleTabChange = (v: string) => {
    setActiveTab(v as typeof activeTab)
    setQuery('')
  }

  const orgsQuery = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  })

  const bizQuery = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  })

  const handleSelectOrg = (org: Organization) => {
    setWorkspace({ id: org.id, name: org.name, type: 'organization' })
    navigate('/')
  }

  const handleSelectBiz = (biz: Business) => {
    setWorkspace({
      id: biz.id,
      name: biz.name,
      type: 'business',
      organizationId: biz.organizationId,
    })
    navigate('/')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const normalizedQuery = query.toLowerCase().trim()

  const filteredOrgs = orgsQuery.data?.filter((o) =>
    o.name.toLowerCase().includes(normalizedQuery)
  ) ?? []

  const filteredBiz = bizQuery.data?.filter((b) =>
    b.name.toLowerCase().includes(normalizedQuery)
  ) ?? []

  return (
    <div className='h-screen bg-(--background) flex flex-col overflow-hidden'>
      {/* Top bar — fijo */}
      <div className='shrink-0 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-(--border)'>
        <div className='flex items-center'>
          <img src='/logo.png' alt='Vantage 85' className='h-8 w-auto object-contain' />
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-(--muted-foreground)'>{user?.email}</span>
          <Button variant='ghost' size='sm' onClick={handleSignOut} className='gap-1.5'>
            <LogOut className='h-3.5 w-3.5' />
            Sign out
          </Button>
        </div>
      </div>

      {/* Área debajo del topbar */}
      <div className='flex-1 flex flex-col overflow-hidden'>

        {/* ── ESCENARIO: Connection Error ── */}
        {scenario === 'connection-error' ? (
          <div className='flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center'>
            <div className='h-14 w-14 rounded-full bg-(--destructive)/10 flex items-center justify-center'>
              <WifiOff className='h-6 w-6 text-(--destructive)' />
            </div>
            <div className='space-y-1.5'>
              <p className='text-base font-semibold text-(--foreground)'>Connection error</p>
              <p className='text-sm text-(--muted-foreground) max-w-xs'>
                We couldn't reach the server. Check your internet connection and try again.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='gap-2'
              onClick={() => window.location.reload()}
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Reload page
            </Button>
          </div>
        ) : (
          <>
            {/* Header — fijo, no hace scroll */}
            <div className='shrink-0 text-center pt-6 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-6 space-y-3 sm:space-y-4'>
              <Badge className='px-3 py-1 text-[11px] font-semibold tracking-[0.15em] uppercase border-0 bg-(--dvcp) text-(--dvcp-foreground)'>
                DVCP · Digital Value Creation Plan
              </Badge>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-(--foreground)'>
                Welcome to Vantage 85
              </h1>
              <p className='text-(--muted-foreground) text-sm leading-relaxed'>
                Select an organization or business to get started.
              </p>
            </div>

            {/* Tabs */}
            <div className='flex-1 flex flex-col overflow-hidden'>
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className='flex-1 flex flex-col overflow-hidden'
              >
                {/* TabsList — fijo */}
                <div className='shrink-0 flex items-center justify-center pb-4 sm:pb-6 px-4 sm:px-6'>
                  <TabsList className='h-9'>
                    <TabsTrigger value='organizations' className='gap-2 text-xs px-4'>
                      <Building2 className='h-3.5 w-3.5' />
                      Organizations
                      {!orgsQuery.isLoading && orgsQuery.data && scenario === 'default' && (
                        <span className='ml-1 rounded-full bg-(--primary)/10 text-(--primary) px-1.5 py-0.5 text-[10px] font-semibold'>
                          {orgsQuery.data.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value='businesses'
                      disabled={scenario === 'empty-orgs'}
                      className='gap-2 text-xs px-4'
                    >
                      <Briefcase className='h-3.5 w-3.5' />
                      Businesses
                      {!bizQuery.isLoading && bizQuery.data && scenario !== 'empty-orgs' && (
                        <span className='ml-1 rounded-full bg-(--primary)/10 text-(--primary) px-1.5 py-0.5 text-[10px] font-semibold'>
                          {bizQuery.data.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Search input — fijo */}
                <div className='shrink-0 flex justify-center px-4 sm:px-6 pb-4 sm:pb-5'>
                  <div className='relative w-full max-w-md'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--muted-foreground) pointer-events-none' />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={activeTab === 'organizations' ? 'Search organizations…' : 'Search businesses…'}
                      className='pl-8 pr-8 h-9 text-sm'
                    />
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground) transition-colors'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid scrolleable */}
                <div className='flex-1 overflow-y-auto px-4 sm:px-6 pb-8'>
                  <div className='max-w-5xl mx-auto'>

                    {/* ── Organizations tab ── */}
                    <TabsContent value='organizations'>
                      {/* ESCENARIO: Empty orgs */}
                      {scenario === 'empty-orgs' ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-5 text-center'>
                          <div className='h-14 w-14 rounded-full bg-(--muted) flex items-center justify-center'>
                            <Building2 className='h-6 w-6 text-(--muted-foreground)' />
                          </div>
                          <div className='space-y-1.5'>
                            <p className='text-base font-semibold text-(--foreground)'>No organizations yet</p>
                            <p className='text-sm text-(--muted-foreground) max-w-xs'>
                              Get started by creating your first organization to manage your businesses.
                            </p>
                          </div>
                          <Button size='sm' className='gap-2' onClick={() => setModalOpen(true)}>
                            <Plus className='h-3.5 w-3.5' />
                            Create organization
                          </Button>
                        </div>
                      ) : orgsQuery.isError ? (
                        <GridEmptyState
                          icon={<Building2 className='h-8 w-8' />}
                          title='Could not load organizations'
                          description='There was an error loading organizations. Please try again.'
                        />
                      ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                          {orgsQuery.isLoading
                            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <OrgSkeletonCard key={i} />)
                            : filteredOrgs.length === 0
                            ? (
                              <div className='col-span-1 sm:col-span-2 lg:col-span-3'>
                                <GridEmptyState
                                  icon={<Building2 className='h-8 w-8' />}
                                  title={query ? `No results for "${query}"` : 'No organizations found'}
                                  description={query ? 'Try a different search term.' : 'No organizations have been assigned to your account yet.'}
                                />
                              </div>
                            )
                            : filteredOrgs.map((org) => (
                                <OrgCard key={org.id} org={org} onClick={() => handleSelectOrg(org)} />
                              ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* ── Businesses tab ── */}
                    <TabsContent value='businesses'>
                      {bizQuery.isError ? (
                        <GridEmptyState
                          icon={<Briefcase className='h-8 w-8' />}
                          title='Could not load businesses'
                          description='There was an error loading businesses. Please try again.'
                        />
                      ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                          {bizQuery.isLoading
                            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <BizSkeletonCard key={i} />)
                            : filteredBiz.length === 0
                            ? (
                              <div className='col-span-1 sm:col-span-2 lg:col-span-3'>
                                <GridEmptyState
                                  icon={<Briefcase className='h-8 w-8' />}
                                  title={query ? `No results for "${query}"` : 'No businesses found'}
                                  description={query ? 'Try a different search term.' : 'No businesses have been assigned to your account yet.'}
                                />
                              </div>
                            )
                            : filteredBiz.map((biz) => (
                                <BizCard key={biz.id} biz={biz} onClick={() => handleSelectBiz(biz)} />
                              ))}
                        </div>
                      )}
                    </TabsContent>

                  </div>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {/* ── Selector de escenarios (dev tool) — esquina inferior derecha ── */}
      <div className='fixed bottom-5 right-5 z-50'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='h-9 w-9 rounded-full bg-(--card) border border-(--border) shadow-md flex items-center justify-center text-(--muted-foreground) hover:text-(--foreground) hover:shadow-lg transition-all'>
              <FlaskConical className='h-4 w-4' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' side='top' className='w-52 mb-2'>
            <DropdownMenuLabel className='text-[10px] uppercase tracking-widest text-(--muted-foreground) font-semibold'>
              Preview scenarios
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SCENARIOS.map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => setScenario(s.value)}
                className='flex items-center justify-between text-xs cursor-pointer'
              >
                {s.label}
                {scenario === s.value && <Check className='h-3.5 w-3.5 text-(--primary)' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Modal: Create Organization ── */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className='flex max-h-[min(600px,80vh)] flex-col gap-0 p-0 sm:max-w-md'>
          <DialogHeader className='contents space-y-0 text-left'>
            <div className='border-b border-(--border) px-6 py-4 space-y-0.5'>
              <DialogTitle className='text-base'>Create New Organization</DialogTitle>
              <DialogDescription className='text-sm text-(--muted-foreground)'>
                Set up a new organization to manage multiple business properties.
              </DialogDescription>
            </div>
            <ScrollArea className='flex max-h-full flex-col overflow-hidden'>

              <div className='px-6 pb-4 space-y-4'>
                {/* Name */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-(--foreground)'>
                    Name <span className='text-(--destructive)'>*</span>
                  </label>
                  <Input
                    placeholder='e.g. Arcadia Capital Partners'
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className='h-9'
                  />
                </div>

                {/* Code */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-(--foreground)'>
                    Code <span className='text-(--destructive)'>*</span>
                  </label>
                  <Input
                    placeholder='e.g. ACP-001'
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                    className='h-9 font-mono text-xs tracking-widest'
                  />
                </div>

                {/* Description */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-(--foreground)'>Description</label>
                  <Textarea
                    placeholder='Brief description of this organization…'
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    rows={3}
                    className='resize-none text-sm'
                  />
                </div>
              </div>

              <DialogFooter className='flex-row items-center justify-between px-6 pb-6 sm:justify-between'>
                <DialogClose asChild>
                  <Button variant='outline' size='sm' onClick={handleCloseModal} disabled={createMutation.isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  size='sm'
                  disabled={!orgName.trim() || !orgCode.trim() || createMutation.isPending}
                  onClick={() =>
                    createMutation.mutate({
                      name: orgName,
                      code: orgCode,
                      description: orgDescription || undefined,
                    })
                  }
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
              {createMutation.isError && (
                <p className='px-6 pb-4 text-xs text-(--destructive)'>
                  {(createMutation.error as Error)?.message ?? 'Something went wrong. Please try again.'}
                </p>
              )}
            </ScrollArea>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─────────────────────────────────────────────
// Organization Card
// ─────────────────────────────────────────────
function OrgCard({ org, onClick }: { org: Organization; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className='group cursor-pointer transition-all duration-150 hover:border-(--primary) hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
    >
      <div className='p-5 space-y-4'>
        {/* Icon + name + date */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-3 min-w-0'>
            <div className='shrink-0 h-9 w-9 rounded-lg bg-(--muted) flex items-center justify-center text-(--muted-foreground) group-hover:bg-(--primary)/10 group-hover:text-(--primary) transition-colors'>
              <Building2 className='h-4 w-4' />
            </div>
            <div className='min-w-0 space-y-0'>
              <p className='text-sm font-semibold leading-tight text-(--foreground) line-clamp-2'>
                {org.name}
              </p>
              <span className='text-[11px] text-(--muted-foreground)'>Created at: {formatCreatedAt(org.createdAt)}</span>
            </div>
          </div>
          <ArrowRight className='shrink-0 h-3.5 w-3.5 text-(--muted-foreground) opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150' />
        </div>

        {/* Bottom row: View Client Dashboard (left) + badge (right) */}
        <div className='flex items-center justify-between gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='border-primary dark:border-primary border-dashed shadow-none h-7 text-xs px-2.5'
            onClick={(e) => {
              e.stopPropagation()
              window.open(`/client-dashboard?org=${org.id}`, '_blank')
            }}
          >
            <ExternalLink className='h-3 w-3' />
            View Client Dashboard
          </Button>
          <Badge variant='secondary' className='text-[10px] px-2 py-0.5 font-medium rounded-md shrink-0'>
            {org.businessCount} {org.businessCount === 1 ? 'Business' : 'Businesses'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Business Card
// ─────────────────────────────────────────────
function BizCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  const initials = getInitials(biz.name)

  return (
    <Card
      onClick={onClick}
      className='group cursor-pointer transition-all duration-150 hover:border-(--primary) hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
    >
      <div className='p-5 space-y-3'>

        {/* Avatar + name + business type + arrow */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-3 min-w-0'>
            <Avatar className='shrink-0 h-9 w-9 rounded-lg bg-(--muted)'>
              {biz.logoUrl && (
                <AvatarImage src={biz.logoUrl} alt={biz.name} className='rounded-lg object-contain p-1' />
              )}
              <AvatarFallback className='rounded-lg text-xs font-bold bg-(--muted) text-(--foreground)'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 space-y-0.5'>
              <p className='text-sm font-semibold leading-tight text-(--foreground) line-clamp-1'>
                {biz.name}
              </p>
              {biz.businessType && (
                <div className='flex items-center gap-1 text-(--muted-foreground)'>
                  <Tag className='h-3 w-3 shrink-0' />
                  <span className='text-[11px]'>{biz.businessType}</span>
                </div>
              )}
            </div>
          </div>
          <ArrowRight className='shrink-0 h-3.5 w-3.5 text-(--muted-foreground) opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150' />
        </div>

        {/* Badge: organization name */}
        <Badge variant='secondary' className='gap-1.5 text-[10px] px-2 py-0.5 font-medium rounded-md'>
          <Building2 className='h-3 w-3' />
          {biz.organizationName}
        </Badge>

      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────
function OrgSkeletonCard() {
  return (
    <Card className='p-5 space-y-4'>
      <Skeleton className='h-9 w-9 rounded-lg' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-3 w-2/5' />
      </div>
    </Card>
  )
}

function BizSkeletonCard() {
  return (
    <Card className='p-5 space-y-4'>
      <Skeleton className='h-10 w-10 rounded-lg' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-3/5' />
        <Skeleton className='h-5 w-1/3 rounded-md' />
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
function GridEmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center gap-3'>
      <div className='text-(--muted-foreground)/40'>{icon}</div>
      <p className='text-sm font-medium text-(--foreground)'>{title}</p>
      <p className='text-xs text-(--muted-foreground) max-w-xs'>{description}</p>
    </div>
  )
}
