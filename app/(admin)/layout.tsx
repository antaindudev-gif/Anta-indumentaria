import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 md:h-screen border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-8 bg-[#0a0a0a] flex-shrink-0 z-50">
        <div className="font-display font-bold text-2xl tracking-[0.2em] text-accent">ANTA ADMIN</div>
        <nav className="flex flex-col gap-4 font-mono text-sm uppercase tracking-widest w-full">
          <div className="flex md:flex-col gap-6 md:gap-4 whitespace-nowrap overflow-x-auto pb-4 md:pb-0 hide-scrollbar w-full max-w-[100vw] px-1">
            <Link href="/admin" className="hover:text-accent transition-colors shrink-0">Dashboard</Link>
            <Link href="/admin/analytics" className="hover:text-accent transition-colors shrink-0">Analíticas</Link>
            <Link href="/admin/products" className="hover:text-accent transition-colors shrink-0">Productos</Link>
            <Link href="/admin/orders" className="hover:text-accent transition-colors shrink-0">Órdenes & Envíos</Link>
            <Link href="/admin/coupons" className="hover:text-accent transition-colors shrink-0">Cupones</Link>
            <Link href="/admin/settings" className="hover:text-accent transition-colors shrink-0">Configuración</Link>
          </div>
          
          <div className="mt-2 md:mt-12 pt-4 md:pt-8 border-t border-white/10 flex flex-col gap-4">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver a la Tienda
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto bg-black h-full">
        {children}
      </main>
    </div>
  );
}
