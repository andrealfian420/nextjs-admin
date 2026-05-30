import Link from 'next/link';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className='mb-4 space-y-1'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
            {title}
          </h1>
          {description && (
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>
              {description}
            </p>
          )}
        </div>
        {actions && <div className='shrink-0'>{actions}</div>}
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className='text-slate-600 dark:text-slate-400 text-sm'>
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={crumb.href!}
                          className='text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-sm transition-colors'
                        >
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className='text-slate-300 dark:text-slate-600' />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </div>
  );
}
