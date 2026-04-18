'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Store & Hooks
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/hooks/useLogout';

// Utils
import { filterMenuByAccess } from '@/lib/permission';
import { ADMIN_MENU } from '@/config/navigation';
import { generateRandomKey } from '@/lib/utils';

// Sub-components
import SidebarItem from './sidebar/SidebarItem';
import SidebarAccordion from './sidebar/SidebarAccordion';
import SidebarProfile from './sidebar/SidebarProfile';

export default function Sidebar() {
  const pathname = usePathname();

  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  const { handleLogout } = useLogout();
  const user = useAuthStore((state) => state.user);

  const [openAccordions, setOpenAccordions] = useState(new Set());
  const filteredMenu = filterMenuByAccess(ADMIN_MENU, user);

  const allFlatItems = filteredMenu.flatMap((item) =>
    item.separator ? [] : item.children ? item.children : [item],
  );

  // Find the most specific matching href (longest prefix match) to avoid
  // short hrefs like /admin matching every admin sub-page.
  const activeHref = allFlatItems
    .filter(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  // Watcher to automatically open the relevant accordion if the current pathname matches any of its children.
  useEffect(() => {
    filteredMenu.forEach((item) => {
      if (item.children?.some((child) => child.href === activeHref)) {
        setOpenAccordions((prev) => {
          if (prev.has(item.key)) return prev;
          const next = new Set(prev);
          next.add(item.key);
          return next;
        });
      }
    });
  }, [pathname, filteredMenu]);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto z-50 lg:z-auto flex flex-col flex-shrink-0 bg-white dark:bg-slate-800 shadow-[2px_0_12px_0_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full lg:w-0 lg:translate-x-0'
        }`}
      >
        <div className='h-14 flex items-center px-6 flex-shrink-0'>
          <h1 className='font-semibold text-lg tracking-tight whitespace-nowrap text-slate-800 dark:text-slate-100'>
            Admin Panel
          </h1>
        </div>

        <nav className='flex flex-col gap-1 p-3 flex-1 overflow-y-auto'>
          {filteredMenu.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={generateRandomKey()}
                  className='border-t border-slate-200 dark:border-slate-700 my-2'
                />
              );
            }

            if (item.children) {
              return (
                <SidebarAccordion
                  key={item.key}
                  item={item}
                  activeHref={activeHref}
                  isAccordionOpen={openAccordions.has(item.key)}
                  toggleAccordion={toggleAccordion}
                />
              );
            }

            return (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={item.href === activeHref}
                setOpenAccordions={setOpenAccordions}
              />
            );
          })}
        </nav>

        <SidebarProfile user={user} handleLogout={handleLogout} />
      </aside>
    </>
  );
}
