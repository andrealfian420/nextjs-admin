'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { logService } from '@/services/logService';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const ACTION_VARIANTS = {
  CREATE:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function ActionBadge({ action }) {
  const cls =
    ACTION_VARIANTS[action] ??
    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {action}
    </span>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className='grid grid-cols-3 gap-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0'>
      <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
        {label}
      </dt>
      <dd className='col-span-2 text-sm text-slate-800 dark:text-slate-100'>
        {children}
      </dd>
    </div>
  );
}

function DataComparisonTable({ oldData, newData }) {
  const keys = Array.from(
    new Set([...Object.keys(oldData ?? {}), ...Object.keys(newData ?? {})]),
  );

  if (keys.length === 0) {
    return (
      <p className='text-sm text-slate-400 dark:text-slate-500 italic'>
        No data available.
      </p>
    );
  }

  const formatValue = (val) => {
    if (val === null || val === undefined) {
      return (
        <span className='italic text-slate-400 dark:text-slate-500'>null</span>
      );
    }

    if (Array.isArray(val)) {
      return (
        <ul className='list-disc list-inside text-sm'>
          {val.map((item, idx) => (
            <li key={idx}>{String(item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof val === 'object') {
      return <code className='text-xs'>{JSON.stringify(val)}</code>;
    }

    return String(val);
  };

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-slate-200 dark:border-slate-700'>
            <th className='text-left py-2.5 px-3 font-medium text-slate-500 dark:text-slate-400 w-1/4'>
              Field
            </th>
            <th className='text-left py-2.5 px-3 font-medium text-slate-500 dark:text-slate-400 w-[37.5%]'>
              Old Value
            </th>
            <th className='text-left py-2.5 px-3 font-medium text-slate-500 dark:text-slate-400 w-[37.5%]'>
              New Value
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const oldVal = oldData?.[key] ?? null;
            const newVal = newData?.[key] ?? null;
            const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
            return (
              <tr
                key={key}
                className={`border-b border-slate-100 dark:border-slate-700 last:border-0 ${
                  changed ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                }`}
              >
                <td className='py-2.5 px-3 font-mono text-xs text-slate-600 dark:text-slate-300'>
                  {key}
                </td>
                <td className='py-2.5 px-3 text-slate-700 dark:text-slate-300 break-all'>
                  {formatValue(oldVal)}
                </td>
                <td
                  className={`py-2.5 px-3 break-all ${changed ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {formatValue(newVal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function DetailActivityLog() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    logService
      .getActivityLog(id)
      .then((res) => {
        setLog(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className='flex flex-col gap-4'>
        <div className='bg-white dark:bg-slate-800 rounded-lg p-5'>
          <Skeleton className='h-4 w-32 mb-5' />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='flex gap-4 py-3 border-b border-slate-100 dark:border-slate-700'
            >
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-4 w-48' />
            </div>
          ))}
        </div>
        <div className='bg-white dark:bg-slate-800 rounded-lg p-5'>
          <Skeleton className='h-4 w-40 mb-5' />
          <Skeleton className='h-32 w-full' />
        </div>
      </div>
    );
  }

  if (!log) {
    return router.push('/admin/activity-logs'); // push back to list if log not found
  }

  const hasChanges = log.oldData || log.newData;

  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-white dark:bg-slate-800 rounded-lg p-5'>
        <h2 className='text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>
          Log Information
        </h2>
        <dl>
          <InfoRow label='Action'>
            <ActionBadge action={log.action} />
          </InfoRow>
          <InfoRow label='Subject Type'>{log.subjectType}</InfoRow>
          <InfoRow label='Description'>{log.description}</InfoRow>
          <InfoRow label='Caused By'>{log.user?.name ?? '—'}</InfoRow>
          <InfoRow label='Caused At'>{log.causedAt}</InfoRow>
        </dl>
      </div>

      {hasChanges && (
        <div className='bg-white dark:bg-slate-800 rounded-lg p-5'>
          <h2 className='text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3'>
            Data Changes
          </h2>
          <DataComparisonTable oldData={log.oldData} newData={log.newData} />

          <div className='flex items-center justify-end mb-4 mt-6'>
            <Button
              onClick={() => router.push('/admin/activity-logs')}
              variant='outline'
              size='sm'
              className='ml-2 cursor-pointer'
            >
              Back to Logs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
