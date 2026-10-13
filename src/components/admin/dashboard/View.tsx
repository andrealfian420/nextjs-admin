import PageHeader from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

// Placeholder metrics: no dashboard endpoint exists in the core backend. Replace them with
// your own service call (and drop the "Sample data" badge) when you add one.
const SAMPLE_METRICS = [
  { title: 'Total Users', value: '120', className: 'bg-sky-600' },
  { title: 'Orders', value: '54', className: 'bg-green-600' },
  { title: 'Revenue', value: '$8,200', className: 'bg-yellow-500' },
];

export default function ViewDashboard() {
  return (
    <div className='bg-white dark:bg-zinc-800 rounded-lg p-4'>
      <PageHeader
        title='Dashboard'
        description='Welcome to admin dashboard'
        actions={<Badge variant='secondary'>Sample data</Badge>}
      />

      <div className='grid gap-6 md:grid-cols-3'>
        {SAMPLE_METRICS.map((metric) => (
          <Card key={metric.title} className={`${metric.className} text-white`}>
            <CardHeader>
              <CardTitle>{metric.title}</CardTitle>
              <CardDescription className='mt-2 text-2xl font-bold text-white'>
                {metric.value}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
