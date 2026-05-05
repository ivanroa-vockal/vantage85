import {
  AtomIcon, BookMarkedIcon, BrainCircuitIcon, CameraIcon, ChartPieIcon,
  CloudCogIcon, CodeXmlIcon, DatabaseIcon, DollarSignIcon, MegaphoneIcon,
  LayersIcon, FileCogIcon, FileJsonIcon, Gamepad2Icon,
  LayoutPanelTopIcon, LinkIcon, LockKeyholeIcon, NetworkIcon, NotebookPenIcon,
  PenToolIcon, ServerIcon, ShoppingCartIcon, SmartphoneIcon, UsersIcon,
  VideoIcon, WalletIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

import StatisticsTotalProfitCard from '@/components/shadcn-studio/blocks/statistics-total-profit-card'
import StatisticsTotalRevenueCard from '@/components/shadcn-studio/blocks/statistics-total-revenue-card'
import StatisticsImpressionCard from '@/components/shadcn-studio/blocks/statistics-impression-card'
import StatisticsCard, { type StatisticsCardProps } from '@/components/shadcn-studio/blocks/statistics-card-03'
import ServicesBySalesCard from '@/components/shadcn-studio/blocks/chart-services-by-sales'
import ConversionRateCard from '@/components/shadcn-studio/blocks/chart-conversion-rate'
import PerformanceCard from '@/components/shadcn-studio/blocks/chart-performance'
import EarningReportCard from '@/components/shadcn-studio/blocks/chart-earning-report'
import PaymentHistoryCard from '@/components/shadcn-studio/blocks/widget-payment-history'
import CourseDatatable, { type Item } from '@/components/shadcn-studio/blocks/datatable-course'

const statisticsCardData: StatisticsCardProps[] = [
  {
    icon: <ShoppingCartIcon />,
    title: 'Total Orders',
    value: '155K',
    trend: 'up',
    changePercentage: '+22%',
    badgeContent: 'Last 4 months',
    iconClassName: 'bg-chart-2/10 text-chart-2',
  },
  {
    icon: <DollarSignIcon />,
    title: 'Total Profit',
    value: '$89.34k',
    trend: 'down',
    changePercentage: '-16%',
    badgeContent: 'Last One year',
    iconClassName: 'bg-chart-1/10 text-chart-1',
  },
  {
    icon: <BookMarkedIcon />,
    title: 'Bookmarks',
    value: '$1,200',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-3/10 text-chart-3',
  },
]

const conversionRateChartData = [
  { month: 'January', conversion: 240 },
  { month: 'February', conversion: 270 },
  { month: 'March', conversion: 380 },
  { month: 'April', conversion: 230 },
  { month: 'May', conversion: 450 },
  { month: 'June', conversion: 570 },
  { month: 'July', conversion: 310 },
]

const conversionData = [
  { title: 'Impressions', stat: '12.2K Visits', trend: 'up', percentageChange: 20.3 },
  { title: 'Added to cart', stat: '32 product in cart', trend: 'up', percentageChange: 6.3 },
  { title: 'Checkout', stat: '15 Product checkout', trend: 'down', percentageChange: 9.56 },
  { title: 'Purchased', stat: '12 orders', trend: 'up', percentageChange: 2.62 },
]

const statData = [
  { icon: <ChartPieIcon />, title: 'Net profit', department: 'Sales', value: '$1,623', trend: 'up', percentage: 20.3, iconClassName: 'bg-chart-1/10 text-chart-1' },
  { icon: <DollarSignIcon />, title: 'Total income', department: 'Sales, Affiliation', value: '$5,600', trend: 'up', percentage: 16.2, iconClassName: 'bg-chart-2/10 text-chart-2' },
  { icon: <WalletIcon />, title: 'Total expense', department: 'ADVT, Marketing', value: '$3,200', trend: 'up', percentage: 10.5, iconClassName: 'bg-chart-3/10 text-chart-3' },
]

const earningReportChartData = [
  { day: 'Monday', earning: 48, fill: 'color-mix(in oklab, var(--chart-3) 20%, transparent)' },
  { day: 'Tuesday', earning: 147, fill: 'color-mix(in oklab, var(--chart-3) 20%, transparent)' },
  { day: 'Wednesday', earning: 106, fill: 'color-mix(in oklab, var(--chart-3) 20%, transparent)' },
  { day: 'Thursday', earning: 180, fill: 'var(--chart-3)' },
  { day: 'Friday', earning: 75, fill: 'color-mix(in oklab, var(--chart-3) 20%, transparent)' },
  { day: 'Saturday', earning: 60, fill: 'color-mix(in oklab, var(--chart-3) 20%, transparent)' },
  { day: 'Sunday', earning: 128, fill: 'color-mix(in oklab, var(--chart-3) 20%, transparent)' },
]

const paymentData = [
  { img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/master-card.png', imgWidth: 'w-8', cardNumber: '5688', cardType: 'Credit Card', date: '05/Jan', spend: '2,820', remaining: '10,020' },
  { img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/visa.png', imgWidth: 'w-8', cardNumber: '8562', cardType: 'Debit Card', date: '15/Feb', spend: '1,450', remaining: '8,570' },
  { img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/american-express.png', imgWidth: 'w-10.5', cardNumber: '5238', cardType: 'ATM card', date: '20/Mar', spend: '500', remaining: '7,070' },
  { img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/visa.png', imgWidth: 'w-8', cardNumber: '8562', cardType: 'Debit card', date: '10/Mar', spend: '750', remaining: '5,120' },
  { img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/master-card.png', imgWidth: 'w-8', cardNumber: '*5688', cardType: 'Credit Card', date: '25/May', spend: '1,200', remaining: '5,870' },
  { img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/visa.png', imgWidth: 'w-8', cardNumber: '8562', cardType: 'Credit card', date: '10/Mar', spend: '950', remaining: '4920' },
]

const courseData: Item[] = [
  { id: '1', course: 'UI/UX design', courseIcon: <LayersIcon />, courseIconColor: 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400', tutor: 'John cartal', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png', tutorFallback: 'JC', time: '19h 17m', stats: { users: 14, textMaterial: 23, videos: 26 }, totalModules: 100, completedModules: 50 },
  { id: '2', course: 'Web development', courseIcon: <CodeXmlIcon />, courseIconColor: 'bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', tutor: 'Sara Mitchell', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png', tutorFallback: 'SM', time: '20h 5m', stats: { users: 15, textMaterial: 24, videos: 27 }, totalModules: 50, completedModules: 11 },
  { id: '3', course: 'Product management', courseIcon: <LayoutPanelTopIcon />, courseIconColor: 'bg-destructive/10 text-destructive', tutor: 'Alex Johnson', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png', tutorFallback: 'AJ', time: '21h 38m', stats: { users: 16, textMaterial: 25, videos: 28 }, totalModules: 10, completedModules: 1 },
  { id: '4', course: 'Graphic design', courseIcon: <PenToolIcon />, courseIconColor: 'bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400', tutor: 'Emily Chen', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png', tutorFallback: 'EC', time: '22h 12m', stats: { users: 17, textMaterial: 26, videos: 29 }, totalModules: 50, completedModules: 26 },
  { id: '5', course: 'Data analysis', courseIcon: <BrainCircuitIcon />, tutor: 'Mark Robinson', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png', tutorFallback: 'MR', time: '23h 45m', stats: { users: 18, textMaterial: 27, videos: 30 }, totalModules: 100, completedModules: 76 },
  { id: '6', course: 'Science of critical thinking', courseIcon: <AtomIcon />, courseIconColor: 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400', tutor: 'Sophia Lee', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png', tutorFallback: 'SL', time: '24h 30m', stats: { users: 19, textMaterial: 28, videos: 31 }, totalModules: 50, completedModules: 16 },
  { id: '7', course: 'Frontend Development', courseIcon: <CodeXmlIcon />, courseIconColor: 'bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', tutor: 'David Kim', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png', tutorFallback: 'DK', time: '18h 22m', stats: { users: 22, textMaterial: 30, videos: 25 }, totalModules: 30, completedModules: 12 },
  { id: '8', course: 'Mobile App Design', courseIcon: <SmartphoneIcon />, courseIconColor: 'bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400', tutor: 'Jessica Wong', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png', tutorFallback: 'JW', time: '16h 45m', stats: { users: 20, textMaterial: 18, videos: 22 }, totalModules: 75, completedModules: 30 },
  { id: '9', course: 'Digital Marketing', courseIcon: <UsersIcon />, courseIconColor: 'bg-destructive/10 text-destructive', tutor: 'Michael Brown', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png', tutorFallback: 'MB', time: '25h 15m', stats: { users: 35, textMaterial: 40, videos: 45 }, totalModules: 100, completedModules: 40 },
  { id: '10', course: 'Machine Learning', courseIcon: <BrainCircuitIcon />, tutor: 'Dr. Sarah Williams', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-10.png', tutorFallback: 'SW', time: '35h 20m', stats: { users: 12, textMaterial: 55, videos: 40 }, totalModules: 15, completedModules: 4 },
  { id: '11', course: 'Photography Basics', courseIcon: <CameraIcon />, courseIconColor: 'bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400', tutor: 'Anna Davis', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-11.png', tutorFallback: 'AD', time: '12h 30m', stats: { users: 28, textMaterial: 15, videos: 35 }, totalModules: 50, completedModules: 28 },
  { id: '12', course: 'Backend Development', courseIcon: <CodeXmlIcon />, courseIconColor: 'bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', tutor: 'Robert Taylor', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-12.png', tutorFallback: 'RT', time: '28h 40m', stats: { users: 18, textMaterial: 45, videos: 30 }, totalModules: 75, completedModules: 30 },
  { id: '13', course: 'Cloud Computing', courseIcon: <CloudCogIcon />, courseIconColor: 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400', tutor: 'Lisa Anderson', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-13.png', tutorFallback: 'LA', time: '32h 15m', stats: { users: 15, textMaterial: 50, videos: 25 }, totalModules: 20, completedModules: 8 },
  { id: '14', course: 'Cybersecurity Fundamentals', courseIcon: <LockKeyholeIcon />, tutor: 'James Wilson', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-14.png', tutorFallback: 'JW', time: '40h 0m', stats: { users: 10, textMaterial: 60, videos: 20 }, totalModules: 100, completedModules: 35 },
  { id: '15', course: 'DevOps Practices', courseIcon: <ServerIcon />, courseIconColor: 'bg-destructive/10 text-destructive', tutor: 'Maria Garcia', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-15.png', tutorFallback: 'MG', time: '30h 25m', stats: { users: 13, textMaterial: 35, videos: 28 }, totalModules: 50, completedModules: 45 },
  { id: '16', course: 'Database Design', courseIcon: <DatabaseIcon />, courseIconColor: 'bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', tutor: 'Kevin Martinez', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png', tutorFallback: 'KM', time: '26h 50m', stats: { users: 16, textMaterial: 42, videos: 18 }, totalModules: 75, completedModules: 55 },
  { id: '17', course: 'API Development', courseIcon: <FileJsonIcon />, courseIconColor: 'bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400', tutor: 'Rachel Thompson', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-17.png', tutorFallback: 'RT', time: '22h 35m', stats: { users: 19, textMaterial: 30, videos: 24 }, totalModules: 50, completedModules: 32 },
  { id: '18', course: 'Software Testing', courseIcon: <FileCogIcon />, courseIconColor: 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400', tutor: 'Daniel Lee', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-18.png', tutorFallback: 'DL', time: '20h 10m', stats: { users: 21, textMaterial: 25, videos: 30 }, totalModules: 30, completedModules: 19 },
  { id: '19', course: 'Agile Methodology', courseIcon: <NetworkIcon />, courseIconColor: 'bg-destructive/10 text-destructive', tutor: 'Jennifer White', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-19.png', tutorFallback: 'JW', time: '15h 45m', stats: { users: 25, textMaterial: 20, videos: 15 }, totalModules: 40, completedModules: 28 },
  { id: '20', course: 'Blockchain Technology', courseIcon: <LinkIcon />, tutor: 'Christopher Moore', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-20.png', tutorFallback: 'CM', time: '38h 20m', stats: { users: 8, textMaterial: 65, videos: 12 }, totalModules: 100, completedModules: 50 },
  { id: '21', course: 'Game Development', courseIcon: <Gamepad2Icon />, courseIconColor: 'bg-destructive/10 text-destructive', tutor: 'Amanda Johnson', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-21.png', tutorFallback: 'AJ', time: '45h 30m', stats: { users: 30, textMaterial: 40, videos: 55 }, totalModules: 75, completedModules: 35 },
  { id: '22', course: 'AI Ethics', courseIcon: <BrainCircuitIcon />, tutor: 'Dr. Brian Clark', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-22.png', tutorFallback: 'BC', time: '18h 15m', stats: { users: 14, textMaterial: 28, videos: 20 }, totalModules: 40, completedModules: 30 },
  { id: '23', course: 'Video Editing', courseIcon: <VideoIcon />, courseIconColor: 'bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', tutor: 'Nicole Rodriguez', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-23.png', tutorFallback: 'NR', time: '24h 45m', stats: { users: 32, textMaterial: 15, videos: 45 }, totalModules: 10, completedModules: 2 },
  { id: '24', course: 'Content Writing', courseIcon: <NotebookPenIcon />, courseIconColor: 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400', tutor: 'Steven Harris', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-24.png', tutorFallback: 'SH', time: '16h 20m', stats: { users: 40, textMaterial: 35, videos: 10 }, totalModules: 40, completedModules: 34 },
  { id: '25', course: 'Social Media Strategy', courseIcon: <MegaphoneIcon />, courseIconColor: 'bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400', tutor: 'Michelle Turner', tutorImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-25.png', tutorFallback: 'MT', time: '14h 55m', stats: { users: 45, textMaterial: 22, videos: 18 }, totalModules: 40, completedModules: 28 },
]

export default function Dashboard() {
  return (
    <div className='grid grid-cols-6 gap-6'>
      <StatisticsTotalProfitCard className='max-2xl:col-span-2 max-lg:col-span-3 max-sm:col-span-full' />
      <StatisticsTotalRevenueCard className='max-2xl:col-span-2 max-lg:col-span-3 max-sm:col-span-full' />
      <StatisticsImpressionCard className='max-2xl:col-span-2 max-lg:col-span-3 max-sm:col-span-full' />

      {statisticsCardData.map((card, index) => (
        <StatisticsCard
          key={index}
          {...card}
          className='max-2xl:col-span-2 max-lg:col-span-3 max-sm:col-span-full'
        />
      ))}

      <ServicesBySalesCard className='col-span-full 2xl:col-span-4' />

      <ConversionRateCard
        title='Conversion rate'
        subTitle='Compared to last month'
        totalConversion={92.8}
        conversionTrend='up'
        percentageChange={6.3}
        conversionData={conversionData}
        chartData={conversionRateChartData}
        className='col-span-full lg:col-span-3 2xl:col-span-2'
      />

      <PerformanceCard className='col-span-full lg:col-span-3 2xl:col-span-2' />

      <EarningReportCard
        title='Earning Report'
        subTitle='Weekly Earning overview'
        statData={statData}
        chartData={earningReportChartData}
        className='col-span-full lg:col-span-3 2xl:col-span-2'
      />

      <PaymentHistoryCard
        title='Payment History'
        paymentData={paymentData}
        className='col-span-full lg:col-span-3 2xl:col-span-2'
      />

      <Card className='col-span-full py-0'>
        <CourseDatatable data={courseData} />
      </Card>
    </div>
  )
}
