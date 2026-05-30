import Link from 'next/link';
import { useSidebarStore } from '@/store/useSidebarStore';
import type { MenuItem } from '@/types';

export default function SidebarItem({
  item,
  isActive,
  setOpenAccordions,
}: {
  item: MenuItem;
  isActive: boolean;
  setOpenAccordions: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const checkMobileClose = useSidebarStore((state) => state.checkMobileClose);
  const Icon = item.icon!;

  return (
    <Link
      href={item.href!}
      onClick={() => {
        setOpenAccordions(new Set());
        checkMobileClose(); // close sidebar on mobile after clicking a link
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
      }`}
    >
      <Icon size={18} />
      {item.name}
    </Link>
  );
}
