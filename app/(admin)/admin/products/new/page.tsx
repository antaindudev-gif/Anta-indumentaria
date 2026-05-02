'use client';

import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-12 max-w-4xl">
      <div className="flex flex-col gap-4">
        <Link href="/admin/products" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest w-fit">
          <ArrowLeft className="w-4 h-4" /> Volver a Productos
        </Link>
        <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white">Nuevo Producto</h1>
      </div>
      
      <form className="flex flex-col gap-12">
        {/* Basic Info */}
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-8">
          <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nombre del Producto</label>
              <input type="text" placeholder="Ej: DECAY HOODIE" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Categoría</label>
              <select className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors appearance-none">
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="outerwear">Outerwear</option>
                <option value="accessories">Accesorios</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descripción Editorial</label>
            <textarea rows={4} placeholder="Describe el concepto, fit y material..." className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-8">
          <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Precios e Inventario</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Precio (CLP)</label>
              <input type="number" placeholder="45000" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Precio Comparación (Opcional tachado)</label>
              <input type="number" placeholder="55000" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/5 pt-8">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Variantes (Tallas y Stock)</label>
            <div className="flex items-center gap-4 bg-black p-4 border border-white/10">
              <input type="text" placeholder="Talla (Ej: L)" className="bg-transparent border-none text-sm text-white outline-none w-24" />
              <input type="number" placeholder="Stock" className="bg-transparent border-none text-sm text-white outline-none flex-1" />
              <input type="text" placeholder="SKU (Ej: ANTA-001-L)" className="bg-transparent border-none text-sm text-white outline-none flex-1" />
              <button type="button" className="text-red-400 hover:text-red-300 p-2"><X className="w-4 h-4" /></button>
            </div>
            <button type="button" className="text-accent hover:text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2 w-fit mt-2">
              <Plus className="w-4 h-4" /> Agregar Talla
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Galería (Cloudflare R2)</h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Imágenes 3/4</span>
          </div>
          
          <div className="border border-dashed border-white/20 bg-black hover:border-accent hover:bg-accent/5 transition-all p-12 flex flex-col items-center justify-center gap-4 cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground text-center">
              Arrastra imágenes aquí o haz clic para buscar<br/><br/>
              <span className="text-[10px]">JPG, PNG, WEBP (Max 5MB)</span>
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-6 border-t border-white/10 pt-8">
          <button type="button" className="text-muted-foreground hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">
            Guardar como Borrador
          </button>
          <button type="submit" className="bg-accent text-black px-8 py-4 font-mono text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors">
            Publicar Producto
          </button>
        </div>

      </form>
    </div>
  );
}
