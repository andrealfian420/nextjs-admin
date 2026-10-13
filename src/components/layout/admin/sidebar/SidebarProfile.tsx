import ProfileMenu from '@/components/layout/admin/profile/ProfileMenu';

export default function SidebarProfile() {
  return (
    <div className='flex-shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800'>
      <ProfileMenu variant='sidebar' />
    </div>
  );
}
