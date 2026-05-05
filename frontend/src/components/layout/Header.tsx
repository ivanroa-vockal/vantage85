import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronsUpDownIcon, BuildingIcon, PlusIcon, SearchIcon, SettingsIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchOrganizations } from '@/services/workspace'
import { CreateOrganizationModal } from '@/components/modals/CreateOrganizationModal'
import { EditOrganizationModal } from '@/components/modals/EditOrganizationModal'
import type { Organization } from '@/types/workspace'

function OrganizationDropdown() {
  const { selected, setWorkspace } = useWorkspaceStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editOrg, setEditOrg] = useState<Organization | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  })

  const activeOrg = organizations.find((o) =>
    selected?.type === 'organization'
      ? o.id === selected.id
      : o.id === selected?.organizationId
  )

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  const triggerName = activeOrg?.name ?? selected?.name ?? 'Select organization'
  const triggerCount = activeOrg?.businessCount ?? 0

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none'>
          {isLoading ? (
            <Skeleton className='h-4 w-32' />
          ) : (
            <>
              <div className='flex flex-col leading-none'>
                <span className='text-sm font-semibold'>{triggerName}</span>
                <span className='text-xs text-muted-foreground'>
                  {triggerCount} {triggerCount === 1 ? 'business' : 'businesses'}
                </span>
              </div>
              <ChevronsUpDownIcon className='size-4 shrink-0 text-muted-foreground' />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' side='bottom' className='flex w-64 flex-col p-0 overflow-x-hidden'>
        <DropdownMenuLabel className='flex items-center gap-2 px-3 pt-3'>
          Organizations
          <span
            className='flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-black'
            style={{ backgroundColor: '#E9F000' }}
          >
            {organizations.length}
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
        <div className='overflow-y-auto overflow-x-hidden max-h-[296px]'>
          {isLoading && (
            <div className='space-y-2 p-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          )}
          {!isLoading && organizations.length === 0 && (
            <div className='flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground'>
              <BuildingIcon className='size-4' />
              No organizations found
            </div>
          )}
          {!isLoading && organizations.length > 0 && filtered.length === 0 && (
            <div className='flex flex-col items-center gap-1 px-3 py-5 text-center'>
              <SearchIcon className='size-4 text-muted-foreground' />
              <p className='text-sm text-muted-foreground'>No results for "{search}"</p>
            </div>
          )}
          {!isLoading &&
            filtered.map((org) => {
              const isActive =
                selected?.type === 'organization'
                  ? selected.id === org.id
                  : selected?.organizationId === org.id

              return (
                <DropdownMenuCheckboxItem
                  key={org.id}
                  className='group/org-item cursor-pointer gap-3 px-3 py-2.5 [&>span]:hidden'
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    if (!checked) return
                    setWorkspace({ id: org.id, name: org.name, type: 'organization' })
                  }}
                >
                  <div className='flex flex-1 min-w-0 flex-col leading-none'>
                    <span className='text-sm font-semibold truncate'>{org.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {org.businessCount} {org.businessCount === 1 ? 'business' : 'businesses'}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={(e) => { e.stopPropagation(); setEditOrg(org) }}
                    className='ml-auto shrink-0 flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover/org-item:opacity-100 hover:bg-muted hover:text-foreground transition-all'
                  >
                    <SettingsIcon className='size-3.5' />
                  </button>
                </DropdownMenuCheckboxItem>
              )
            })}
        </div>
        <DropdownMenuSeparator />
        <div className='p-1'>
          <DropdownMenuItem
            className='bg-primary/10 focus:bg-primary/15 text-primary justify-center gap-2 cursor-pointer'
            onSelect={(e) => { e.preventDefault(); setModalOpen(true) }}
          >
            <PlusIcon className='size-4' />
            Add new organization
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <CreateOrganizationModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      onSuccess={(org) => {
        setWorkspace({ id: org.id, name: org.name, type: 'organization' })
        navigate('/business-profile')
      }}
    />

    {editOrg && (
      <EditOrganizationModal
        open={!!editOrg}
        onOpenChange={(open) => { if (!open) setEditOrg(null) }}
        organization={editOrg}
        onSuccess={(org) => {
          if (selected?.id === org.id) {
            setWorkspace({ id: org.id, name: org.name, type: 'organization' })
          }
        }}
      />
    )}
    </>
  )
}

export function Header() {
  const { selected } = useWorkspaceStore()

  return (
    <header className='bg-white sticky top-0 z-10 flex min-w-0 shrink-0 items-center justify-between gap-3 border-b -mx-3 px-5 py-2 sm:gap-6 sm:px-6 rounded-t-[16px]'>
      <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-4'>
        <SidebarTrigger className='[&_svg]:!size-5' />
        <Separator orientation='vertical' className='hidden !h-4 sm:block' />
        {selected && (
          <span className='hidden min-w-0 truncate text-sm font-medium text-muted-foreground sm:block'>
            {selected.name}
          </span>
        )}
      </div>

      <div className='flex shrink-0 items-center'>
        <OrganizationDropdown />
      </div>
    </header>
  )
}
