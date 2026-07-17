'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { Minus, Plus, Trash2, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <main className="min-h-screen relative pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-16">Tu Carrito</h1>
        
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart Items */}
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="border border-white/10 bg-[#111111] p-12 flex items-center justify-center min-h-[300px]">
                <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground text-center">
                  Tu carrito está vacío.<br/><br/>
                  <Link href="/shop" className="text-accent hover:text-white underline underline-offset-4">Ver Colección</Link>
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-6 py-8 first:pt-0">
                    {/* Image */}
                    <div className="w-24 h-32 md:w-32 md:h-40 bg-[#111111] border border-white/5 relative flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/shop/${item.slug}`} className="font-display font-bold text-lg uppercase tracking-widest text-foreground hover:text-accent transition-colors">
                          {item.name}
                        </Link>
                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">Talla: {item.size}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)} 
                            className="p-3 hover:bg-white/5 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)} 
                            className="p-3 hover:bg-white/5 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-6">
                          <span className="font-mono text-sm text-accent">
                            ${(item.price * item.quantity).toLocaleString('es-CL')}
                          </span>
                          <button 
                            onClick={() => removeItem(item.variantId)} 
                            className="text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] border border-white/10 bg-[#0a0a0a] p-8 h-fit lg:sticky lg:top-24">
            <h3 className="font-display font-bold text-2xl uppercase tracking-wider mb-8">Resumen</h3>
            <div className="flex justify-between mb-4 font-mono text-sm">
              <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between mb-8 font-mono text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>Por calcular</span>
            </div>
            <div className="border-t border-white/10 pt-6 flex justify-between mb-8 font-mono text-lg text-accent">
              <span>Total</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            
            {items.length > 0 ? (
              <Link 
                href="/checkout" 
                className="w-full bg-accent text-black hover:bg-white font-sans font-bold uppercase tracking-widest py-5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                Ir al Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button disabled className="w-full bg-white/10 text-white/30 cursor-not-allowed font-sans font-bold uppercase tracking-widest py-5 text-sm">
                Ir al Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
