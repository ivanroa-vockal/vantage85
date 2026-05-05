import { useMemo, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BriefcaseIcon, ChevronsUpDownIcon, PlusIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchBusinesses } from '@/services/workspace'
import type { Business } from '@/types/workspace'
import { CreateBusinessModal } from '@/components/modals/CreateBusinessModal'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

function BusinessAvatar({ business }: { business: Business }) {
  return (
    <Avatar className='size-9.5 shrink-0 rounded-md'>
      {business.logoUrl ? (
        <AvatarImage src={business.logoUrl} alt='' className='object-cover' />
      ) : null}
      <AvatarFallback className='rounded-md bg-muted text-xs font-medium text-foreground'>
        {getInitials(business.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function NameTypeColumn({ name, typeLine }: { name: string; typeLine: string }) {
  return (
    <div className='flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left'>
      <span className='w-full truncate text-sm font-semibold leading-tight'>{name}</span>
      <span className='text-muted-foreground w-full truncate text-xs leading-tight'>{typeLine}</span>
    </div>
  )
}

export function SidebarBusinessSelector() {
  const { selected, setWorkspace } = useWorkspaceStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const organizationId = useMemo(() => {
    if (!selected) return null
    if (selected.type === 'organization') return selected.id
    return selected.organizationId ?? null
  }, [selected])

  const { data: allBusinesses = [], isLoading, isError } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
    enabled: !!organizationId,
  })

  const businesses = useMemo(
    () => allBusinesses.filter((b) => b.organizationId === organizationId),
    [allBusinesses, organizationId]
  )

  const filtered = useMemo(
    () => businesses.filter((b) => b.name.toLowerCase().includes(search.toLowerCase().trim())),
    [businesses, search]
  )

  // Auto-select first business when an organization is selected
  useEffect(() => {
    if (!isLoading && selected?.type === 'organization' && businesses.length > 0) {
      const first = businesses[0]
      setWorkspace({
        id: first.id,
        name: first.name,
        type: 'business',
        organizationId: first.organizationId,
      })
    }
  }, [isLoading, businesses, selected?.type, setWorkspace])

  const activeBusiness =
    selected?.type === 'business'
      ? businesses.find((b) => b.id === selected.id)
      : undefined

  const triggerPrimary = activeBusiness?.name ?? 'Select a business'
  const triggerTypeLine = activeBusiness?.businessType.trim() || '—'

  const triggerAvatar = activeBusiness ? (
    <BusinessAvatar business={activeBusiness} />
  ) : (
    <Avatar className='size-9.5 shrink-0 rounded-md'>
      <AvatarFallback className='rounded-md bg-muted'>
        <BriefcaseIcon className='size-5 text-muted-foreground' />
      </AvatarFallback>
    </Avatar>
  )

  if (!organizationId) {
    return (
      <div className='group-data-[collapsible=icon]:hidden'>
        <Button variant='secondary' className='h-fit w-full justify-start px-3 py-2.5 font-normal' asChild>
          <a href='/select-workspace'>
            <BriefcaseIcon className='size-5 shrink-0' />
            <span className='truncate text-sm'>Choose workspace</span>
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className='group-data-[collapsible=icon]:hidden'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='secondary'
            className='h-fit w-full justify-start gap-3 bg-sidebar-accent/60 hover:bg-sidebar-accent px-3 py-2.5 font-normal'
            disabled={isError}
          >
            {isLoading ? (
              <Skeleton className='size-9.5 shrink-0 rounded-md' />
            ) : (
              triggerAvatar
            )}
            <NameTypeColumn name={triggerPrimary} typeLine={triggerTypeLine} />
            <ChevronsUpDownIcon className='size-4 shrink-0 opacity-60' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='min-w-[14rem] max-w-[min(18.75rem,calc(100vw-2rem))] flex flex-col p-0 overflow-x-hidden data-[state=closed]:slide-out-to-left-20 data-[state=open]:slide-in-from-left-20 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 duration-400'
          align='start'
          side='right'
        >
          <DropdownMenuLabel className='flex items-center gap-2 px-3 pt-3'>
            Businesses
            <span
              className='flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-black'
              style={{ backgroundColor: '#E9F000' }}
            >
              {businesses.length}
            </span>
          </DropdownMenuLabel>
          <div className='px-2 pt-2 pb-1'>
            <div className='relative'>
              <SearchIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
              <Input
                placeholder='Search...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className='h-8 pl-8 text-xs'
              />
            </div>
          </div>
          <DropdownMenuSeparator />

          <div className='overflow-y-auto overflow-x-hidden'>
            {isLoading && (
              <div className='space-y-2 p-2'>
                <Skeleton className='h-14 w-full' />
                <Skeleton className='h-14 w-full' />
              </div>
            )}
            {!isLoading && businesses.length === 0 && (
              <div className='flex flex-col items-center gap-3 px-3 py-5 text-center'>
                <p className='text-sm font-medium'>This organization has no businesses yet</p>
                <p className='text-xs text-muted-foreground'>Create a business to get started.</p>
              </div>
            )}
            {!isLoading && businesses.length > 0 && filtered.length === 0 && (
              <div className='flex flex-col items-center gap-1 px-3 py-5 text-center'>
                <SearchIcon className='size-4 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>No results for "{search}"</p>
              </div>
            )}
            {!isLoading &&
              filtered.map((biz) => (
                <DropdownMenuCheckboxItem
                  key={biz.id}
                  className='data-[state=checked]:bg-muted cursor-pointer gap-3 px-3 py-2.5 [&>span]:hidden'
                  checked={selected?.type === 'business' && selected.id === biz.id}
                  onCheckedChange={(checked) => {
                    if (!checked) return
                    setWorkspace({
                      id: biz.id,
                      name: biz.name,
                      type: 'business',
                      organizationId: biz.organizationId,
                    })
                  }}
                >
                  <BusinessAvatar business={biz} />
                  <NameTypeColumn
                    name={biz.name}
                    typeLine={biz.businessType.trim() || '—'}
                  />
                </DropdownMenuCheckboxItem>
              ))}
          </div>

          <DropdownMenuSeparator />
          <div className='p-1'>
            <DropdownMenuItem
              className='bg-primary/10 focus:bg-primary/15 text-primary justify-center gap-2 cursor-pointer'
              onSelect={(e) => { e.preventDefault(); setModalOpen(true) }}
            >
              <PlusIcon className='size-4' />
              Add new Business
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateBusinessModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultOrganizationId={organizationId ?? undefined}
        onSuccess={(biz) => {
          setWorkspace({ id: biz.id, name: biz.name, type: 'business', organizationId: biz.organizationId })
        }}
      />
    </div>
  )
}
