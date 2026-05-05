import { EllipsisIcon, LogOutIcon, SettingsIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/store/authStore'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function SidebarUserMenu() {
  const { user, signOut } = useAuthStore()

  const fullName: string =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'User'

  const email = user?.email ?? ''
  const initials = getInitials(fullName)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              tooltip={fullName}
              className='data-[state=open]:bg-sidebar-accent'
            >
              <Avatar className='size-8 shrink-0 rounded-md'>
                <AvatarFallback className='rounded-md bg-primary text-xs font-semibold text-primary-foreground'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='flex min-w-0 flex-1 flex-col gap-0.5 leading-none'>
                <span className='truncate text-sm font-semibold'>{fullName}</span>
                <span className='text-muted-foreground truncate text-xs'>{email}</span>
              </div>
              <EllipsisIcon className='size-4 shrink-0 text-muted-foreground' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side='right'
            align='end'
            className='w-64 data-[state=closed]:slide-out-to-left-20 data-[state=open]:slide-in-from-left-20 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 duration-400'
          >
            <DropdownMenuLabel className='flex items-center gap-3 py-2'>
              <Avatar className='size-8 shrink-0 rounded-md'>
                <AvatarFallback className='rounded-md bg-primary text-xs font-semibold text-primary-foreground'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='flex min-w-0 flex-col gap-0.5 leading-none'>
                <span className='truncate text-sm font-semibold'>{fullName}</span>
                <span className='text-muted-foreground truncate text-xs font-normal'>{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SettingsIcon className='size-4' />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={signOut}
            >
              <LogOutIcon className='size-4' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
