import RevenueDistributionCard, {
  type RevenueDistributionCardProps
} from '@/components/shadcn-studio/blocks/statistics-revenue-channel-distribution'

const data: RevenueDistributionCardProps = {
  title: 'Revenue breakdown',
  subtitle: 'Revenue channel distribution',
  valuePrefix: '$',
  streams: [
    { label: 'Product licenses', value: 112400, color: 'bg-[var(--chart-1)]' },
    { label: 'Subscriptions', value: 87300, color: 'bg-[var(--chart-2)]' },
    { label: 'Professional services', value: 54800, color: 'bg-[var(--chart-3)]' },
    { label: 'Support & add-ons', value: 31500, color: 'bg-[var(--chart-4)]' }
  ]
}

const StatisticsCardPreview = () => (
  <div className='py-8 sm:py-16 lg:py-24'>
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <RevenueDistributionCard {...data} />
    </div>
  </div>
)

export default StatisticsCardPreview
