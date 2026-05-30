import Link from 'next/link';
import {
  LayoutDashboard,
  Code,
  Shield,
  Users,
  History,
  Zap,
  Moon,
  Lock,
} from 'lucide-react';
import ThemeToggle from '@/components/frontend/ThemeToggle';

export const metadata = {
  title: 'Next.js Admin — Modern Admin Dashboard',
  description:
    'A modern, full-featured admin dashboard built with Next.js, TailwindCSS, and shadcn/ui.',
};

const features = [
  {
    icon: Shield,
    title: 'Role & Permission',
    description:
      'Granular access control with role-based permissions to keep your data secure.',
  },
  {
    icon: Users,
    title: 'User Management',
    description:
      'Create, update, and manage users with ease from a clean, intuitive interface.',
  },
  {
    icon: History,
    title: 'Activity Logs',
    description:
      'Track every action across the system with detailed, searchable activity logs.',
  },
  {
    icon: Zap,
    title: 'Fast & Lightweight',
    description:
      'Built on Next.js App Router with server components for blazing-fast performance.',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description:
      'First-class dark mode support powered by next-themes — looks great in any light.',
  },
  {
    icon: Lock,
    title: 'Secure Auth',
    description:
      'JWT-based authentication with protected routes and automatic token refresh.',
  },
];

export default function Home() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans'>
      {/* Navbar */}
      <header className='h-14 bg-white dark:bg-slate-800 border-b border-transparent dark:border-slate-700 flex items-center'>
        <div className='max-w-6xl w-full mx-auto px-6 flex items-center justify-between'>
          <span className='font-bold text-lg tracking-tight text-sky-600'>
            Next.js Admin
          </span>
          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <Link
              href='https://github.com/andrealfian420/nextjs-admin'
              target='_blank'
              className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <Code size={18} />
              GitHub
            </Link>
            <Link
              href='/admin'
              className='flex items-center gap-2 text-sm bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className='max-w-6xl mx-auto px-6 py-24 text-center'>
          <span className='inline-block text-xs font-semibold tracking-widest uppercase text-sky-600 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full mb-6'>
            Open Source
          </span>
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6'>
            Modern Admin Dashboard
            <br />
            <span className='text-sky-600'>Built for Developers</span>
          </h1>
          <p className='max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 mb-10'>
            A clean, full-featured admin starter built with Next.js 16,
            TailwindCSS 4, shadcn/ui, and a role-based permission system — ready
            to extend and ship.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              href='/admin'
              className='flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-sky-600/20'
            >
              <LayoutDashboard size={20} />
              Go to Dashboard
            </Link>
            <Link
              href='https://github.com/andrealfian420/nextjs-admin'
              target='_blank'
              className='flex items-center gap-2 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-xl font-semibold text-base transition-colors'
            >
              <Code size={20} />
              View on GitHub
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className='bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700'>
          <div className='max-w-6xl mx-auto px-6 py-20'>
            <h2 className='text-center text-2xl font-bold mb-12'>
              Everything you need to get started
            </h2>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className='bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow'
                >
                  <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 mb-4'>
                    <Icon size={20} />
                  </div>
                  <h3 className='font-semibold text-base mb-1'>{title}</h3>
                  <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className='max-w-6xl mx-auto px-6 py-20 text-center'>
          <h2 className='text-2xl font-bold mb-4'>Ready to explore?</h2>
          <p className='text-slate-500 dark:text-slate-400 mb-8'>
            Jump straight into the dashboard or browse the source code on
            GitHub.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              href='/admin'
              className='flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-sky-600/20'
            >
              <LayoutDashboard size={20} />
              Go to Dashboard
            </Link>
            <Link
              href='https://github.com/andrealfian420/nextjs-admin'
              target='_blank'
              className='flex items-center gap-2 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-xl font-semibold text-base transition-colors'
            >
              <Code size={20} />
              View on GitHub
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-slate-200 dark:border-slate-700'>
        <div className='max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-400 dark:text-slate-500'>
          &copy; {new Date().getFullYear()} - present. Made with ❤️ by{' '}
          <a
            href='https://github.com/andrealfian420'
            target='_blank'
            className='text-sky-600 hover:text-sky-700 dark:hover:text-sky-400 transition-colors'
          >
            Alfian Andre R
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
