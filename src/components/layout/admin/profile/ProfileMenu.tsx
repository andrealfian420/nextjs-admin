'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types/user';

const focusRing =
  'outline-none focus-visible:ring-3 focus-visible:ring-ring/50';

function Avatar({ user }: { user: UserProfile | null }) {
  if (user?.avatarUrl) {
    return (
      // avatarUrl may live on any backend/media host; a plain img needs no allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        width={32}
        height={32}
        src={user.avatarUrl}
        alt=''
        className='h-8 w-8 shrink-0 rounded-full object-cover'
      />
    );
  }

  return (
    <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700'>
      <User size={16} className='text-zinc-600 dark:text-zinc-300' aria-hidden />
    </span>
  );
}

/**
 * The signed-in user's account menu (profile, logout), shared by the navbar and the sidebar
 * footer. The trigger is a real button, so it is reachable and operable by keyboard.
 */
export default function ProfileMenu({
  variant,
}: {
  /** `navbar` is compact and right-aligned; `sidebar` fills the footer row. */
  variant: 'navbar' | 'sidebar';
}) {
  const user = useAuthStore((state) => state.user);
  const { handleLogout } = useLogout();
  const isSidebar = variant === 'sidebar';
  const name = user?.name || 'Account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          // The name is hidden on narrow navbars, so the accessible name is set explicitly.
          aria-label={`Account menu for ${name}`}
          className={cn(
            'group flex items-center rounded-lg transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800',
            focusRing,
            isSidebar ? 'w-full gap-3 px-3 py-2 text-left' : 'gap-2 p-1 pr-2',
          )}
        >
          <Avatar user={user} />

          {isSidebar ? (
            <span className='flex min-w-0 flex-col'>
              <span className='truncate text-sm font-medium text-zinc-700 dark:text-zinc-200'>
                {name}
              </span>
              <span className='truncate text-xs font-medium text-zinc-500 dark:text-zinc-400'>
                {user?.role?.title || '—'}
              </span>
            </span>
          ) : (
            <span className='hidden max-w-48 truncate text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-200'>
              {name}
            </span>
          )}

          <ChevronDown
            size={16}
            aria-hidden
            className={cn(
              'shrink-0 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-zinc-400',
              isSidebar && 'ml-auto',
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-56'
        align={isSidebar ? 'start' : 'end'}
        side={isSidebar ? 'top' : 'bottom'}
        sideOffset={8}
      >
        <DropdownMenuLabel className='flex flex-col gap-0.5'>
          <span className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-100'>
            {name}
          </span>
          {user?.email && (
            <span className='truncate text-xs font-normal'>{user.email}</span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className='p-2 rounded-md cursor-pointer'>
          <Link href='/admin/profile'>
            <User aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          variant='destructive'
          className='p-2 rounded-md cursor-pointer'
          onSelect={() => void handleLogout()}
        >
          <LogOut aria-hidden />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
