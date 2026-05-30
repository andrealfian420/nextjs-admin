import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Users,
  ScrollText,
  Sun,
  Table2,
  KeyRound,
} from 'lucide-react';
import ThemeToggle from '@/components/frontend/ThemeToggle';

export const metadata = {
  title: 'Next.js Admin — Modern Admin Dashboard',
  description:
    'A modern, full-featured admin dashboard built with Next.js, TailwindCSS, and shadcn/ui.',
};

export default function Home() {
  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased'>
      {/* Nav */}
      <header className='sticky top-0 z-50 backdrop-blur-md bg-zinc-50/90 dark:bg-zinc-950/90 border-b border-zinc-200/70 dark:border-zinc-800/50'>
        <div className='max-w-5xl mx-auto px-6 h-14 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center'>
              <span className='text-[10px] font-bold text-white dark:text-zinc-900'>
                NA
              </span>
            </div>
            <span className='text-sm font-semibold tracking-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors'>
              nextjs-admin
            </span>
          </Link>
          <div className='flex items-center gap-1'>
            <ThemeToggle />
            <Link
              href='https://github.com/andrealfian420/nextjs-admin'
              target='_blank'
              className='p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors'
              aria-label='GitHub'
            >
              <svg
                viewBox='0 0 16 16'
                fill='currentColor'
                className='w-[18px] h-[18px]'
                aria-hidden='true'
              >
                <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z' />
              </svg>
            </Link>
            <Link
              href='/admin'
              className='ml-2 text-sm font-medium px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors'
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-b from-zinc-100/80 via-transparent to-transparent dark:from-zinc-900/50 dark:via-transparent pointer-events-none' />
          <div className='max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 relative'>
            <div className='max-w-2xl'>
              <h1 className='text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]'>
                The admin starter
                <br />
                you&apos;ll actually ship with.
              </h1>
              <p className='mt-5 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg'>
                Auth, roles, permissions, users, and activity logs — all wired
                up. Extend it, don&apos;t rebuild it.
              </p>
              <div className='mt-8 flex flex-wrap items-center gap-3'>
                <Link
                  href='/admin'
                  className='inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-sm'
                >
                  Open dashboard
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href='https://github.com/andrealfian420/nextjs-admin'
                  target='_blank'
                  className='inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors'
                >
                  <svg
                    viewBox='0 0 16 16'
                    fill='currentColor'
                    className='w-4 h-4'
                    aria-hidden='true'
                  >
                    <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z' />
                  </svg>
                  Source code
                </Link>
              </div>
            </div>

            {/* Dashboard wireframe preview */}
            <div className='mt-14 sm:mt-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 overflow-hidden'>
              <div className='flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800'>
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700' />
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700' />
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700' />
                <div className='ml-3 h-4 w-40 rounded bg-zinc-100 dark:bg-zinc-800' />
              </div>
              <div className='flex'>
                {/* Sidebar hint */}
                <div className='hidden sm:flex flex-col gap-2 p-3 w-44 border-r border-zinc-100 dark:border-zinc-800'>
                  <div className='h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700' />
                  <div className='h-3 w-28 rounded bg-zinc-100 dark:bg-zinc-800' />
                  <div className='h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800' />
                  <div className='h-3 w-32 rounded bg-zinc-100 dark:bg-zinc-800' />
                  <div className='h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800' />
                </div>
                {/* Main content hint */}
                <div className='flex-1 p-4 space-y-3'>
                  <div className='flex gap-3'>
                    <div className='flex-1 h-16 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700' />
                    <div className='flex-1 h-16 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700' />
                    <div className='hidden sm:block flex-1 h-16 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700' />
                  </div>
                  <div className='h-32 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700' />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className='max-w-5xl mx-auto px-6 py-16 sm:py-20'>
          <h2 className='text-2xl font-bold tracking-tight mb-10'>
            What&apos;s inside
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <FeatureCard
              icon={<KeyRound size={18} />}
              title='Auth & session'
              description='JWT login with silent refresh, HttpOnly cookies, and protected route middleware.'
            />
            <FeatureCard
              icon={<Shield size={18} />}
              title='Role-based access'
              description="Granular permissions per route and per UI element — hide what they can't touch."
            />
            <FeatureCard
              icon={<Users size={18} />}
              title='User management'
              description='Create, edit, and delete users. Avatar upload, profile editing, password reset.'
            />
            <FeatureCard
              icon={<ScrollText size={18} />}
              title='Activity logs'
              description='Searchable audit trail with timestamps and before/after diffs.'
            />
            <FeatureCard
              icon={<Sun size={18} />}
              title='Dark mode'
              description='System-aware theming with a manual toggle. Every component responds.'
            />
            <FeatureCard
              icon={<Table2 size={18} />}
              title='Data tables'
              description='Server-side pagination, column sorting, and debounced search out of the box.'
            />
          </div>
        </section>

        {/* Stack */}
        <section className='max-w-5xl mx-auto px-6 pb-16 sm:pb-20'>
          <div className='rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8'>
            <h2 className='text-lg font-semibold mb-4'>Built with</h2>
            <div className='flex flex-wrap gap-2'>
              {[
                'Next.js 16',
                'TypeScript',
                'Tailwind CSS 4',
                'shadcn/ui',
                'Radix UI',
                'TanStack Table',
                'React Hook Form',
                'Zod',
                'Zustand',
                'Axios',
                'Tiptap',
                'Sonner',
              ].map((tech) => (
                <span
                  key={tech}
                  className='text-sm px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium'
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-zinc-200/70 dark:border-zinc-800/50'>
        <div className='max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-500'>
          <span>
            &copy; {new Date().getFullYear()} &nbsp;
            <a
              href='https://github.com/andrealfian420'
              target='_blank'
              className='hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors'
            >
              Alfian Andre R
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className='group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all'>
      <div className='w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-3 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors'>
        {icon}
      </div>
      <h3 className='text-sm font-semibold mb-1'>{title}</h3>
      <p className='text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed'>
        {description}
      </p>
    </div>
  );
}
