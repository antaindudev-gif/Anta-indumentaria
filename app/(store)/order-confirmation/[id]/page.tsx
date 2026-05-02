import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-lg text-center relative z-10 flex flex-col items-center gap-8">
        <CheckCircle className="w-16 h-16 text-accent" />
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest">¡Orden Creada!</h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
          Tu número de orden es:
        </p>
        <p className="font-mono text-lg text-accent border border-accent/30 px-6 py-3 bg-accent/5">
          #{id.split('-')[0]}
        </p>
        <p className="font-sans text-sm text-foreground/60 uppercase tracking-[0.15em] leading-loose max-w-md">
          Recibirás un email con los detalles de tu pedido. Si elegiste transferencia, 
          te enviaremos los datos bancarios por correo.
        </p>
        <div className="flex gap-6 mt-8">
          <Link href="/shop" className="border border-white/20 px-8 py-4 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors">
            Seguir Comprando
          </Link>
          <Link href="/" className="bg-accent text-black px-8 py-4 font-mono text-xs uppercase tracking-widest hover:bg-white transition-colors font-bold">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
