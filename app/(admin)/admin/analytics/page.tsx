import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const allOrders = await db.query.orders.findMany();
  const allUsers = await db.query.users.findMany();
  const allProducts = await db.query.products.findMany({
    with: { variants: true }
  });

  const totalRevenue = allOrders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((acc, order) => acc + Number(order.total), 0);

  const totalSales = allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').length;

  return (
    <div className="flex flex-col gap-12 max-w-6xl">
      <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">Analíticas y Rendimiento</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Ingresos Totales</h2>
          <p className="font-display text-4xl text-accent">${totalRevenue.toLocaleString('es-CL')}</p>
        </div>
        
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Ventas Exitosas</h2>
          <p className="font-display text-4xl text-white">{totalSales}</p>
        </div>

        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Clientes Registrados</h2>
          <p className="font-display text-4xl text-white">{allUsers.length}</p>
        </div>

        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Productos Activos</h2>
          <p className="font-display text-4xl text-white">{allProducts.filter(p => p.status === 'active').length}</p>
        </div>
      </div>

      {/* Aquí podrías agregar un gráfico (Recharts) en el futuro */}
      <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-6">
        <h2 className="font-mono text-white text-sm uppercase tracking-widest border-b border-white/10 pb-4">Actividad Reciente de Ventas</h2>
        <div className="h-64 flex items-center justify-center border border-white/5 bg-black/50">
          <p className="font-mono text-zinc-600 text-xs uppercase tracking-widest">Gráfico de ingresos no disponible. Faltan datos históricos.</p>
        </div>
      </div>
    </div>
  );
}
