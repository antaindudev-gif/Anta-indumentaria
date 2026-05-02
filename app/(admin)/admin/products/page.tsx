import Link from 'next/link';

// MOCK DATA: Esto vendrá de Drizzle ORM
const mockProducts = [
  { id: '1', sku: 'ANTA-001', name: 'DECAY HOODIE', price: 45000, stock: 12, status: 'active' },
  { id: '2', sku: 'ANTA-002', name: 'VOID T-SHIRT', price: 25000, stock: 0, status: 'sold_out' },
  { id: '3', sku: 'ANTA-003', name: 'ABYSS CARGO', price: 55000, stock: 3, status: 'active' },
];

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white">Productos</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-accent text-black px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
        >
          + Agregar Producto
        </Link>
      </div>
      
      <div className="border border-white/10 bg-[#111111] overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-normal text-muted-foreground">SKU</th>
              <th className="p-4 font-normal text-muted-foreground">Nombre</th>
              <th className="p-4 font-normal text-muted-foreground">Precio</th>
              <th className="p-4 font-normal text-muted-foreground">Stock</th>
              <th className="p-4 font-normal text-muted-foreground">Estado</th>
              <th className="p-4 font-normal text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">{p.sku}</td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">${p.price.toLocaleString('es-CL')}</td>
                <td className="p-4">
                  <span className={p.stock < 5 ? 'text-red-400' : 'text-white'}>{p.stock}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs ${p.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 flex gap-4">
                  <button className="text-accent hover:text-white transition-colors">Editar</button>
                  <button className="text-red-400 hover:text-white transition-colors">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
