import Link from 'next/link';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status } = await searchParams;

  // Try to load the order for richer context; fail gracefully if not found
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) }).catch(() => null);

  // Determine display state:
  // 1. MP failure → payment failed
  // 2. order.status === "paid" → payment approved (webhook confirmed)
  // 3. order.paymentMethod === "mercadopago" → waiting for MP webhook
  // 4. order.status === "pending" → transfer pending manual approval
  type DisplayState = 'approved' | 'pending_mp' | 'transfer_pending' | 'failed';

  let displayState: DisplayState;
  if (status === 'failure') {
    displayState = 'failed';
  } else if (order?.status === 'paid') {
    // Webhook already confirmed payment
    displayState = 'approved';
  } else if (order?.paymentMethod === 'mercadopago') {
    // MercadoPago order waiting for webhook
    displayState = 'pending_mp';
  } else {
    // Transfer order waiting for manual approval
    displayState = 'transfer_pending';
  }

  const configs: Record<DisplayState, {
    icon: React.ReactNode;
    title: string;
    message: string;
    accentColor: string;
  }> = {
    approved: {
      icon: <CheckCircle className="w-16 h-16 text-accent" />,
      title: '¡Pago Aprobado!',
      message: 'Tu pago fue confirmado. Estamos preparando tu pedido y te notificaremos cuando sea despachado.',
      accentColor: 'text-accent border-accent/30 bg-accent/5',
    },
    pending_mp: {
      icon: <Clock className="w-16 h-16 text-yellow-400" />,
      title: 'Pago Pendiente',
      message: 'Tu pago está siendo procesado por MercadoPago. Te enviaremos un email cuando sea confirmado.',
      accentColor: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
    },
    transfer_pending: {
      icon: <Clock className="w-16 h-16 text-accent" />,
      title: '¡Orden Recibida!',
      message: 'Recibimos tu comprobante de transferencia. Nuestro equipo lo verificará y te avisaremos por email en cuanto sea aprobado.',
      accentColor: 'text-accent border-accent/30 bg-accent/5',
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-red-400" />,
      title: 'Pago No Completado',
      message: 'Tu pago no pudo completarse. No se realizó ningún cargo. Puedes intentarlo nuevamente o elegir transferencia bancaria.',
      accentColor: 'text-red-400 border-red-400/30 bg-red-400/5',
    },
  };

  const config = configs[displayState];

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="noise-bg mix-blend-screen"></div>
      <div className="max-w-lg text-center relative z-10 flex flex-col items-center gap-8">
        {config.icon}

        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest">
          {config.title}
        </h1>

        <p className={`font-mono text-sm uppercase tracking-widest border px-6 py-3 ${config.accentColor}`}>
          Orden #{id.split('-')[0]}
        </p>

        <p className="font-sans text-sm text-foreground/60 uppercase tracking-[0.15em] leading-loose max-w-md">
          {config.message}
        </p>

        {displayState === 'failed' ? (
          <div className="flex gap-6 mt-8">
            <Link
              href="/checkout"
              className="bg-accent text-black px-8 py-4 font-mono text-xs uppercase tracking-widest hover:bg-white transition-colors font-bold"
            >
              Reintentar Pago
            </Link>
            <Link
              href="/shop"
              className="border border-white/20 px-8 py-4 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              Ver Productos
            </Link>
          </div>
        ) : (
          <div className="flex gap-6 mt-8">
            <Link
              href="/shop"
              className="border border-white/20 px-8 py-4 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              Seguir Comprando
            </Link>
            <Link
              href="/"
              className="bg-accent text-black px-8 py-4 font-mono text-xs uppercase tracking-widest hover:bg-white transition-colors font-bold"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
