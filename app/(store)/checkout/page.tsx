'use client';

import { useCartStore } from '@/stores/cartStore';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, Banknote, Upload, Tag, X, Truck } from 'lucide-react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { createOrder } from '@/app/actions/orders';
import { validateCoupon } from '@/app/actions/coupons';
import { getShippingConfig } from '@/app/actions/settings';

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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Shipping config loaded from store_settings
  const [shippingConfig, setShippingConfig] = useState<{ shippingFlatRate: number; freeShippingThreshold: number }>({
    shippingFlatRate: 0,
    freeShippingThreshold: 0,
  });

  useEffect(() => {
    getShippingConfig().then(setShippingConfig).catch(() => {});
  }, []);

  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discountPercentage / 100)) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Compute shipping cost from config
  const shippingCost =
    shippingConfig.freeShippingThreshold > 0 && discountedSubtotal >= shippingConfig.freeShippingThreshold
      ? 0
      : shippingConfig.shippingFlatRate;

  const total = discountedSubtotal + shippingCost;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    const result = await validateCoupon(code);
    setIsValidatingCoupon(false);
    if (result.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
    } else if (result.success && result.discountPercentage) {
      setAppliedCoupon({ code, discountPercentage: result.discountPercentage });
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("items", JSON.stringify(items));
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("rut", rut);
      formData.append("region", region);
      formData.append("city", city);
      formData.append("address", address);
      formData.append("notes", notes);
      formData.append("paymentMethod", paymentMethod);
      if (appliedCoupon) {
        formData.append("couponCode", appliedCoupon.code);
      }

      if (paymentMethod === "transfer") {
        if (!receiptFile) {
          setErrorMsg("Debes adjuntar el comprobante de transferencia.");
          setIsSubmitting(false);
          return;
        }
        formData.append("receiptImage", receiptFile);
      }

      const response = await createOrder(formData);
      if (response?.success) {
        clearCart();
        // MercadoPago: redirect to payment gateway
        if (response.mpInitPoint) {
          window.location.href = response.mpInitPoint;
        } else {
          window.location.href = `/order-confirmation/${response.orderId}`;
        }
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al procesar la orden. Intenta de nuevo.';
      setErrorMsg(msg);
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
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
    <main className="min-h-screen relative pt-32 pb-24 px-6 md:px-12">
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

              {paymentMethod === 'transfer' && (
                <div className="mt-6 p-6 border border-accent/20 bg-accent/5 flex flex-col gap-4">
                  <div className="font-mono text-xs text-white uppercase tracking-widest mb-2 border-b border-accent/20 pb-2">Datos de Transferencia</div>
                  <div className="font-sans text-sm text-zinc-400 space-y-1">
                    <p><strong className="text-white">Banco:</strong> Banco Estado</p>
                    <p><strong className="text-white">Tipo de Cuenta:</strong> Cuenta RUT</p>
                    <p><strong className="text-white">Número:</strong> 19.456.789</p>
                    <p><strong className="text-white">RUT:</strong> 19.456.789-0</p>
                    <p><strong className="text-white">Correo:</strong> pagos@antaindumentaria.cl</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <label className="font-mono text-[10px] text-accent uppercase tracking-widest block mb-3">Adjuntar Comprobante *</label>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 p-6 bg-black hover:bg-white/5 transition-colors cursor-pointer text-sm text-zinc-500 hover:text-white">
                      <Upload className="w-4 h-4" />
                      {receiptFile ? receiptFile.name : 'Seleccionar Foto o PDF'}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        required={paymentMethod === 'transfer'}
                      />
                    </label>
                  </div>
                </div>
              )}
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
                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between font-mono text-sm text-green-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {appliedCoupon.code} ({appliedCoupon.discountPercentage}%)
                    </span>
                    <span>-${discountAmount.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>
                    {shippingConfig.shippingFlatRate === 0
                      ? <span className="text-green-400">Gratis</span>
                      : shippingCost === 0
                        ? <span className="text-green-400">Gratis ✓</span>
                        : `$${shippingCost.toLocaleString('es-CL')}`
                    }
                  </span>
                </div>
                {shippingConfig.freeShippingThreshold > 0 && shippingCost > 0 && (
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    <Truck className="w-3 h-3" />
                    Envío gratis sobre ${shippingConfig.freeShippingThreshold.toLocaleString('es-CL')}
                  </div>
                )}
                <div className="flex justify-between font-mono text-xl text-accent pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex flex-col gap-2 pt-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-green-500/30 bg-green-500/5 px-4 py-3">
                    <span className="font-mono text-xs text-green-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> {appliedCoupon.code} · {appliedCoupon.discountPercentage}% OFF
                    </span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-zinc-500 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="CÓDIGO DE DESCUENTO"
                      className="flex-1 bg-black border border-white/10 px-4 py-3 font-mono text-xs text-white placeholder:text-zinc-700 outline-none focus:border-accent transition-colors uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="px-4 py-3 bg-white/5 border border-white/10 hover:border-accent hover:text-accent font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest">{couponError}</p>
                )}
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

              {errorMsg && (
                <div className="border border-red-500/30 bg-red-500/5 p-4 text-red-400 font-mono text-xs uppercase tracking-widest leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-black hover:bg-white font-sans font-bold uppercase tracking-widest py-5 transition-all flex items-center justify-center gap-2 text-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
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
