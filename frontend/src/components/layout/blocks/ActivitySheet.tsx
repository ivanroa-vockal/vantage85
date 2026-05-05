import type { ReactNode } from 'react'
import { ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
}

const ActivitySheet = ({ defaultOpen = false, trigger }: Props) => {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className='gap-0 sm:max-w-112 [&>button]:top-2.75 [&>button>svg]:size-5'>
        <SheetHeader className='border-b py-2.25'>
          <SheetTitle className='text-lg leading-6'>Activity</SheetTitle>
          <SheetDescription hidden />
        </SheetHeader>

        <div className='overflow-y-auto'>
          <div className='flex gap-4 px-4 py-3'>
            <Avatar>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className='flex w-full flex-col items-start gap-2.5'>
              <div className='text-muted-foreground flex flex-col items-start text-sm'>
                <p>
                  <span className='text-foreground font-semibold'>Joe Lincoln</span> mentioned you in last trends topic
                </p>
                <p>18 mins ago</p>
              </div>
              <div className='bg-muted flex flex-col gap-4 rounded-md border px-4 py-2.5'>
                <p className='text-sm font-medium'>
                  @Vantage85 For an expert opinion, check out what Mike has to say on this topic!
                </p>
                <div className='relative'>
                  <Input placeholder='Reply' className='peer bg-card pr-9' />
                  <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
                    <ImageIcon className='size-4' />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex gap-4 px-4 py-3'>
            <Avatar>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png' />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div className='flex w-full flex-col items-start gap-2.5'>
              <div className='text-muted-foreground flex flex-col items-start text-sm'>
                <p>
                  <span className='text-foreground font-semibold'>Jane Perez</span> invites you to review a file
                </p>
                <p>39 mins ago</p>
              </div>
              <div className='bg-muted flex items-center gap-1 rounded-md px-1.5 py-1'>
                <span className='text-sm font-medium'>invoices.pdf</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex gap-4 px-4 py-3'>
            <Avatar>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png' />
              <AvatarFallback>TH</AvatarFallback>
            </Avatar>
            <div className='flex w-full flex-col items-start gap-2.5'>
              <div className='text-muted-foreground flex flex-col items-start text-sm'>
                <p>
                  <span className='text-foreground font-semibold'>Tyler Hero</span> wants to view your organization data
                </p>
                <p>1 hour ago</p>
              </div>
              <div className='bg-muted flex w-full items-center gap-4 rounded-md border px-4 py-2.5'>
                <span className='text-sm font-medium'>Arcadia Capital Partners.xlsx</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex gap-4 px-4 py-3'>
            <Avatar>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png' />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <div className='text-muted-foreground flex flex-col items-start text-sm'>
              <p>
                <span className='text-foreground font-semibold'>Daniel</span> invites you to review the new design
              </p>
              <p>3 hours ago</p>
            </div>
          </div>

          <Separator />

          <div className='flex gap-4 px-4 py-3'>
            <Avatar>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png' />
              <AvatarFallback>LA</AvatarFallback>
            </Avatar>
            <div className='flex w-full flex-col items-start gap-2.5'>
              <div className='text-muted-foreground flex flex-col items-start text-sm'>
                <p>
                  <span className='text-foreground font-semibold'>Leslie Alexander</span> added new tags to Nexus PE
                </p>
                <p>8 hours ago</p>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge className='bg-primary/10 text-primary rounded-sm font-normal'>Private Equity</Badge>
                <Badge className='rounded-sm bg-sky-600/10 font-normal text-sky-600 dark:bg-sky-400/10 dark:text-sky-400'>
                  Fund
                </Badge>
                <Badge className='rounded-sm bg-amber-600/10 font-normal text-amber-600 dark:bg-amber-400/10 dark:text-amber-400'>
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex gap-4 px-4 py-3'>
            <Avatar>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png' />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div className='text-muted-foreground flex flex-col items-start text-sm'>
              <p>
                <span className='text-foreground font-semibold'>Miya</span> invited you to review a report
              </p>
              <p>10 hours ago</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ActivitySheet
