import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  UserPlusIcon, SendIcon, Trash2Icon, RefreshCwIcon, MailIcon, ClockIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog'
import {
  updateOrganization, fetchOrganizations,
  fetchInvitations, sendInvitation, resendInvitation, deleteInvitation,
} from '@/services/workspace'
import type { Organization, Invitation } from '@/types/workspace'

// ── helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100  text-green-700',
  expired:  'bg-red-100    text-red-700',
}

// ── props ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
  onSuccess?: (org: Organization) => void
}

// ── component ──────────────────────────────────────────────────────────────

export function EditOrganizationModal({ open, onOpenChange, organization, onSuccess }: Props) {
  const queryClient = useQueryClient()

  // ── Tab: General ──────────────────────────────────────────────────────
  const [name, setName]               = useState(organization.name)
  const [code, setCode]               = useState(organization.code ?? '')
  const [description, setDescription] = useState(organization.description ?? '')
  const [nameTouched, setNameTouched] = useState(false)
  const [codeTouched, setCodeTouched] = useState(false)

  // ── Tab: Invite ───────────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail]       = useState('')
  const [inviteClientName, setInviteClientName] = useState('')
  const [inviteEmailTouched, setInviteEmailTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setName(organization.name)
      setCode(organization.code ?? '')
      setDescription(organization.description ?? '')
      setNameTouched(false)
      setCodeTouched(false)
      setInviteEmail('')
      setInviteClientName('')
      setInviteEmailTouched(false)
    }
  }, [open, organization])

  // queries
  const { data: allOrganizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    enabled: open,
  })

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['invitations', organization.id],
    queryFn: () => fetchInvitations(organization.id),
    enabled: open,
  })

  const handleClose = () => onOpenChange(false)

  // mutations – general
  const updateMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      onSuccess?.(org)
      handleClose()
    },
  })

  // mutations – invitations
  const sendMutation = useMutation({
    mutationFn: sendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', organization.id] })
      setInviteEmail('')
      setInviteClientName('')
      setInviteEmailTouched(false)
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations', organization.id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations', organization.id] }),
  })

  // ── General validations ───────────────────────────────────────────────
  const trimmedName = name.trim()
  const trimmedCode = code.trim()

  const nameInUse = allOrganizations.some(
    (o) => o.id !== organization.id && o.name.toLowerCase() === trimmedName.toLowerCase()
  )
  const codeInUse = allOrganizations.some(
    (o) => o.id !== organization.id && (o.code ?? '').toLowerCase() === trimmedCode.toLowerCase()
  )

  const nameError = nameTouched
    ? !trimmedName ? 'Name is required.'
      : trimmedName.length < 3 ? 'Name must be at least 3 characters.'
      : nameInUse ? 'This name is already in use.'
      : null
    : null

  const codeError = codeTouched
    ? !trimmedCode ? 'Code is required.'
      : codeInUse ? 'This code is already in use.'
      : null
    : null

  const canSave =
    trimmedName.length >= 3 && !nameInUse &&
    trimmedCode.length > 0 && !codeInUse &&
    !updateMutation.isPending

  // ── Invite validations ────────────────────────────────────────────────
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const trimmedInviteEmail = inviteEmail.trim()
  const emailAlreadyInvited = invitations.some(
    (inv) => inv.email.toLowerCase() === trimmedInviteEmail.toLowerCase()
  )
  const emailError = inviteEmailTouched
    ? !isValidEmail(trimmedInviteEmail)
      ? 'Please enter a valid email address.'
      : emailAlreadyInvited
        ? 'This email has already been invited.'
        : null
    : null
  const canInvite = isValidEmail(trimmedInviteEmail) && !emailAlreadyInvited && !sendMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[min(640px,88vh)] flex-col gap-0 p-0 sm:max-w-lg'>

        {/* Fixed header */}
        <div className='shrink-0 border-b border-(--border) px-6 py-4 space-y-0.5 text-left'>
          <DialogTitle className='text-base'>Organization Settings</DialogTitle>
          <DialogDescription className='text-sm text-(--muted-foreground)'>
            Manage details and members for <span className='font-medium text-foreground'>{organization.name}</span>.
          </DialogDescription>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='general' className='flex flex-col flex-1 min-h-0'>
          <div className='shrink-0 px-6 pt-4'>
            <TabsList className='h-9 w-full'>
              <TabsTrigger value='general' className='flex-1 text-xs'>General</TabsTrigger>
              <TabsTrigger value='members' className='flex-1 text-xs gap-2'>
                Invite Members
                {invitations.length > 0 && (
                  <span
                    className='flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-black leading-none'
                    style={{ backgroundColor: '#E9F000' }}
                  >
                    {invitations.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab 1: General ── */}
          <TabsContent value='general' className='flex flex-col flex-1 min-h-0 mt-0'>
            <div className='flex-1 min-h-0 overflow-y-auto'>
              <div className='px-6 py-4 space-y-4'>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Name <span className='text-(--destructive)'>*</span>
                  </Label>
                  <Input
                    placeholder='e.g. Arcadia Capital Partners'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    className='h-9'
                  />
                  {nameError && <p className='text-xs text-(--destructive)'>{nameError}</p>}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Code <span className='text-(--destructive)'>*</span>
                  </Label>
                  <Input
                    placeholder='e.g. ACP-001'
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onBlur={() => setCodeTouched(true)}
                    className='h-9 font-mono text-xs tracking-widest'
                  />
                  {codeError && <p className='text-xs text-(--destructive)'>{codeError}</p>}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Description{' '}
                    <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
                  </Label>
                  <Textarea
                    placeholder='Brief description of this organization…'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className='resize-none text-sm'
                  />
                </div>

              </div>
            </div>

            {updateMutation.isError && (
              <p className='px-6 pt-1 text-xs text-(--destructive)'>
                {(updateMutation.error as Error)?.message ?? 'Something went wrong.'}
              </p>
            )}

            <div className='shrink-0 flex items-center justify-between border-t border-(--border) px-6 py-4'>
              <DialogClose asChild>
                <Button variant='outline' size='sm' disabled={updateMutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size='sm'
                disabled={!canSave}
                onClick={() => updateMutation.mutate({ id: organization.id, name: trimmedName, code: trimmedCode, description: description.trim() || undefined })}
              >
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab 2: Invite Members ── */}
          <TabsContent value='members' className='flex flex-col flex-1 min-h-0 mt-0'>
            <div className='flex-1 min-h-0 overflow-y-auto'>
              <div className='px-6 py-4 space-y-5'>

                {/* Invite form */}
                <div className='space-y-3'>
                  <p className='text-xs font-medium'>Send an invitation</p>
                  <div className='space-y-2'>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>Client Name <span className='text-(--muted-foreground) font-normal'>(Optional)</span></Label>
                      <Input
                        placeholder='e.g. John Smith'
                        value={inviteClientName}
                        onChange={(e) => setInviteClientName(e.target.value)}
                        className='h-9'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs'>
                        Email <span className='text-(--destructive)'>*</span>
                      </Label>
                      <div className='flex gap-2'>
                        <Input
                          type='email'
                          placeholder='example@company.com'
                          value={inviteEmail}
                          onChange={(e) => { setInviteEmail(e.target.value); setInviteEmailTouched(true) }}
                          onBlur={() => setInviteEmailTouched(true)}
                          className='h-9 flex-1'
                        />
                        <Button
                          size='sm'
                          className='h-9 gap-1.5 shrink-0'
                          disabled={!canInvite}
                          onClick={() => sendMutation.mutate({
                            organizationId: organization.id,
                            email: inviteEmail.trim(),
                            clientName: inviteClientName.trim() || undefined,
                          })}
                        >
                          <SendIcon className='size-3.5' />
                          {sendMutation.isPending ? 'Sending…' : 'Send'}
                        </Button>
                      </div>
                      {emailError && <p className='text-xs text-(--destructive)'>{emailError}</p>}
                      {sendMutation.isError && (
                        <p className='text-xs text-(--destructive)'>
                          {(sendMutation.error as Error)?.message ?? 'Failed to send invitation.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invitations list */}
                <div className='space-y-2'>
                  <p className='text-xs font-medium'>Invitations</p>

                  {invitationsLoading && (
                    <div className='py-6 text-center text-xs text-muted-foreground'>Loading…</div>
                  )}

                  {!invitationsLoading && invitations.length === 0 && (
                    <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center'>
                      <MailIcon className='size-5 text-muted-foreground' />
                      <p className='text-xs text-muted-foreground'>No invitations sent yet.</p>
                    </div>
                  )}

                  {!invitationsLoading && invitations.length > 0 && (
                    <ul className='divide-y divide-(--border) rounded-lg border border-(--border) overflow-hidden'>
                      {invitations.map((inv) => (
                        <li key={inv.id} className='flex items-start gap-3 px-4 py-3'>
                          <Avatar className='size-8 shrink-0 mt-0.5'>
                            <AvatarFallback className='text-xs bg-muted'>
                              {inv.clientName ? getInitials(inv.clientName) : <MailIcon className='size-3.5 text-muted-foreground' />}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0 space-y-0.5'>
                            {inv.clientName && (
                              <p className='text-sm font-medium truncate'>{inv.clientName}</p>
                            )}
                            <p className='text-xs text-muted-foreground truncate'>{inv.email}</p>
                            <div className='flex items-center gap-2 pt-0.5 flex-wrap'>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status] ?? 'bg-muted text-muted-foreground'}`}>
                                {inv.status}
                              </span>
                              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                                <ClockIcon className='size-3' />
                                Sent {formatDate(inv.sentAt)}
                              </span>
                              {inv.expiresAt && (
                                <span className='text-xs text-muted-foreground'>
                                  · Expires {formatDate(inv.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='flex shrink-0 items-center gap-1 mt-0.5'>
                            {inv.status === 'expired' && (
                              <button
                                type='button'
                                title='Resend invitation'
                                disabled={resendMutation.isPending}
                                onClick={() => resendMutation.mutate(inv.id)}
                                className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                              >
                                <RefreshCwIcon className='size-3.5' />
                              </button>
                            )}
                            <button
                              type='button'
                              title='Remove invitation'
                              disabled={deleteMutation.isPending}
                              onClick={() => deleteMutation.mutate(inv.id)}
                              className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors'
                            >
                              <Trash2Icon className='size-3.5' />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className='shrink-0 flex justify-end border-t border-(--border) px-6 py-4'>
              <DialogClose asChild>
                <Button variant='outline' size='sm'>Close</Button>
              </DialogClose>
            </div>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  )
}
