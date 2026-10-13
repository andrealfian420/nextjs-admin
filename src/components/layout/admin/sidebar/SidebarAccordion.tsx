import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useSidebarStore } from '@/store/useSidebarStore';
import type { MenuGroup } from '@/types/ui';

export default function SidebarAccordion({
  item,
  activeHref,
  isAccordionOpen,
  toggleAccordion,
}: {
  item: MenuGroup;
  activeHref: string | undefined;
  isAccordionOpen: boolean;
  toggleAccordion: (key: string) => void;
}) {
  const checkMobileClose = useSidebarStore((state) => state.checkMobileClose);
  const Icon = item.icon;
  const hasActiveChild = item.children.some((child) => child.href === activeHref);
  const panelId = `sidebar-group-${item.key}`;

  return (
    <div>
      <button
        type='button'
        onClick={() => toggleAccordion(item.key)}
        aria-expanded={isAccordionOpen}
        aria-controls={panelId}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
          hasActiveChild
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
        }`}
      >
        {Icon && <Icon size={18} aria-hidden />}
        <span className='flex-1 text-left'>{item.name}</span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        id={panelId}
        // Collapsed links stay out of the tab order and the accessibility tree.
        inert={!isAccordionOpen}
        className={`grid transition-all duration-200 ${isAccordionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className='overflow-hidden'>
          <div className='ml-6 flex flex-col gap-1 pt-1'>
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = child.href === activeHref;

              return (
                <Link
                  key={child.key}
                  href={child.href}
                  aria-current={isChildActive ? 'page' : undefined}
                  onClick={checkMobileClose} // close sidebar on mobile after clicking a link
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    isChildActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {ChildIcon && <ChildIcon size={16} aria-hidden />}
                  {child.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
