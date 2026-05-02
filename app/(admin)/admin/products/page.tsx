import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Siempre buscar lo más reciente

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: {
      variants: true
    }
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">Gestión de Productos</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-xs uppercase tracking-widest px-6 py-3"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="border border-white/10 bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-[#111111] border-b border-white/10">
            <tr>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Producto</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Estado</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Stock (Variantes)</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal">Precio</th>
              <th className="p-4 text-xs text-muted-foreground uppercase tracking-widest font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 uppercase tracking-widest text-xs">No hay productos creados aún.</td>
              </tr>
            ) : (
              allProducts.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-900 border border-white/10 overflow-hidden">
                          {p.images && (p.images as string[])[0] ? (
                            <img src={(p.images as string[])[0]} alt={p.name} className="w-full h-full object-cover grayscale opacity-80" />
                          ) : (
                            <div className="w-full h-full bg-zinc-800" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white uppercase">{p.name}</p>
                          <p className="text-xs text-zinc-500 uppercase tracking-widest">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-widest border ${
                        p.status === 'active' ? 'border-accent text-accent' : 
                        p.status === 'draft' ? 'border-yellow-500 text-yellow-500' : 
                        'border-red-500 text-red-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={totalStock === 0 ? "text-red-500" : "text-white"}>{totalStock}</span> uni.
                    </td>
                    <td className="p-4">${Number(p.price).toLocaleString('es-CL')}</td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-widest">
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
