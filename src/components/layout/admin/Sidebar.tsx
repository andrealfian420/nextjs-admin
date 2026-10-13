'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

// Store & Hooks
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAuthStore } from '@/store/useAuthStore';

// Utils
import { filterMenuByAccess } from '@/lib/permission';
import { ADMIN_MENU } from '@/config/navigation';
import { config } from '@/config';
import type { MenuGroup, MenuLink } from '@/types/ui';

// Sub-components
import SidebarItem from './sidebar/SidebarItem';
import SidebarAccordion from './sidebar/SidebarAccordion';
import SidebarProfile from './sidebar/SidebarProfile';

export const ADMIN_SIDEBAR_ID = 'admin-sidebar';

export default function Sidebar() {
  const pathname = usePathname();

  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  const user = useAuthStore((state) => state.user);

  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const filteredMenu = filterMenuByAccess(ADMIN_MENU, user);

  const allLinks = filteredMenu.flatMap((item): MenuLink[] =>
    'separator' in item ? [] : 'children' in item ? item.children : [item],
  );

  // Find the most specific matching href (longest prefix match) to avoid
  // short hrefs like /admin matching every admin sub-page.
  const activeHref = allLinks
    .filter(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  // Open the group holding the active link whenever it changes (e.g. after navigating),
  // while keeping groups the user opened. Adjusted during render, not in an effect.
  const activeGroupKey = filteredMenu.find(
    (item): item is MenuGroup =>
      'children' in item &&
      item.children.some((child) => child.href === activeHref),
  )?.key;
  const [seenGroupKey, setSeenGroupKey] = useState<string | undefined>();
  if (activeGroupKey !== seenGroupKey) {
    setSeenGroupKey(activeGroupKey);
    if (activeGroupKey && !openAccordions.has(activeGroupKey)) {
      setOpenAccordions(new Set(openAccordions).add(activeGroupKey));
    }
  }

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      <aside
        id={ADMIN_SIDEBAR_ID}
        aria-label='Sidebar'
        // A closed sidebar is off-screen or zero-width: keep its links out of the tab order.
        inert={!isOpen}
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto z-50 lg:z-auto flex flex-col flex-shrink-0 bg-white dark:bg-zinc-900 shadow-[2px_0_12px_0_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full lg:w-0 lg:translate-x-0'
        }`}
      >
        <div className='h-14 flex items-center gap-2 px-6 flex-shrink-0'>
          <span
            aria-hidden
            className='w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-white dark:text-zinc-900'
          >
            {config.shortName}
          </span>
          <span className='font-semibold text-lg tracking-tight whitespace-nowrap text-zinc-900 dark:text-zinc-100'>
            {config.name}
          </span>
        </div>

        <nav
          aria-label='Main'
          className='flex flex-col gap-1 p-3 flex-1 overflow-y-auto'
        >
          {filteredMenu.map((item, index) => {
            if ('separator' in item) {
              return (
                <div
                  key={`separator-${index}`}
                  role='separator'
                  className='border-t border-zinc-200 dark:border-zinc-800 my-2'
                />
              );
            }

            if ('children' in item) {
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
                onNavigate={() => setOpenAccordions(new Set())}
              />
            );
          })}
        </nav>

        <SidebarProfile />
      </aside>
    </>
  );
}
