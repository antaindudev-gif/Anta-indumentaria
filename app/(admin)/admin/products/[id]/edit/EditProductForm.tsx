'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { updateProduct, deleteProduct } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { useEffect } from 'react';

export function EditProductForm({ product }: { product: any }) {
  const images = (product.images as string[]) || [];
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(product.compareAtPrice ? String(product.compareAtPrice) : '');
  const [category, setCategory] = useState(product.category);
  const [status, setStatus] = useState(product.status);
  const [isSale, setIsSale] = useState(product.isSale || false);
  const [isPreOrder, setIsPreOrder] = useState(product.isPreOrder || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [variants, setVariants] = useState<{ id?: string, size: string, color: string | null, stock: number }[]>(product.variants || []);

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(images[0] || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(images.slice(1));
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategoriesList(data);
    });
  }, []);

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
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">Editar Producto</h1>
        </div>
        
        <form
          action={async (formData) => {
            setIsSubmitting(true);
            await updateProduct(formData);
            setIsSubmitting(false);
          }}
          className="flex flex-col gap-8 pb-12"
        >
          <input type="hidden" name="productId" value={product.id} />

          {/* Image Upload */}
          <div className="flex flex-col gap-4">
            <div className="border border-white/10 bg-[#0a0a0a] p-6 flex flex-col gap-4">
              <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Foto de Portada</h2>
              <label className="border border-dashed border-white/20 bg-black hover:border-accent hover:bg-accent/5 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Cambiar Portada Principal</span>
                <input name="imageFile" type="file" accept="image/*" onChange={handleMainFileChange} className="hidden" />
              </label>
              {mainImagePreview && <p className="text-[10px] text-accent font-mono uppercase">Portada lista.</p>}
            </div>

            <div className="border border-white/10 bg-[#0a0a0a] p-6 flex flex-col gap-4">
              <h2 className="font-mono text-accent text-xs uppercase tracking-widest">Fotos de Galería</h2>
              <label className="border border-dashed border-white/20 bg-black hover:border-accent hover:bg-accent/5 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reemplazar Galería (Sube varias imágenes)</span>
                <input name="galleryFiles" type="file" accept="image/*" multiple onChange={handleGalleryFileChange} className="hidden" />
              </label>
              {galleryPreviews.length > 0 && <p className="text-[10px] text-accent font-mono uppercase">{galleryPreviews.length} imágenes en galería.</p>}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nombre</label>
            <input name="name" value={name} onChange={(e) => setName(e.target.value)} type="text" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" required />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Precio (CLP)</label>
              <input name="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Precio Comparación</label>
              <input name="compareAtPrice" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Categoría</label>
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors appearance-none">
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
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

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Estado</label>
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors appearance-none">
              <option value="active">Activo (Visible)</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descripción</label>
            <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
          </div>

          {/* Variants */}
          <div className="flex flex-col gap-4 border border-white/10 p-4">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex justify-between items-center">
              Variantes y Stock
              <button type="button" onClick={() => setVariants([...variants, { size: '', color: '', stock: 0 }])} className="text-accent hover:text-white transition-colors">
                + Añadir Variante
              </button>
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center mb-2 px-1">
                <span className="font-mono text-[10px] text-zinc-500 w-1/4 uppercase">Talla</span>
                <span className="font-mono text-[10px] text-zinc-500 w-1/4 uppercase">Color</span>
                <span className="font-mono text-[10px] text-zinc-500 w-1/4 uppercase">Stock</span>
                <span className="w-10"></span>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input 
                    value={v.size} 
                    onChange={(e) => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} 
                    placeholder="S" 
                    className="bg-black border border-white/10 p-3 font-sans text-xs text-white w-1/4 outline-none focus:border-accent uppercase" 
                  />
                  <input 
                    value={v.color || ''} 
                    onChange={(e) => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} 
                    placeholder="Ej: Negro" 
                    className="bg-black border border-white/10 p-3 font-sans text-xs text-white w-1/4 outline-none focus:border-accent" 
                  />
                  <input 
                    type="number" 
                    value={v.stock} 
                    onChange={(e) => { const n = [...variants]; n[i].stock = parseInt(e.target.value) || 0; setVariants(n); }} 
                    placeholder="0" 
                    className="bg-black border border-white/10 p-3 font-sans text-xs text-white w-1/4 outline-none focus:border-accent" 
                  />
                  <button type="button" onClick={() => { const n = [...variants]; n.splice(i, 1); setVariants(n); }} className="p-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {variants.length === 0 && <p className="font-mono text-[10px] text-zinc-600 uppercase">Sin variantes. Agrega una.</p>}
            </div>
            <input type="hidden" name="variantsData" value={JSON.stringify(variants)} />
          </div>

          <button disabled={isSubmitting} type="submit" className="bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-sm uppercase tracking-widest px-10 py-5 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
            Guardar Cambios
          </button>
        </form>

        {/* Delete */}
        <form
          action={async (formData) => {
            if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;
            setIsDeleting(true);
            await deleteProduct(formData);
            setIsDeleting(false);
          }}
          className="border-t border-red-500/20 pt-8 pb-24"
        >
          <input type="hidden" name="productId" value={product.id} />
          <button disabled={isDeleting} type="submit" className="text-red-500 hover:text-red-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
            {isDeleting ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            Eliminar Producto Permanentemente
          </button>
        </form>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-1/2 h-full bg-[#050505] border border-white/5 overflow-hidden relative flex flex-col items-center justify-center">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-50 p-2 border-b border-white/10 w-full">
          <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Previsualización</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-sm">
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
              <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground z-20">
                {category.toUpperCase()}
              </div>
              <span className={`absolute top-4 right-4 px-2 py-1 text-[10px] uppercase tracking-widest border z-20 ${
                status === 'active' ? 'border-accent text-accent' : status === 'draft' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'
              }`}>
                {status}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <h3 className="font-display font-bold text-lg uppercase tracking-widest text-foreground">
                {name || 'NOMBRE'}
              </h3>
              <span className="font-mono text-sm tracking-wider text-muted-foreground">
                {price ? `$${Number(price).toLocaleString('es-CL')}` : '$0'}
              </span>
            </div>
            {description && (
              <p className="font-sans text-xs text-foreground/60 uppercase tracking-[0.15em] leading-loose">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
