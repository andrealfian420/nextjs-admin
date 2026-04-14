import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function AdminLayout({ children }) {
  return (
    <div className='flex h-screen font-sans bg-slate-50 text-slate-800 overflow-hidden'>
      <Sidebar />

      <div className='flex-1 flex flex-col transition-all duration-300'>
        <Navbar />

        <main className='flex-1 overflow-y-auto p-6 sm:p-5 space-y-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
