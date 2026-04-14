import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdminPage() {
  return (
    <div className='bg-white rounded-lg p-4'>
      <PageHeader title='Dashboard' description='Welcome to admin dashboard' />

      <div className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>120</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>54</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>$8,200</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
