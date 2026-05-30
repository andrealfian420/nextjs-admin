import Link from 'next/link';
import { User as UserIcon, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import Image from 'next/image';
import type { User } from '@/types';

export default function SidebarProfile({
  user,
  handleLogout,
}: {
  user: User | null;
  handleLogout: () => void;
}) {
  const profilePicture = () => {
    if (user?.avatarUrl) {
      return (
        <Image
          unoptimized
          width={12}
          height={12}
          src={user.avatarUrl}
          alt='Profile'
          className='h-8 w-8 rounded-full object-cover cursor-pointer'
        />
      );
    }

    return (
      <UserIcon
        size={16}
        className='text-zinc-600 dark:text-zinc-300 cursor-pointer'
      />
    );
  };

  return (
    <div className='h-14 flex items-center px-6 flex-shrink-0 border-t border-zinc-200 dark:border-zinc-800'>
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {profilePicture()}
              </DropdownMenuTrigger>

              <DropdownMenuContent className='mb-4 p-0 min-w-[180px]'>
                <DropdownMenuItem
                  asChild
                  className='w-full h-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-md transition cursor-pointer'
                >
                  <Link href='/admin/profile'>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='w-full h-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-md transition cursor-pointer'
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex flex-col'>
            <span className='text-sm font-medium text-zinc-700 dark:text-zinc-200'>
              {user?.name || 'Loading...'}
            </span>
            <span className='text-xs font-medium text-zinc-500 dark:text-zinc-400'>
              {user?.role?.title || 'Loading...'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title='Logout'
          className='p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer'
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
