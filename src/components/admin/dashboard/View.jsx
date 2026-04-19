import PageHeader from '@/components/ui/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function ViewDashboard() {
  return (
    <div className='bg-white dark:bg-slate-800 rounded-lg p-4'>
      <PageHeader title='Dashboard' description='Welcome to admin dashboard' />

      <div className='grid gap-6 md:grid-cols-3'>
        <Card className='bg-sky-600 text-white'>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription className='mt-2'>
              <p className='text-2xl font-bold text-white'>120</p>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='bg-green-600 text-white'>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription className='mt-2'>
              <p className='text-2xl font-bold text-white'>54</p>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='bg-yellow-400 text-white'>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription className='mt-2'>
              <p className='text-2xl font-bold text-white'>$8,200</p>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
