'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createProduct } from '@/app/actions/products';

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [category, setCategory] = useState('tops');
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [colors, setColors] = useState("Negro, Blanco");
  const [isSale, setIsSale] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMainImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-6rem)] gap-8 overflow-hidden">
      
      {/* LEFT: FORM */}
      <div className="w-1/2 h-full overflow-y-auto pr-4 custom-scrollbar">
        <div className="flex flex-col gap-4 mb-8">
          <Link href="/admin/products" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest w-fit">
            <ArrowLeft className="w-4 h-4" /> Volver a Productos
          </Link>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">Añadir Producto</h1>
        </div>
        
        <form
          action={async (formData) => {
            setIsSubmitting(true);
            await createProduct(formData);
            setIsSubmitting(false);
          }}
          className="flex flex-col gap-8 pb-24"
        >
          {/* Image Upload */}
          {/* Image Upload */}
          <div className="flex flex-col gap-4">
            <div className="border border-white/10 bg-[#0a0a0a] p-6 flex flex-col gap-4">
              <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Foto de Portada</h2>
              <label className="border border-dashed border-white/20 bg-black hover:border-accent hover:bg-accent/5 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Seleccionar Portada Principal</span>
                <input name="imageFile" type="file" accept="image/*" onChange={handleMainFileChange} className="hidden" />
              </label>
              {mainImagePreview && <p className="text-[10px] text-accent font-mono uppercase">Portada seleccionada.</p>}
            </div>

            <div className="border border-white/10 bg-[#0a0a0a] p-6 flex flex-col gap-4">
              <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Fotos de Galería</h2>
              <label className="border border-dashed border-white/20 bg-black hover:border-accent hover:bg-accent/5 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Seleccionar Varias Imágenes para Galería</span>
                <input name="galleryFiles" type="file" accept="image/*" multiple onChange={handleGalleryFileChange} className="hidden" />
              </label>
              {galleryPreviews.length > 0 && <p className="text-[10px] text-accent font-mono uppercase">{galleryPreviews.length} fotos de galería seleccionadas.</p>}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nombre</label>
            <input name="name" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Ej: DECAY HOODIE" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" required />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Precio (CLP)</label>
              <input name="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="45000" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Precio Comparación</label>
              <input name="compareAtPrice" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" placeholder="55000" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Categoría</label>
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors appearance-none">
              <option value="poleras">Poleras</option>
              <option value="polerones">Polerones</option>
              <option value="buzos">Buzos</option>
              <option value="conjuntos">Conjuntos</option>
              <option value="faldas">Faldas</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>

          {/* Labels (Oferta / Pre-Order) */}
          <div className="flex gap-8 border border-white/10 p-4 bg-[#0a0a0a]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isSale" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} className="w-4 h-4 accent-accent bg-black border-white/10" />
              <span className="font-mono text-[10px] text-white uppercase tracking-widest">Oferta</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isPreOrder" checked={isPreOrder} onChange={(e) => setIsPreOrder(e.target.checked)} className="w-4 h-4 accent-accent bg-black border-white/10" />
              <span className="font-mono text-[10px] text-white uppercase tracking-widest">Pre Order</span>
            </label>
          </div>

          {/* Sizes and Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Tallas (Separadas por comas)</label>
              <input name="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} type="text" placeholder="Ej: S, M, L, XL" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Colores (Opcional, comas)</label>
              <input name="colors" value={colors} onChange={(e) => setColors(e.target.value)} type="text" placeholder="Ej: Negro, Blanco" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descripción Corta</label>
            <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe el concepto, fit y material..." className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
          </div>

          <input type="hidden" name="status" value="active" />

          <button disabled={isSubmitting} type="submit" className="bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-sm uppercase tracking-widest px-10 py-5 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
            Añadir
          </button>
        </form>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-1/2 h-full bg-[#050505] border border-white/5 overflow-hidden relative flex flex-col items-center justify-center">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-50 p-2 border-b border-white/10 w-full">
          <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Previsualización</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-sm">
          {/* Product Card Preview */}
          <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-[3/4] bg-[#111111] overflow-hidden border border-white/5 flex items-center justify-center">
              {mainImagePreview ? (
                <Image src={mainImagePreview} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-600">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-center">Sin imagen</span>
                </div>
              )}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                  {isPreOrder && (
                    <span className="bg-white text-black font-mono text-[10px] uppercase font-bold px-2 py-1 tracking-widest">
                      Pre-Order
                    </span>
                  )}
                  {isSale && (
                    <span className="bg-accent text-black font-mono text-[10px] uppercase font-bold px-2 py-1 tracking-widest">
                      Oferta
                    </span>
                  )}
                </div>
            </div>
            <div className="flex justify-between items-start">
              <h3 className="font-display font-bold text-lg uppercase tracking-widest text-foreground">
                {name || 'NOMBRE DEL PRODUCTO'}
              </h3>
              <span className="font-mono text-sm tracking-wider text-muted-foreground">
                {price ? `$${Number(price).toLocaleString('es-CL')}` : '$0'}
              </span>
            </div>
            {description && (
              <p className="font-sans text-xs text-foreground/60 uppercase tracking-[0.15em] leading-loose">{description}</p>
            )}
            {sizes && (
              <div className="flex gap-2 mt-2">
                {sizes.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s} className="border border-white/20 px-3 py-1 font-mono text-[10px] uppercase">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
