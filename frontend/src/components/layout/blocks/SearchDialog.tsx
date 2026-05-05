'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Settings,
  TrendingUp,
  ArrowUpIcon,
  ArrowDownIcon,
  Undo2Icon,
  MoreVerticalIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  className?: string
}

const SearchDialog = ({ defaultOpen = false, trigger, className }: Props) => {
  const [open, setOpen] = useState(defaultOpen)
  const [search, setSearch] = useState('')

  return (
    <div className={className}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder='Search here...'
          value={search}
          onValueChange={setSearch}
          className='text-base [svg:has(+&)]:size-5 [svg:has(+&)]:opacity-100'
        />

        <CommandList className='max-h-[65vh]'>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup
            heading='Navigation'
            className='[&_[cmdk-group-heading]]:text-muted-foreground !px-4 !py-6 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:uppercase'
          >
            <CommandItem onSelect={() => setOpen(false)} className='!py-1.5 text-base'>
              <LayoutDashboard className='text-foreground !size-4.5' />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='!py-1.5 text-base'>
              <Building2 className='text-foreground !size-4.5' />
              <span>Organizations</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='!py-1.5 text-base'>
              <Briefcase className='text-foreground !size-4.5' />
              <span>Businesses</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='!py-1.5 text-base'>
              <Users className='text-foreground !size-4.5' />
              <span>Users</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='!py-1.5 text-base'>
              <TrendingUp className='text-foreground !size-4.5' />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='!py-1.5 text-base'>
              <Settings className='text-foreground !size-4.5' />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup
            heading='Recent Workspaces'
            className='[&_[cmdk-group-heading]]:text-muted-foreground !px-4 !py-6 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:uppercase'
          >
            <CommandItem onSelect={() => setOpen(false)} className='gap-3 !py-1.5 text-base'>
              <Avatar className='size-9.5'>
                <AvatarFallback className='text-xs font-bold'>AC</AvatarFallback>
              </Avatar>
              <div className='flex w-full flex-col items-start'>
                <span className='font-medium'>Arcadia Capital Partners</span>
                <span className='text-muted-foreground text-sm'>Private Equity Fund</span>
              </div>
              <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2'>
                <Avatar>
                  <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' alt='Member' />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png' alt='Member' />
                  <AvatarFallback>KC</AvatarFallback>
                </Avatar>
              </div>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='gap-3 !py-1.5 text-base'>
              <Avatar className='size-9.5'>
                <AvatarFallback className='text-xs font-bold'>NP</AvatarFallback>
              </Avatar>
              <div className='flex w-full flex-col items-start'>
                <span className='font-medium'>Nexus Private Equity</span>
                <span className='text-muted-foreground text-sm'>Private Equity Fund</span>
              </div>
              <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2'>
                <Avatar>
                  <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png' alt='Member' />
                  <AvatarFallback>VB</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>+5</AvatarFallback>
                </Avatar>
              </div>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup
            heading='Businesses'
            className='[&_[cmdk-group-heading]]:text-muted-foreground !px-4 !py-6 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:uppercase'
          >
            <CommandItem onSelect={() => setOpen(false)} className='gap-3 !py-1.5 text-base'>
              <Avatar className='size-9.5'>
                <AvatarFallback className='text-xs font-bold'>ML</AvatarFallback>
              </Avatar>
              <div className='flex w-full flex-col items-start'>
                <span className='font-medium'>Mercado Libre</span>
                <span className='text-muted-foreground text-sm font-light'>E-commerce · Arcadia Capital</span>
              </div>
              <Badge className='bg-green-600/10 px-3 py-1 font-normal text-green-600 dark:bg-green-400/10 dark:text-green-400'>
                Active
              </Badge>
              <MoreVerticalIcon />
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} className='gap-3 !py-1.5 text-base'>
              <Avatar className='size-9.5'>
                <AvatarFallback className='text-xs font-bold'>NU</AvatarFallback>
              </Avatar>
              <div className='flex w-full flex-col items-start'>
                <span className='font-medium'>NuBank</span>
                <span className='text-muted-foreground text-sm font-light'>Fintech · Nexus PE</span>
              </div>
              <Badge className='bg-green-600/10 px-3 py-1 font-normal text-green-600 dark:bg-green-400/10 dark:text-green-400'>
                Active
              </Badge>
              <MoreVerticalIcon />
            </CommandItem>
          </CommandGroup>
        </CommandList>

        <CommandSeparator />

        <div className='text-muted-foreground flex flex-wrap items-center gap-4 p-6'>
          <div className='flex flex-1 items-center gap-2'>
            <kbd className='rounded border px-1 text-sm'>esc</kbd>
            <span>To close</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex size-5 items-center justify-center rounded border'>
              <Undo2Icon className='size-4' />
            </div>
            <span>To Select</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex size-5 items-center justify-center rounded border'>
              <ArrowUpIcon className='size-4' />
            </div>
            <div className='flex size-5 items-center justify-center rounded border'>
              <ArrowDownIcon className='size-4' />
            </div>
            <span>To Navigate</span>
          </div>
        </div>
      </CommandDialog>
    </div>
  )
}

export default SearchDialog
