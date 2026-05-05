import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ImageUpIcon, PlusIcon, Trash2Icon, AlertTriangleIcon,
  SproutIcon, CarIcon, LandmarkIcon, HardHatIcon, GraduationCapIcon,
  ZapIcon, ClapperboardIcon, UtensilsCrossedIcon, ScaleIcon, StethoscopeIcon,
  HotelIcon, ShieldCheckIcon, FactoryIcon, HeartIcon, BriefcaseIcon,
  ShoppingCartIcon, Code2Icon, RadioIcon, TruckIcon, MoreHorizontalIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog'
import { fetchBusinesses, updateBusiness, deleteBusiness } from '@/services/workspace'
import type { Business } from '@/types/workspace'

// ── Industry list ──────────────────────────────────────────────────────────

const INDUSTRIES = [
  { value: 'agriculture',       label: 'Agriculture & Farming',        icon: SproutIcon },
  { value: 'automotive',        label: 'Automotive',                   icon: CarIcon },
  { value: 'banking',           label: 'Banking & Financial Services', icon: LandmarkIcon },
  { value: 'construction',      label: 'Construction & Real Estate',   icon: HardHatIcon },
  { value: 'education',         label: 'Education & Training',         icon: GraduationCapIcon },
  { value: 'energy',            label: 'Energy & Utilities',           icon: ZapIcon },
  { value: 'entertainment',     label: 'Entertainment & Media',        icon: ClapperboardIcon },
  { value: 'food',              label: 'Food & Beverage',              icon: UtensilsCrossedIcon },
  { value: 'government',        label: 'Government & Public Sector',   icon: ScaleIcon },
  { value: 'healthcare',        label: 'Healthcare & Pharmaceuticals', icon: StethoscopeIcon },
  { value: 'hospitality',       label: 'Hospitality & Tourism',        icon: HotelIcon },
  { value: 'insurance',         label: 'Insurance',                    icon: ShieldCheckIcon },
  { value: 'manufacturing',     label: 'Manufacturing',                icon: FactoryIcon },
  { value: 'nonprofit',         label: 'Non-Profit & NGO',             icon: HeartIcon },
  { value: 'professional',      label: 'Professional Services',        icon: BriefcaseIcon },
  { value: 'retail',            label: 'Retail & E-commerce',          icon: ShoppingCartIcon },
  { value: 'technology',        label: 'Technology & Software',        icon: Code2Icon },
  { value: 'telecommunications', label: 'Telecommunications',          icon: RadioIcon },
  { value: 'transportation',    label: 'Transportation & Logistics',   icon: TruckIcon },
  { value: 'other',             label: 'Other',                        icon: MoreHorizontalIcon },
]

// ── helpers ────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return url.hostname.includes('.')
  } catch {
    return false
  }
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: Business
  onSuccess?: (business: Business) => void
  onDeleted?: () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function EditBusinessModal({ open, onOpenChange, business, onSuccess, onDeleted }: Props) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_URLS = 5

  const [name, setName]               = useState(business.name)
  const [industry, setIndustry]       = useState(business.businessType)
  const [websites, setWebsites]       = useState<string[]>(business.websites?.length ? business.websites : [''])
  const [description, setDescription] = useState(business.description ?? '')
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logoUrl ?? null)

  const [nameTouched, setNameTouched]         = useState(false)
  const [websitesTouched, setWebsitesTouched] = useState<boolean[]>([false])

  // Delete state
  const [deleteOpen, setDeleteOpen]         = useState(false)
  const [deleteConfirm, setDeleteConfirm]   = useState('')

  useEffect(() => {
    if (open) {
      setName(business.name)
      setIndustry(business.businessType)
      setWebsites(business.websites?.length ? business.websites : [''])
      setDescription(business.description ?? '')
      setLogoPreview(business.logoUrl ?? null)
      setNameTouched(false)
      setWebsitesTouched(Array(business.websites?.length || 1).fill(false))
    }
  }, [open, business])

  const { data: allBusinesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
    enabled: open,
  })

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setDeleteOpen(false)
    setDeleteConfirm('')
  }, [onOpenChange])

  const mutation = useMutation({
    mutationFn: updateBusiness,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      onSuccess?.(updated)
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBusiness(business.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      handleClose()
      onDeleted?.()
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Validations
  const trimmedName = name.trim()
  const nameTooShort = trimmedName.length > 0 && trimmedName.length < 3
  const nameInUse = allBusinesses.some(
    (b) => b.id !== business.id &&
           b.organizationId === business.organizationId &&
           b.name.toLowerCase() === trimmedName.toLowerCase()
  )
  const nameError = nameTouched
    ? nameTooShort
      ? 'Name must be at least 3 characters long.'
      : nameInUse
        ? 'This name is already in use. Please choose another one.'
        : null
    : null

  const websiteErrors = websites.map((url, i) => {
    if (!websitesTouched[i]) return null
    if (!url.trim()) return i === 0 ? 'Please enter at least one valid URL.' : null
    if (!isValidUrl(url.trim())) return 'Please enter a valid URL (e.g. https://example.com).'
    return null
  })

  const firstUrl = websites[0]?.trim() ?? ''
  const allUrlsValid = websites.every((url) => !url.trim() || isValidUrl(url.trim()))

  const canSubmit =
    trimmedName.length >= 3 &&
    !nameInUse &&
    !!industry &&
    !!firstUrl &&
    isValidUrl(firstUrl) &&
    allUrlsValid &&
    !mutation.isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    mutation.mutate({
      id: business.id,
      name: trimmedName,
      industry,
      websites: websites.map((u) => u.trim()).filter(Boolean),
      description: description.trim() || undefined,
      logoUrl: logoPreview ?? undefined,
    })
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[min(680px,88vh)] flex-col gap-0 p-0 sm:max-w-lg'>

        {/* Fixed header */}
        <div className='shrink-0 border-b border-(--border) px-6 py-4 space-y-0.5 text-left'>
          <DialogTitle className='text-base'>Business Settings</DialogTitle>
          <DialogDescription className='text-sm text-(--muted-foreground)'>
            Update the information for <span className='font-medium text-foreground'>{business.name}</span>.
          </DialogDescription>
        </div>

        {/* Scrollable body */}
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='px-6 py-4 space-y-5'>

            {/* Avatar + Name */}
            <div className='flex items-center gap-3'>
              <div className='relative shrink-0'>
                <Avatar className='size-16 rounded-lg cursor-pointer' onClick={() => fileInputRef.current?.click()}>
                  {logoPreview ? <AvatarImage src={logoPreview} className='object-cover' /> : null}
                  <AvatarFallback className='rounded-lg bg-muted text-xs font-semibold'>
                    {trimmedName ? getInitials(trimmedName) : <ImageUpIcon className='size-5 text-muted-foreground' />}
                  </AvatarFallback>
                </Avatar>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'
                >
                  <PlusIcon className='size-3' />
                </button>
                <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
              </div>
              <div className='flex-1 space-y-1.5'>
                <Label className='text-xs font-medium'>
                  Business Name <span className='text-(--destructive)'>*</span>
                </Label>
                <Input
                  placeholder='Enter business name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  className='h-9'
                />
                {nameError && <p className='text-xs text-(--destructive)'>{nameError}</p>}
              </div>
            </div>

            {/* Industry */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Industry <span className='text-(--destructive)'>*</span>
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className='h-9 text-sm'>
                  <SelectValue placeholder='Select an industry' />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                  {INDUSTRIES.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className='flex items-center gap-2'>
                        <Icon className='size-4 shrink-0 text-muted-foreground' />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Websites */}
            <div className='space-y-2'>
              <Label className='text-xs font-medium'>
                Website <span className='text-(--destructive)'>*</span>
              </Label>
              {websites.map((url, i) => (
                <div key={i} className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Input
                      placeholder='https://example.com'
                      value={url}
                      onChange={(e) => {
                        const next = [...websites]
                        next[i] = e.target.value
                        setWebsites(next)
                      }}
                      onBlur={() => {
                        const next = [...websitesTouched]
                        next[i] = true
                        setWebsitesTouched(next)
                      }}
                      className='h-9 flex-1'
                    />
                    {websites.length > 1 && (
                      <button
                        type='button'
                        onClick={() => {
                          setWebsites(websites.filter((_, idx) => idx !== i))
                          setWebsitesTouched(websitesTouched.filter((_, idx) => idx !== i))
                        }}
                        className='flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors'
                      >
                        <Trash2Icon className='size-4' />
                      </button>
                    )}
                  </div>
                  {websiteErrors[i] && (
                    <p className='text-xs text-(--destructive)'>{websiteErrors[i]}</p>
                  )}
                </div>
              ))}
              {websites.length < MAX_URLS && (
                <button
                  type='button'
                  onClick={() => {
                    setWebsites([...websites, ''])
                    setWebsitesTouched([...websitesTouched, false])
                  }}
                  className='flex items-center gap-1.5 text-xs text-primary hover:underline'
                >
                  <PlusIcon className='size-3.5' />
                  Add another URL
                </button>
              )}
            </div>

            {/* Description */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>
                Description <span className='text-(--muted-foreground) font-normal'>(Optional)</span>
              </Label>
              <Textarea
                placeholder='Brief description of this business…'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className='resize-none text-sm'
              />
            </div>

            {/* ── Delete section ── */}
            <div className='rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3 mt-2'>
              <div className='space-y-0.5'>
                <p className='text-sm font-medium text-destructive'>Delete business</p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Deleting <span className='font-medium text-foreground'>{business.name}</span> will permanently remove all associated data including files, components and images, and content shared with others. This action cannot be undone.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground'
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className='size-3.5' />
                Delete business
              </Button>
            </div>

          </div>
        </div>

        {/* Fixed footer */}
        {mutation.isError && (
          <p className='px-6 pt-2 text-xs text-(--destructive)'>
            {(mutation.error as Error)?.message ?? 'Something went wrong. Please try again.'}
          </p>
        )}
        <div className='shrink-0 flex items-center justify-between border-t border-(--border) px-6 py-4'>
          <DialogClose asChild>
            <Button variant='outline' size='sm' disabled={mutation.isPending}>Cancel</Button>
          </DialogClose>
          <Button size='sm' disabled={!canSubmit} onClick={handleSubmit}>
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>

    {/* ── Delete confirmation dialog ── */}
    <Dialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteConfirm('') }}>
      <DialogContent className='flex flex-col gap-0 p-0 sm:max-w-md'>
        <div className='shrink-0 border-b border-(--border) px-6 py-4 space-y-0.5 text-left'>
          <DialogTitle className='text-base'>Delete business</DialogTitle>
          <DialogDescription className='text-sm text-(--muted-foreground)'>
            This action is permanent and cannot be undone.
          </DialogDescription>
        </div>

        <div className='px-6 py-5 space-y-4'>
          <div className='flex gap-3 rounded-lg bg-destructive/8 border border-destructive/20 p-4'>
            <AlertTriangleIcon className='size-4 shrink-0 text-destructive mt-0.5' />
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Are you sure you want to delete <span className='font-semibold text-foreground'>{business.name}</span>? This will delete all associated data such as your files, components and images, including content you have shared with others. You cannot undo this operation.
              {' '}<a href='#' className='text-primary underline underline-offset-2'>Privacy Policy</a>.
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>
              To confirm, type <span className='font-semibold text-foreground'>"{business.name}"</span> below
            </Label>
            <Input
              placeholder={business.name}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className='h-9'
            />
          </div>

          {deleteMutation.isError && (
            <p className='text-xs text-(--destructive)'>
              {(deleteMutation.error as Error)?.message ?? 'Something went wrong. Please try again.'}
            </p>
          )}
        </div>

        <div className='shrink-0 flex items-center justify-between border-t border-(--border) px-6 py-4'>
          <Button variant='outline' size='sm' onClick={() => { setDeleteOpen(false); setDeleteConfirm('') }}>
            Cancel
          </Button>
          <Button
            size='sm'
            variant='destructive'
            disabled={deleteConfirm !== business.name || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete business'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
