import type { ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookmarkCheck,
  ChartPie,
  Crown,
  Route,
  ClipboardCheck,
  LibraryBig,
  LayoutGrid,
} from 'lucide-react'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import logoSidebarUrl from '@/assets/logo-sidebar.png'
import logoWordmarkUrl from '@/assets/logo-wordmark.png'
import { SidebarBusinessSelector } from './blocks/SidebarBusinessSelector'
import { SidebarUserMenu } from './blocks/SidebarUserMenu'
import { useWorkspaceStore } from '@/store/workspaceStore'

type NavItem = {
  icon: ComponentType<{ className?: string }>
  label: string
  to: string
  alwaysDisabled?: boolean
  requiresBusiness?: boolean
}

const dvcpItems: NavItem[] = [
  { icon: BookmarkCheck, label: 'Business Profile', to: '/business-profile' },
  { icon: ChartPie,      label: 'Scorecards',       to: '/scorecards',     requiresBusiness: true },
  { icon: Crown,         label: 'Value Drivers',    to: '/value-drivers',  requiresBusiness: true },
  { icon: Route,         label: 'Roadmap',          to: '/roadmap',        requiresBusiness: true },
]

const moreItems: NavItem[] = [
  { icon: ClipboardCheck, label: 'Reports',      to: '/reports',       requiresBusiness: true },
  { icon: LibraryBig,     label: 'File Library', to: '/file-library',  requiresBusiness: true },
  { icon: LayoutGrid,     label: 'Apps',         to: '/apps',          alwaysDisabled: true },
]

function NavGroup({ data, label, hasBusiness }: { data: NavItem[]; label?: string; hasBusiness: boolean }) {
  const { pathname } = useLocation()
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className='text-sidebar-foreground/30'>
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map((item) => {
            const isDisabled = item.alwaysDisabled || (item.requiresBusiness && !hasBusiness)
            const isActive = pathname === item.to
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  tooltip={item.label}
                  isActive={isActive}
                  disabled={isDisabled}
                  asChild={!isDisabled}
                  className={isDisabled ? 'cursor-not-allowed opacity-40' : isActive ? 'font-semibold' : ''}
                >
                  {isDisabled ? (
                    <>
                      <item.icon className='size-4' />
                      <span>{item.label}</span>
                    </>
                  ) : (
                    <NavLink to={item.to}>
                      <item.icon className='size-4' />
                      <span>{item.label}</span>
                    </NavLink>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { selected } = useWorkspaceStore()
  const hasBusiness = selected?.type === 'business'

  return (
    <ShadcnSidebar collapsible='icon' className='!border-r-0'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              tooltip='Vantage 85'
              className='gap-2.5 !bg-transparent'
              asChild
            >
              <NavLink to='/' className='min-w-0'>
                <img
                  src={logoSidebarUrl}
                  alt=''
                  className='size-8 shrink-0 rounded-full object-cover'
                  aria-hidden
                />
                <img
                  src={logoWordmarkUrl}
                  alt='Vantage 85'
                  className='h-7 w-auto max-w-[min(100%,11rem)] shrink object-contain object-left group-data-[collapsible=icon]:hidden dark:brightness-0 dark:invert'
                />
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarBusinessSelector />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup data={dvcpItems} label='DVCP — Digital Value Creation Plan' hasBusiness={hasBusiness} />
        <NavGroup data={moreItems} label='More' hasBusiness={hasBusiness} />
      </SidebarContent>
      <SidebarFooter className='p-2'>
        <SidebarUserMenu />
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
