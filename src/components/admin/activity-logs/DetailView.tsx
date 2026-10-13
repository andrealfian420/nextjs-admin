'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { logService } from '@/services/logService';
import { isNotFoundError } from '@/lib/api-errors';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { LoadFailed } from '@/components/ui/LoadFailed';
import type { ActivityLog } from '@/types';

const ACTION_VARIANTS = {
  CREATE:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function ActionBadge({ action }: { action: string }) {
  const cls =
    ACTION_VARIANTS[action as keyof typeof ACTION_VARIANTS] ??
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {action}
    </span>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='grid grid-cols-3 gap-4 py-3 border-b border-zinc-100 dark:border-zinc-700 last:border-0'>
      <dt className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
        {label}
      </dt>
      <dd className='col-span-2 text-sm text-zinc-800 dark:text-zinc-100'>
        {children}
      </dd>
    </div>
  );
}

// Snapshots are JSON: an object for real changes, `[]` (the column default) when absent.
function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

// Primitives as text, a list of primitives as a list, anything nested as indented JSON.
function FieldValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className='italic text-zinc-400 dark:text-zinc-500'>null</span>;
  }

  const isPrimitive = (v: unknown) => v === null || typeof v !== 'object';

  if (Array.isArray(value) && value.every(isPrimitive)) {
    if (value.length === 0) {
      return <span className='italic text-zinc-400 dark:text-zinc-500'>empty</span>;
    }
    return (
      <ul className='list-disc list-inside text-sm'>
        {value.map((item, idx) => (
          <li key={idx}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <pre className='text-xs whitespace-pre-wrap break-all font-mono'>
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <>{String(value)}</>;
}

function DataComparisonTable({
  oldData,
  newData,
}: {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}) {
  const keys = Array.from(
    new Set([...Object.keys(oldData ?? {}), ...Object.keys(newData ?? {})]),
  );

  if (keys.length === 0) {
    return (
      <p className='text-sm text-zinc-400 dark:text-zinc-500 italic'>
        No data available.
      </p>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-zinc-200 dark:border-zinc-700'>
            <th className='text-left py-2.5 px-3 font-medium text-zinc-500 dark:text-zinc-400 w-1/4'>
              Field
            </th>
            <th className='text-left py-2.5 px-3 font-medium text-zinc-500 dark:text-zinc-400 w-[37.5%]'>
              Old Value
            </th>
            <th className='text-left py-2.5 px-3 font-medium text-zinc-500 dark:text-zinc-400 w-[37.5%]'>
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
                className={`border-b border-zinc-100 dark:border-zinc-700 last:border-0 ${
                  changed ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                }`}
              >
                <td className='py-2.5 px-3 font-mono text-xs text-zinc-600 dark:text-zinc-300'>
                  {key}
                </td>
                <td className='py-2.5 px-3 text-zinc-700 dark:text-zinc-300 break-all'>
                  <FieldValue value={oldVal} />
                </td>
                <td
                  className={`py-2.5 px-3 break-all ${changed ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}
                >
                  <FieldValue value={newVal} />
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
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [log, setLog] = useState<ActivityLog | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'failed'>(
    'loading',
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    logService
      .getActivityLog(id)
      .then((res) => {
        if (!active) return;
        setLog(res.data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (active) setStatus(isNotFoundError(err) ? 'missing' : 'failed');
      });

    return () => {
      active = false;
    };
  }, [id, attempt]);

  if (status === 'missing') notFound();

  if (status === 'failed') {
    return (
      <LoadFailed
        message='Failed to load the log entry.'
        onRetry={() => {
          setStatus('loading');
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (status === 'loading' || !log) {
    return (
      <div className='flex flex-col gap-4'>
        <div className='bg-white dark:bg-zinc-800 rounded-lg p-5'>
          <Skeleton className='h-4 w-32 mb-5' />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='flex gap-4 py-3 border-b border-zinc-100 dark:border-zinc-700'
            >
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-4 w-48' />
            </div>
          ))}
        </div>
        <div className='bg-white dark:bg-zinc-800 rounded-lg p-5'>
          <Skeleton className='h-4 w-40 mb-5' />
          <Skeleton className='h-32 w-full' />
        </div>
      </div>
    );
  }

  const oldData = asRecord(log.oldData);
  const newData = asRecord(log.newData);

  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-white dark:bg-zinc-800 rounded-lg p-5'>
        <h2 className='text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1'>
          Log Information
        </h2>
        <dl>
          <InfoRow label='Action'>
            <ActionBadge action={log.action ?? '—'} />
          </InfoRow>
          <InfoRow label='Subject Type'>{log.subjectType ?? '—'}</InfoRow>
          <InfoRow label='Description'>{log.description ?? '—'}</InfoRow>
          <InfoRow label='Caused By'>{log.user?.name ?? '—'}</InfoRow>
          <InfoRow label='Caused At'>{log.causedAt}</InfoRow>
        </dl>
      </div>

      {(oldData || newData) && (
        <div className='bg-white dark:bg-zinc-800 rounded-lg p-5'>
          <h2 className='text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3'>
            Data Changes
          </h2>
          <DataComparisonTable oldData={oldData} newData={newData} />
        </div>
      )}

      <div className='flex justify-end'>
        <Button
          onClick={() => router.push('/admin/activity-logs')}
          variant='outline'
          size='sm'
          className='cursor-pointer'
        >
          Back to Logs
        </Button>
      </div>
    </div>
  );
}
