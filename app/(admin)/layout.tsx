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
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="font-display font-bold text-2xl tracking-[0.2em] text-accent">ANTA ADMIN</div>
        <nav className="flex flex-col gap-4 font-mono text-sm uppercase tracking-widest">
          <Link href="/admin" className="hover:text-accent transition-colors">Dashboard</Link>
          <Link href="/admin/products" className="hover:text-accent transition-colors">Products</Link>
          <Link href="/admin/orders" className="hover:text-accent transition-colors">Orders</Link>
          <Link href="/" className="mt-8 text-zinc-500 hover:text-white transition-colors">Go to Store</Link>
        </nav>
      </aside>
      
      {/* Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
