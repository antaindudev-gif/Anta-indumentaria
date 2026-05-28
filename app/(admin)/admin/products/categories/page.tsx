import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { createCategory, deleteCategory } from "@/app/actions/categories";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { desc }) => [desc(categories.createdAt)],
  });

  return (
    <div className="p-8 pb-32">
      <div className="mb-8">
        <Link href="/admin/products" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-4 text-sm font-sans">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a Productos
        </Link>
        <h1 className="text-3xl font-display uppercase tracking-widest">Categorías</h1>
        <p className="text-zinc-400 font-sans mt-2">Gestiona las categorías de tu tienda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add new category */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-white/10 p-6">
            <h2 className="text-xl font-display uppercase mb-4">Nueva Categoría</h2>
            <form action={async (formData) => {
              "use server";
              await createCategory(formData);
            }} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs uppercase text-zinc-500 mb-1">Nombre</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Ej: Polerones Oversize" 
                  required 
                  className="w-full bg-black border border-white/10 p-3 text-sm text-white focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-zinc-500 mb-1">Slug (Identificador URL)</label>
                <input 
                  type="text" 
                  name="slug" 
                  placeholder="ej: polerones-oversize" 
                  required 
                  className="w-full bg-black border border-white/10 p-3 text-sm text-white focus:border-accent outline-none"
                />
                <p className="text-xs text-zinc-500 mt-1">Debe ser en minúsculas y sin espacios. Se usará en la URL.</p>
              </div>
              <button type="submit" className="w-full bg-accent text-black font-medium py-3 text-sm uppercase tracking-wider hover:bg-white transition-colors">
                Crear Categoría
              </button>
            </form>
          </div>
        </div>

        {/* List of categories */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-white/10 p-0 overflow-hidden">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-black/50 border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Slug</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-zinc-500">
                      No hay categorías creadas.
                    </td>
                  </tr>
                ) : (
                  allCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{cat.name}</td>
                      <td className="p-4 text-zinc-400">{cat.slug}</td>
                      <td className="p-4 text-right">
                        <form action={async () => {
                          "use server";
                          await deleteCategory(cat.id);
                        }}>
                          <button type="submit" className="text-red-400 hover:text-red-300 p-2" title="Eliminar categoría">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
