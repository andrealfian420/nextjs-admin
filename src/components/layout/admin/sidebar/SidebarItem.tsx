import Link from 'next/link';
import { useSidebarStore } from '@/store/useSidebarStore';
import type { MenuLink } from '@/types/ui';

export default function SidebarItem({
  item,
  isActive,
  onNavigate,
}: {
  item: MenuLink;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const checkMobileClose = useSidebarStore((state) => state.checkMobileClose);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => {
        onNavigate?.();
        checkMobileClose(); // close sidebar on mobile after clicking a link
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
      }`}
    >
      {Icon && <Icon size={18} aria-hidden />}
      {item.name}
    </Link>
  );
}
