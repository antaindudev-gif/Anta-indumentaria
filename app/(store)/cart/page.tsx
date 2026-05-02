import Link from 'next/link';

export default function CartPage() {
  return (
    <main className="min-h-screen relative bg-background pt-32 pb-24 px-6 md:px-12">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-16">Tu Carrito</h1>
        
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1 border border-white/10 bg-[#111111] p-8 flex items-center justify-center min-h-[300px]">
            <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground text-center">
              Tu carrito está vacío.<br/><br/>
              <Link href="/shop" className="text-accent hover:text-white underline underline-offset-4">Ver Colección</Link>
            </p>
          </div>
          <div className="w-full lg:w-[400px] border border-white/10 bg-[#111111] p-8 h-fit">
            <h3 className="font-display font-bold text-2xl uppercase tracking-wider mb-8">Resumen</h3>
            <div className="flex justify-between mb-4 font-mono text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>$0</span>
            </div>
            <div className="flex justify-between mb-8 font-mono text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>Por calcular</span>
            </div>
            <div className="flex justify-between mb-8 font-mono text-lg text-accent">
              <span>Total</span>
              <span>$0</span>
            </div>
            <button className="w-full bg-white/10 text-white/30 cursor-not-allowed font-sans font-bold uppercase tracking-widest py-4">
              Ir al Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
