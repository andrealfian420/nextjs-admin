import ThemeToggle from '@/components/frontend/ThemeToggle';
import { config } from '@/config';

/** Text of the left brand panel. */
export interface AuthPanelCopy {
  title: React.ReactNode;
  text: string;
}

const DEFAULT_PANEL: AuthPanelCopy = {
  title: (
    <>
      Manage everything
      <br />
      from one place.
    </>
  ),
  text: 'Roles, permissions, users, and activity logs — your full admin toolkit, ready to go.',
};

// A faint grid over the brand panel (inline SVG; Tailwind's bracket syntax would mangle it).
const gridStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='white' stroke-width='.5'/%3E%3C/svg%3E\")",
};

function BrandMark({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center rounded-md font-bold ${className}`}
    >
      {config.shortName}
    </span>
  );
}

/**
 * Split layout shared by the auth pages: the brand panel on large screens, the theme
 * toggle, the app identity (from config) and a centred column with the page heading and
 * the form passed as children.
 */
export default function AuthSplitShell({
  children,
  title,
  subtitle,
  panel = DEFAULT_PANEL,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  panel?: AuthPanelCopy;
}) {
  return (
    <div className='min-h-screen flex bg-zinc-50 dark:bg-zinc-950 antialiased'>
      {/* Brand panel — hidden below lg, where the small logo stands in */}
      <aside className='hidden lg:flex lg:w-1/2 relative bg-zinc-900 items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.03)_0%,_transparent_60%)]' />
        <div className='relative z-10 px-12 max-w-md'>
          <BrandMark className='w-10 h-10 rounded-lg bg-white text-sm text-zinc-900 mb-8' />
          <h2 className='text-3xl font-bold text-white tracking-tight leading-tight'>
            {panel.title}
          </h2>
          <p className='mt-4 text-zinc-400 leading-relaxed'>{panel.text}</p>
        </div>
        <div className='absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-zinc-950/80 to-transparent' />
        <div className='absolute inset-0 opacity-[0.03]' style={gridStyle} />
      </aside>

      {/* Form column */}
      <main className='flex-1 flex flex-col'>
        <div className='flex justify-end p-4'>
          <ThemeToggle />
        </div>

        <div className='flex-1 flex items-center justify-center px-6 pb-12'>
          <div className='w-full max-w-sm'>
            <div className='lg:hidden flex items-center gap-2 mb-8'>
              <BrandMark className='w-8 h-8 bg-zinc-900 dark:bg-zinc-100 text-xs text-white dark:text-zinc-900' />
              <span className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                {config.name}
              </span>
            </div>

            <div className='mb-8'>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight'>
                {title}
              </h1>
              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
