import { Button } from '@/components/ui/Button';

/** Shown when a screen's data could not be loaded (network or server error, not a 404). */
export function LoadFailed({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role='alert'
      className='flex flex-col items-center justify-center gap-3 rounded-lg bg-white py-16 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
    >
      <p className='text-sm font-medium'>{message}</p>
      <Button variant='outline' size='sm' className='cursor-pointer' onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
