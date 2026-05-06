'use client';

import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, Banknote } from 'lucide-react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rut, setRut] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer'>('mercadopago');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost: number = 0; // Por definir
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsSubmitting(true);

    // TODO: Conectar con MercadoPago API cuando los tokens estén listos
    // Por ahora, simular el flujo
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.price,
            name: i.name,
            size: i.size,
            image: i.image,
          })),
          customer: { name, email, phone, rut },
          shippingAddress: { region, city, address },
          notes,
          paymentMethod,
          subtotal,
          shippingCost,
          total,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        if (paymentMethod === 'mercadopago' && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          window.location.href = `/order-confirmation/${data.orderId}`;
        }
      } else {
        alert('Error al crear la orden. Intenta de nuevo.');
      }
    } catch {
      alert('Error de conexión. Intenta de nuevo.');
    }

    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold uppercase tracking-widest mb-8">Carrito Vacío</h1>
          <Link href="/shop" className="text-accent hover:text-white font-mono text-xs uppercase tracking-widest underline underline-offset-4">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-background pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <Link href="/cart" className="text-muted-foreground hover:text-white transition-colors mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest w-fit">
          <ArrowLeft className="w-4 h-4" /> Volver al Carrito
        </Link>
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-16">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-16">
          {/* Left: Form */}
          <div className="flex-1 flex flex-col gap-12">
            
            {/* Customer Info */}
            <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
              <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">1. Datos Personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nombre Completo *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Teléfono *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+56 9 XXXX XXXX" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">RUT</label>
                  <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
              <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">2. Dirección de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Región *</label>
                  <input value={region} onChange={(e) => setRegion(e.target.value)} required placeholder="Ej: Metropolitana" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Ciudad *</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} required className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Dirección Completa *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Calle, número, depto/oficina" className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Notas de Envío (Opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Ej: Portería, timbre 3B..." className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
              <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">3. Método de Pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`border p-6 flex flex-col items-center gap-3 transition-colors ${
                    paymentMethod === 'mercadopago' ? 'border-accent bg-accent/5 text-accent' : 'border-white/10 text-zinc-500 hover:border-white/30'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="font-mono text-xs uppercase tracking-widest">MercadoPago</span>
                  <span className="text-[10px] text-zinc-500">Tarjeta débito/crédito</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`border p-6 flex flex-col items-center gap-3 transition-colors ${
                    paymentMethod === 'transfer' ? 'border-accent bg-accent/5 text-accent' : 'border-white/10 text-zinc-500 hover:border-white/30'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="font-mono text-xs uppercase tracking-widest">Transferencia</span>
                  <span className="text-[10px] text-zinc-500">Banco nacional</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[400px] h-fit lg:sticky lg:top-24">
            <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
              <h3 className="font-display font-bold text-2xl uppercase tracking-wider">Tu Orden</h3>
              
              <div className="flex flex-col divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 py-4 first:pt-0">
                    <div className="w-16 h-20 bg-[#111111] border border-white/5 relative flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-zinc-600" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-xs uppercase tracking-widest text-white">{item.name}</p>
                      <p className="font-mono text-[10px] text-zinc-500 mt-1">Talla {item.size} × {item.quantity}</p>
                    </div>
                    <span className="font-mono text-xs text-accent">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{shippingCost === 0 ? 'Por confirmar' : `$${shippingCost.toLocaleString('es-CL')}`}</span>
                </div>
                <div className="flex justify-between font-mono text-xl text-accent pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required 
                  className="mt-1 accent-accent bg-black border-white/10"
                />
                <label htmlFor="terms" className="font-sans text-[10px] text-zinc-500 leading-relaxed">
                  He leído y acepto los <Link href="/terms" target="_blank" className="text-white underline">Términos y Condiciones</Link> y las <Link href="/privacy" target="_blank" className="text-white underline">Políticas de Privacidad</Link>. Entiendo las condiciones de envío y mi derecho a retracto.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-black hover:bg-white font-sans font-bold uppercase tracking-widest py-5 transition-all flex items-center justify-center gap-2 text-sm mt-4"
              >
                {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                {paymentMethod === 'mercadopago' ? 'Pagar con MercadoPago' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
