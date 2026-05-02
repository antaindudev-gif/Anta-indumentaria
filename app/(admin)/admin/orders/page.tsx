import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      user: true,
      items: {
        with: { product: true }
      }
    }
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">Órdenes & Envíos</h1>

      <div className="border border-white/10 bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-[#111111] border-b border-white/10">
            <tr>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">ID Pedido</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Fecha</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Cliente</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Estado</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Total</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 uppercase tracking-widest text-xs">No hay órdenes registradas aún.</td>
              </tr>
            ) : (
              allOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-zinc-300">#{o.id.split('-')[0]}</td>
                  <td className="p-4 text-zinc-500">{new Date(o.createdAt).toLocaleDateString('es-CL')}</td>
                  <td className="p-4">
                    <p className="text-white">{o.user?.name || o.guestEmail || 'Invitado'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-widest border ${
                      o.status === 'delivered' ? 'border-accent text-accent' : 
                      o.status === 'pending' ? 'border-yellow-500 text-yellow-500' : 
                      o.status === 'paid' ? 'border-blue-500 text-blue-500' :
                      'border-zinc-500 text-zinc-500'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-accent font-bold">${Number(o.total).toLocaleString('es-CL')}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-widest">
                      Gestionar Envío
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
