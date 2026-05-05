import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createOrganization } from '@/services/workspace'

import type { Organization } from '@/types/workspace'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (org: Organization) => void
}

export function CreateOrganizationModal({ open, onOpenChange, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const [orgName, setOrgName] = useState('')
  const [orgCode, setOrgCode] = useState('')
  const [orgDescription, setOrgDescription] = useState('')

  const handleClose = () => {
    onOpenChange(false)
    setOrgName('')
    setOrgCode('')
    setOrgDescription('')
  }

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      onSuccess?.(org)
      handleClose()
    },
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[min(600px,80vh)] flex-col gap-0 p-0 sm:max-w-md'>
        <DialogHeader className='contents space-y-0 text-left'>
          <div className='border-b border-(--border) px-6 py-4 space-y-0.5'>
            <DialogTitle className='text-base'>Create New Organization</DialogTitle>
            <DialogDescription className='text-sm text-(--muted-foreground)'>
              Set up a new organization to manage multiple business properties.
            </DialogDescription>
          </div>
          <ScrollArea className='flex max-h-full flex-col overflow-hidden'>
            <div className='px-6 py-4 pb-4 space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-(--foreground)'>
                  Name <span className='text-(--destructive)'>*</span>
                </label>
                <Input
                  placeholder='e.g. Arcadia Capital Partners'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-(--foreground)'>
                  Code <span className='text-(--destructive)'>*</span>
                </label>
                <Input
                  placeholder='e.g. ACP-001'
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                  className='h-9 font-mono text-xs tracking-widest'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-(--foreground)'>Description</label>
                <Textarea
                  placeholder='Brief description of this organization…'
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  rows={3}
                  className='resize-none text-sm'
                />
              </div>
            </div>

            <DialogFooter className='flex-row items-center justify-between px-6 pb-6 sm:justify-between'>
              <DialogClose asChild>
                <Button variant='outline' size='sm' onClick={handleClose} disabled={createMutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size='sm'
                disabled={!orgName.trim() || !orgCode.trim() || createMutation.isPending}
                onClick={() =>
                  createMutation.mutate({
                    name: orgName,
                    code: orgCode,
                    description: orgDescription || undefined,
                  })
                }
              >
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>

            {createMutation.isError && (
              <p className='px-6 pb-4 text-xs text-(--destructive)'>
                {(createMutation.error as Error)?.message ?? 'Something went wrong. Please try again.'}
              </p>
            )}
          </ScrollArea>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
