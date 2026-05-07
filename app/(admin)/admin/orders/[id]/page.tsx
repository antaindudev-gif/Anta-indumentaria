import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OrderManagementPanel } from "./OrderManagementPanel";

export const dynamic = "force-dynamic";

export default async function ManageOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      user: true,
      items: {
        with: { product: true }
      }
    }
  });

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <a href="/admin/orders" className="font-mono text-xs text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
          ← Órdenes
        </a>
        <span className="text-zinc-700">/</span>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">#{id.split('-')[0]}</span>
      </div>

      <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">
        Gestionar Pedido
      </h1>

      <OrderManagementPanel order={order as any} />
    </div>
  );
}
