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
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8 bg-[#0a0a0a]">
        <div className="font-display font-bold text-2xl tracking-[0.2em] text-accent">ANTA ADMIN</div>
        <nav className="flex flex-col gap-4 font-mono text-sm uppercase tracking-widest">
          <Link href="/admin" className="hover:text-accent transition-colors">Dashboard</Link>
          <Link href="/admin/analytics" className="hover:text-accent transition-colors">Analíticas</Link>
          <Link href="/admin/products" className="hover:text-accent transition-colors">Productos</Link>
          <Link href="/admin/orders" className="hover:text-accent transition-colors">Órdenes & Envíos</Link>
          <Link href="/admin/coupons" className="hover:text-accent transition-colors">Cupones</Link>
          <Link href="/admin/settings" className="hover:text-accent transition-colors">Configuración</Link>
          
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver a la Tienda
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-black">
        {children}
      </main>
    </div>
  );
}
