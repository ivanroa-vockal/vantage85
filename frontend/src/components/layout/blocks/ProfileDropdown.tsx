import type { ReactNode } from 'react'
import {
  UserIcon,
  SettingsIcon,
  CreditCardIcon,
  UsersIcon,
  Building2,
  LogOutIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { selected, clearWorkspace } = useWorkspaceStore()

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'V'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSwitchWorkspace = () => {
    clearWorkspace()
    navigate('/select-workspace')
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align={align}>
        <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
          <div className='relative'>
            <Avatar className='size-10 rounded-md'>
              <AvatarFallback className='rounded-md text-sm font-semibold'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start min-w-0'>
            <span className='text-foreground text-lg font-semibold truncate w-full'>{user?.email}</span>
            {selected && (
              <span className='text-muted-foreground text-sm truncate w-full'>{selected.name}</span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-4 py-2.5 text-base' onClick={() => navigate('/settings')}>
            <UserIcon className='text-foreground size-5' />
            <span>My account</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base' onClick={() => navigate('/settings')}>
            <SettingsIcon className='text-foreground size-5' />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <CreditCardIcon className='text-foreground size-5' />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <UsersIcon className='text-foreground size-5' />
            <span>Manage team</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base' onClick={handleSwitchWorkspace}>
            <Building2 className='text-foreground size-5' />
            <span>Switch workspace</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant='destructive' className='px-4 py-2.5 text-base' onClick={handleSignOut}>
          <LogOutIcon className='size-5' />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
