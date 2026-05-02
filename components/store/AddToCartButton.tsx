'use client';

import { useCartStore, CartItem } from '@/stores/cartStore';
import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
  variants: { id: string; size: string; stock: number }[];
}

export function AddToCartButton({ productId, name, price, image, slug, variants }: AddToCartButtonProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const addItem = useCartStore((s) => s.addItem);

  const selectedSize = variants.find((v) => v.id === selectedVariant);

  const handleAdd = () => {
    if (!selectedVariant || !selectedSize) return;
    setStatus('loading');

    addItem({
      productId,
      variantId: selectedVariant,
      name,
      size: selectedSize.size,
      price,
      image,
      quantity: 1,
      slug,
    });

    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 1500);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Size selector */}
      {variants.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Talla</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => setSelectedVariant(v.id)}
                className={`border py-4 font-mono text-sm transition-colors ${
                  v.stock === 0
                    ? 'border-white/5 text-zinc-700 cursor-not-allowed line-through'
                    : selectedVariant === v.id
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-white/20 hover:border-accent hover:text-accent'
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!selectedVariant || status === 'loading'}
        className={`w-full text-sm py-8 font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
          !selectedVariant
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : status === 'success'
            ? 'bg-accent text-black'
            : 'bg-accent text-black hover:bg-white'
        }`}
      >
        {status === 'loading' && <Loader2 className="animate-spin w-5 h-5" />}
        {status === 'success' && <Check className="w-5 h-5" />}
        {status === 'idle' && !selectedVariant && 'Selecciona una talla'}
        {status === 'idle' && selectedVariant && 'Agregar al Carrito'}
        {status === 'loading' && 'Agregando...'}
        {status === 'success' && '¡Agregado!'}
      </button>

      <p className="font-mono text-[10px] text-muted-foreground text-center uppercase tracking-widest">
        Envíos a todo Chile. Despacho en 3-5 días hábiles.
      </p>
    </div>
  );
}
