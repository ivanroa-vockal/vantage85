import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PlusIcon, GalleryVerticalEndIcon, ArrowUpRightIcon, SettingsIcon,
  SproutIcon, CarIcon, LandmarkIcon, HardHatIcon, GraduationCapIcon,
  ZapIcon, ClapperboardIcon, UtensilsCrossedIcon, ScaleIcon, StethoscopeIcon,
  HotelIcon, ShieldCheckIcon, FactoryIcon, HeartIcon, BriefcaseIcon,
  ShoppingCartIcon, Code2Icon, RadioIcon, TruckIcon, MoreHorizontalIcon,
  BuildingIcon,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchBusinesses } from '@/services/workspace'
import { CreateBusinessModal } from '@/components/modals/CreateBusinessModal'
import { EditBusinessModal } from '@/components/modals/EditBusinessModal'
import { BusinessStats } from '@/components/BusinessStats'

// ── Industry icon map ──────────────────────────────────────────────────────

const INDUSTRY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  agriculture:      SproutIcon,
  automotive:       CarIcon,
  banking:          LandmarkIcon,
  construction:     HardHatIcon,
  education:        GraduationCapIcon,
  energy:           ZapIcon,
  entertainment:    ClapperboardIcon,
  food:             UtensilsCrossedIcon,
  government:       ScaleIcon,
  healthcare:       StethoscopeIcon,
  hospitality:      HotelIcon,
  insurance:        ShieldCheckIcon,
  manufacturing:    FactoryIcon,
  nonprofit:        HeartIcon,
  professional:     BriefcaseIcon,
  retail:           ShoppingCartIcon,
  technology:       Code2Icon,
  telecommunications: RadioIcon,
  transportation:   TruckIcon,
  other:            MoreHorizontalIcon,
}

const INDUSTRY_LABELS: Record<string, string> = {
  agriculture:      'Agriculture & Farming',
  automotive:       'Automotive',
  banking:          'Banking & Financial Services',
  construction:     'Construction & Real Estate',
  education:        'Education & Training',
  energy:           'Energy & Utilities',
  entertainment:    'Entertainment & Media',
  food:             'Food & Beverage',
  government:       'Government & Public Sector',
  healthcare:       'Healthcare & Pharmaceuticals',
  hospitality:      'Hospitality & Tourism',
  insurance:        'Insurance',
  manufacturing:    'Manufacturing',
  nonprofit:        'Non-Profit & NGO',
  professional:     'Professional Services',
  retail:           'Retail & E-commerce',
  technology:       'Technology & Software',
  telecommunications: 'Telecommunications',
  transportation:   'Transportation & Logistics',
  other:            'Other',
}

// ── helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}

function normalizeUrl(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}

// ── Description with expand ────────────────────────────────────────────────

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className='max-w-[600px]'>
      <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
      {text.length > 120 && (
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className='mt-1 text-xs text-primary hover:underline'
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────

export default function BusinessProfile() {
  const { selected, setWorkspace } = useWorkspaceStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const organizationId =
    selected?.type === 'organization' ? selected.id : selected?.organizationId

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
    enabled: !!organizationId,
  })

  const business = selected?.type === 'business'
    ? businesses.find((b) => b.id === selected.id)
    : undefined

  const hasBusiness = !!business

  // ── Empty state ────────────────────────────────────────────────────────
  if (!hasBusiness) {
    return (
      <>
        <div className='flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <GalleryVerticalEndIcon className='size-7' />
          </div>
          <div className='space-y-1'>
            <p className='text-base font-semibold'>Get started by creating a business</p>
            <p className='text-sm text-muted-foreground max-w-xs'>
              Set up your first business to access your dashboard and insights.
            </p>
          </div>
          <Button size='sm' className='gap-2' onClick={() => setModalOpen(true)}>
            <PlusIcon className='size-4' />
            Add new business
          </Button>
        </div>

        <CreateBusinessModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          defaultOrganizationId={organizationId}
          onSuccess={(biz) => {
            setWorkspace({ id: biz.id, name: biz.name, type: 'business', organizationId: biz.organizationId })
          }}
        />
      </>
    )
  }

  // ── Business header ────────────────────────────────────────────────────
  const IndustryIcon = INDUSTRY_ICONS[business.businessType] ?? BuildingIcon
  const industryLabel = INDUSTRY_LABELS[business.businessType] ?? business.businessType

  return (
    <div className='space-y-6 px-1'>
      {/* Title */}
      <h1 className='text-base font-semibold leading-6'>Business Profile</h1>

      {/* Card */}
      <div className='space-y-4'>

        {/* Row: avatar | content | settings */}
        <div className='flex items-start gap-4'>
          {/* Avatar */}
          <Avatar className='size-[100px] rounded-2xl shrink-0'>
            {business.logoUrl
              ? <AvatarImage src={business.logoUrl} className='object-cover' />
              : null}
            <AvatarFallback className='rounded-2xl bg-muted text-xl font-bold'>
              {getInitials(business.name)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className='flex-1 min-w-0 space-y-2 pt-1'>
            {/* Name + website arrow */}
            <div className='flex items-center gap-1.5'>
              <h2 className='text-lg font-semibold leading-tight'>{business.name}</h2>
              {business.websites[0] && (
                <a
                  href={normalizeUrl(business.websites[0])}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-foreground hover:text-muted-foreground transition-colors'
                  title={business.websites[0]}
                >
                  <ArrowUpRightIcon className='size-4' />
                </a>
              )}
            </div>

            {/* Industry badge */}
            <div className='inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground'>
              <IndustryIcon className='size-3.5 shrink-0' />
              {industryLabel}
            </div>

            {/* Description */}
            {business.description && (
              <ExpandableDescription text={business.description} />
            )}
          </div>

          {/* Settings button */}
          <button
            type='button'
            onClick={() => setEditOpen(true)}
            className='shrink-0 flex size-8 items-center justify-center rounded-md border border-(--border) text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          >
            <SettingsIcon className='size-4' />
          </button>
        </div>

      </div>

      {/* Stats row */}
      <BusinessStats />

      <EditBusinessModal
        open={editOpen}
        onOpenChange={setEditOpen}
        business={business}
        onSuccess={(updated) => {
          setWorkspace({ id: updated.id, name: updated.name, type: 'business', organizationId: updated.organizationId })
        }}
        onDeleted={() => {
          setWorkspace({ id: business.organizationId, name: business.organizationName, type: 'organization' })
        }}
      />
    </div>
  )
}
