"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const currentCategory = searchParams.get("category") || "all";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "all") {
      params.delete("category");
    } else {
      params.set("category", e.target.value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Categoría</label>
        <select 
          value={currentCategory} 
          onChange={handleCategoryChange}
          className="bg-black border border-white/10 p-3 font-mono text-xs uppercase tracking-widest text-white outline-none focus:border-accent transition-colors cursor-pointer appearance-none min-w-[160px]"
        >
          <option value="all">Todas</option>
          <option value="poleras">Poleras</option>
          <option value="polerones">Polerones</option>
          <option value="buzos">Buzos</option>
          <option value="conjuntos">Conjuntos</option>
          <option value="faldas">Faldas</option>
          <option value="accesorios">Accesorios</option>
          <option value="gorros">Gorros</option>
          <option value="chaquetas">Chaquetas</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Ordenar por</label>
        <select 
          value={currentSort} 
          onChange={handleSortChange}
          className="bg-black border border-white/10 p-3 font-mono text-xs uppercase tracking-widest text-white outline-none focus:border-accent transition-colors cursor-pointer appearance-none min-w-[200px]"
        >
          <option value="newest">Lo más nuevo</option>
          <option value="oldest">Lo más antiguo</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="name-asc">Nombre: A - Z</option>
          <option value="name-desc">Nombre: Z - A</option>
        </select>
      </div>
    </div>
  );
}
