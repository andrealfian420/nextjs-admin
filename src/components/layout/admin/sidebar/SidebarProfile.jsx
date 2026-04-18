import Link from 'next/link';
import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import Image from 'next/image';

export default function SidebarProfile({ user, handleLogout }) {
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
      <User
        size={16}
        className='text-slate-600 dark:text-slate-300 cursor-pointer'
      />
    );
  };

  return (
    <div className='h-14 flex items-center px-6 flex-shrink-0 border-t border-slate-200 dark:border-slate-700'>
      <div className='flex items-center gap-3'>
        <div className='h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {profilePicture()}
            </DropdownMenuTrigger>

            <DropdownMenuContent className='mb-4 p-0 min-w-[180px]'>
              <DropdownMenuItem
                asChild
                className='w-full h-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-md transition cursor-pointer'
              >
                <Link href='/admin/profile'>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='w-full h-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-md transition cursor-pointer'
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex flex-col'>
          <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
            {user?.name || 'Loading...'}
          </span>
          <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
            {user?.role?.title || 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
}
