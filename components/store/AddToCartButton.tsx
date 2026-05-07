'use client';

import { useCartStore, CartItem } from '@/stores/cartStore';
import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { SizeGuide } from './SizeGuide';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
  variants: { id: string; size: string; stock: number; color: string | null }[];
}

export function AddToCartButton({ productId, name, price, image, slug, variants }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const addItem = useCartStore((s) => s.addItem);

  // Derive available colors and sizes
  const availableColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const hasColors = availableColors.length > 0;

  // Filter sizes based on selected color (if any)
  const availableSizesForColor = hasColors && selectedColor 
    ? variants.filter(v => v.color === selectedColor)
    : variants;

  // Derive unique sizes
  const uniqueSizes = Array.from(new Set(availableSizesForColor.map(v => v.size)));

  const handleAdd = () => {
    // If product has colors, a color must be selected
    if (hasColors && !selectedColor) return;
    if (!selectedSize) return;

    // Find the actual variant ID
    const matchedVariant = variants.find(v => 
      v.size === selectedSize && 
      (hasColors ? v.color === selectedColor : true)
    );

    if (!matchedVariant) return;

    setStatus('loading');

    addItem({
      productId,
      variantId: matchedVariant.id,
      name: hasColors ? `${name} - ${selectedColor}` : name,
      size: selectedSize,
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
      {/* Color selector */}
      {hasColors && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Color</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableColors.map((color) => {
              const isAvailable = variants.some(v => v.color === color && v.stock >= 0); // Assuming stock logic is fine or 0 allowed
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null); // Reset size when color changes
                  }}
                  className={`border py-4 font-mono text-sm uppercase transition-colors ${
                    selectedColor === color
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-white/20 hover:border-accent hover:text-accent'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {uniqueSizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Talla</span>
            <SizeGuide />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {uniqueSizes.map((size) => {
              // Check if this specific size is in stock for the selected color
              const specificVariant = variants.find(v => v.size === size && (hasColors ? v.color === selectedColor : true));
              const outOfStock = specificVariant ? specificVariant.stock === 0 : false;
              
              return (
                <button
                  key={size}
                  disabled={outOfStock || (hasColors && !selectedColor)}
                  onClick={() => setSelectedSize(size)}
                  className={`border py-4 font-mono text-sm uppercase transition-colors ${
                    hasColors && !selectedColor
                      ? 'border-white/5 text-zinc-700 cursor-not-allowed'
                      : outOfStock
                      ? 'border-white/5 text-zinc-700 cursor-not-allowed line-through'
                      : selectedSize === size
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-white/20 hover:border-accent hover:text-accent'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!selectedSize || (hasColors && !selectedColor) || status === 'loading'}
        className={`w-full text-sm py-8 font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
          (!selectedSize || (hasColors && !selectedColor))
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : status === 'success'
            ? 'bg-accent text-black'
            : 'bg-accent text-black hover:bg-white'
        }`}
      >
        {status === 'loading' && <Loader2 className="animate-spin w-5 h-5" />}
        {status === 'success' && <Check className="w-5 h-5" />}
        {status === 'idle' && hasColors && !selectedColor && 'Selecciona un color'}
        {status === 'idle' && (!hasColors || selectedColor) && !selectedSize && 'Selecciona una talla'}
        {status === 'idle' && selectedSize && (hasColors ? selectedColor : true) && 'Agregar al Carrito'}
        {status === 'loading' && 'Agregando...'}
        {status === 'success' && '¡Agregado!'}
      </button>

      <p className="font-mono text-[10px] text-muted-foreground text-center uppercase tracking-widest">
        Envíos a todo Chile. Despacho en 3-5 días hábiles.
      </p>
    </div>
  );
}
