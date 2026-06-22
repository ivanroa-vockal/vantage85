import { useMemo, type ReactElement } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueries } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bar, BarChart, Cell } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { BuildingIcon, Building2Icon, ShieldCheckIcon, ArrowRightIcon } from 'lucide-react'
import { fetchOrganizations, fetchBusinesses } from '@/services/workspace'
import { fetchTactics } from '@/services/roadmap'
import logoWordmarkUrl from '@/assets/logo-wordmark.png'
import type { Business } from '@/types/workspace'
import type { Tactic } from '@/types/roadmap'

// ── Constants ────────────────────────────────────────────────────────────────


// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function avgProgress(tactics: Tactic[]): number {
  if (!tactics.length) return 0
  return Math.round(tactics.reduce((sum, t) => sum + t.progress, 0) / tactics.length)
}



// ── Hero metric card ─────────────────────────────────────────────────────────

function HeroMetricCard({
  icon,
  title,
  description,
  score,
  max,
}: {
  icon: ReactElement
  title: string
  description: string
  score: number
  max?: number
}) {
  return (
    <Card>
      <CardContent className='flex items-center gap-2 p-5'>
        <Avatar className='size-8 rounded-sm after:border-0 shrink-0'>
          <AvatarFallback className='bg-primary/10 text-primary rounded-sm [&>svg]:size-4'>
            {icon}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium'>{title}</p>
          <p className='text-muted-foreground text-xs'>{description}</p>
        </div>
        <span className='font-bold text-3xl tracking-tight shrink-0'>
          {score}
          {max !== undefined && <span className='text-muted-foreground text-sm font-normal'>/{max}</span>}
        </span>
      </CardContent>
    </Card>
  )
}

function HeroMetrics({ businesses }: { businesses: Business[] }) {
  const results = useQueries({
    queries: businesses.map((b) => ({
      queryKey: ['tactics', b.id],
      queryFn: () => fetchTactics(b.id),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const allTactics = results.flatMap((r) => r.data ?? [])

  const orgScore = allTactics.length ? Math.round(avgProgress(allTactics) / 10) : 0

  const healthyCount = businesses.filter((_, i) => {
    const tactics = results[i]?.data ?? []
    return avgProgress(tactics) >= 80
  }).length

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 mt-8'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-5 space-y-4'>
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-6 w-1/2' />
              <Skeleton className='h-2 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 mt-8'>
      <HeroMetricCard
        icon={<BuildingIcon />}
        title='Organization Level'
        description='Organization Score'
        score={orgScore}
        max={10}
      />
      <HeroMetricCard
        icon={<Building2Icon />}
        title='Business'
        description='Total businesses analyzed'
        score={businesses.length}
      />
      <HeroMetricCard
        icon={<ShieldCheckIcon />}
        title='Healthy Companies'
        description='Companies with 8↑ score'
        score={healthyCount}
        max={businesses.length || 1}
      />
    </div>
  )
}

// ── Business card ────────────────────────────────────────────────────────────

const scoreChartConfig: ChartConfig = { v: { label: 'Score' } }

const SCORE_BARS = 10

function makeScoreBars(pct: number) {
  const filled = Math.round((pct * SCORE_BARS) / 100)
  return Array.from({ length: SCORE_BARS }, (_, i) => ({ v: i < filled ? 1 : 0.001 }))
}

function scoreColor(pct: number): string {
  if (pct < 40) return 'var(--destructive)'
  if (pct < 75) return 'var(--dvcp)'
  return '#22c55e'
}

function formatLastUpdated(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function BusinessCard({ business, tactics, orgId }: {
  business: Business
  tactics: Tactic[]
  orgId: string
}) {
  const navigate = useNavigate()
  const avg = avgProgress(tactics)
  const barData = makeScoreBars(avg)
  const color = scoreColor(avg)
  const lastUpdated = formatLastUpdated(business.createdAt)

  return (
    <Card>
      <CardContent className='flex items-center gap-4 p-5'>
        {/* Avatar */}
        <Avatar className='size-12 shrink-0 rounded-lg after:border-0'>
          {business.logoUrl && <AvatarImage src={business.logoUrl} alt='' className='object-cover' />}
          <AvatarFallback className='rounded-lg bg-muted text-sm font-bold'>
            {getInitials(business.name)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <p className='text-base font-semibold truncate leading-snug'>{business.name}</p>
          <p className='text-sm text-muted-foreground truncate'>{business.businessType || '—'}</p>
        </div>

        {/* Score */}
        <div className='flex items-center gap-6 shrink-0'>
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
          <div className='text-left'>
            <div className='flex items-center gap-1.5'>
              <Badge variant='outline' className='text-[10px] font-semibold pointer-events-none'>
                Overall Score
              </Badge>
              <p className='text-base font-semibold leading-none'>
                {Math.round(avg / 10)}
                <span className='text-muted-foreground text-sm font-normal'>/10</span>
              </p>
            </div>
            <p className='text-[10px] text-muted-foreground mt-1 whitespace-nowrap'>Last updated on {lastUpdated}</p>
          </div>
          <button
            onClick={() => navigate(`/client-business?org=${orgId}&business=${business.id}`)}
            className='shrink-0 inline-flex items-center gap-1.5 rounded-(--radius) border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted'
          >
            View Business Profile
            <ArrowRightIcon className='size-3' />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function BusinessCardSkeleton() {
  return (
    <Card className='overflow-hidden p-0 gap-0'>
      <div className='h-[3px] w-full bg-muted' />
      <div className='p-[18px] space-y-4'>
        <div className='flex gap-3'>
          <Skeleton className='size-9 rounded-md shrink-0' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
        <div className='space-y-2'>
          {[...Array(4)].map((_, i) => <Skeleton key={i} className='h-3 w-full' />)}
        </div>
        <div className='space-y-2 pt-3 border-t'>
          {[...Array(3)].map((_, i) => <Skeleton key={i} className='h-3 w-full' />)}
        </div>
      </div>
    </Card>
  )
}

// ── Per-business data fetcher ────────────────────────────────────────────────

function useBusinessData(businessId: string) {
  const tactics = useQuery({
    queryKey: ['tactics', businessId],
    queryFn: () => fetchTactics(businessId),
  })
  return { tactics: tactics.data ?? [], isLoading: tactics.isLoading }
}

function BusinessCardWithData({ business, orgId }: { business: Business; orgId: string }) {
  const { tactics, isLoading } = useBusinessData(business.id)
  if (isLoading) return <BusinessCardSkeleton />
  return <BusinessCard business={business} tactics={tactics} orgId={orgId} />
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const [params] = useSearchParams()
  const orgId = params.get('org')

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

  const org = useMemo(() => orgs.find((o) => o.id === orgId), [orgs, orgId])
  const businesses = useMemo(
    () => allBusinesses.filter((b) => b.organizationId === orgId),
    [allBusinesses, orgId]
  )

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  if (!orgId) {
    return (
      <div className='flex h-screen items-center justify-center text-muted-foreground text-sm'>
        No organization specified.
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>

      {/* ── Dark primary band: topbar + hero ───────────────────────────────── */}
      <div className='relative bg-primary text-primary-foreground'>

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

            {/* Right: date + export */}
            <div className='flex items-center gap-3'>
              <span className='hidden font-mono text-[11px] text-primary-foreground/50 sm:block'>{today}</span>
              <button
                onClick={() => window.print()}
                className='inline-flex items-center gap-1.5 rounded-(--radius) border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/20'
              >
                ↓ Export PDF
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className='mx-auto max-w-[1200px] px-8 pt-10 pb-14'>
          <div className='flex items-center gap-3 mb-4'>
            <Badge className='bg-(--dvcp) text-(--dvcp-foreground) border-0 text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 pointer-events-none'>
              DVCP · Digital Value Creation Plan
            </Badge>
          </div>

          {orgsLoading ? (
            <div className='space-y-2'>
              <Skeleton className='h-9 w-64 bg-primary-foreground/20' />
              <Skeleton className='h-4 w-96 bg-primary-foreground/20' />
            </div>
          ) : (
            <>
              <h1 className='text-[32px] font-semibold tracking-tight leading-tight mb-2 text-primary-foreground'>
                {org?.name ?? '—'}
              </h1>
              {org?.description && (
                <p className='text-sm text-primary-foreground/60 max-w-lg leading-relaxed'>
                  {org.description}
                </p>
              )}
            </>
          )}

          {!bizLoading && <HeroMetrics businesses={businesses} />}
        </div>
      </div>

      <div className='mx-auto max-w-[1200px] px-8 pb-16'>
        {/* Businesses */}
        <div className='mt-10'>
          <div className='flex items-center gap-3 mb-5'>
            <span className='text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap'>
              Portfolio Businesses
            </span>
            <Badge variant='outline' className='text-[10px] font-semibold'>
              {businesses.length}
            </Badge>
            <div className='h-px flex-1 bg-border' />
          </div>


          {bizLoading ? (
            <div className='flex flex-col gap-3'>
              {[...Array(3)].map((_, i) => <BusinessCardSkeleton key={i} />)}
            </div>
          ) : businesses.length === 0 ? (
            <div className='py-16 text-center text-sm text-muted-foreground'>
              No businesses found for this organization.
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              {businesses.map((biz) => (
                <BusinessCardWithData key={biz.id} business={biz} orgId={orgId!} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className='border-t'>
        <div className='mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4'>
          <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
            <span className='font-bold uppercase tracking-widest text-foreground'>Vockal</span>
            <span>·</span>
            <span>DVCP — Digital Value Creation Plan</span>
          </div>
          <span className='font-mono text-[11px] text-muted-foreground'>Vantage 85 · Confidential</span>
        </div>
      </footer>
    </div>
  )
}
