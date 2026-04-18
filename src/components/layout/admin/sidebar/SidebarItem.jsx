import Link from 'next/link';
import { useSidebarStore } from '@/store/useSidebarStore';

export default function SidebarItem({ item, isActive, setOpenAccordions }) {
  const checkMobileClose = useSidebarStore((state) => state.checkMobileClose);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={() => {
        setOpenAccordions(new Set());
        checkMobileClose(); // close sidebar on mobile after clicking a link
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-slate-100 dark:bg-slate-700 font-medium text-slate-900 dark:text-slate-100'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      <Icon size={18} />
      {item.name}
    </Link>
  );
}
