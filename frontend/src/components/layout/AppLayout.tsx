import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <SidebarProvider className='bg-muted min-w-0'>
      <AppSidebar />
      <SidebarInset className='min-h-dvh min-w-0 flex-1 border border-border bg-white mt-3 mr-3 p-[12px] rounded-[16px]'>
        <Header />
        <div className='min-w-0 flex-1 overflow-x-auto px-2 py-6 sm:px-3'>
          <Outlet />
        </div>
        <footer className='flex shrink-0 items-center justify-between gap-3 px-4 py-3 max-lg:flex-col sm:px-6 lg:gap-6'>
          <p className='text-muted-foreground text-sm text-balance max-lg:text-center'>
            {`©${new Date().getFullYear()}`}{' '}
            <a href='#' className='text-primary'>Vantage 85</a>
            {' · Digital Value Creation Plan'}
          </p>
          <div className='text-muted-foreground *:hover:text-primary flex items-center gap-3 text-sm whitespace-nowrap max-[450px]:flex-col min-[450px]:gap-4'>
            <a href='#'>License</a>
            <a href='#'>More Themes</a>
            <a href='#'>Documentation</a>
            <a href='#'>Support</a>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
