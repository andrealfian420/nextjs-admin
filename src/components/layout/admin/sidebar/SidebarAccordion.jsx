import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useSidebarStore } from '@/store/useSidebarStore';

export default function SidebarAccordion({
  item,
  pathname,
  isAccordionOpen,
  toggleAccordion,
}) {
  const checkMobileClose = useSidebarStore((state) => state.checkMobileClose);
  const Icon = item.icon;
  const hasActiveChild = item.children.some((child) => child.href === pathname);

  return (
    <div>
      <button
        onClick={() => toggleAccordion(item.key)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
          hasActiveChild
            ? 'text-slate-900 dark:text-slate-100'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <Icon size={18} />
        <span className='flex-1 text-left'>{item.name}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ${isAccordionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className='overflow-hidden'>
          <div className='ml-6 flex flex-col gap-1 pt-1'>
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = pathname.includes(child.href);

              return (
                <Link
                  key={child.key}
                  href={child.href}
                  onClick={checkMobileClose} // close sidebar on mobile after clicking a link
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                    isChildActive
                      ? 'bg-slate-100 dark:bg-slate-700 font-medium text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <ChildIcon size={16} />
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
