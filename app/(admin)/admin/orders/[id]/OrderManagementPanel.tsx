"use client";

import { useState } from "react";
import Image from "next/image";
import { updateOrderStatus } from "@/app/actions/orders";

const STATUS_OPTIONS = [
  { value: "pending",    label: "⏳ Pendiente",    color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5" },
  { value: "paid",       label: "✅ Pago Verificado", color: "text-blue-400 border-blue-400/30 bg-blue-400/5" },
  { value: "processing", label: "⚙️ Procesando",   color: "text-purple-400 border-purple-400/30 bg-purple-400/5" },
  { value: "shipped",    label: "📦 Enviado",       color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5" },
  { value: "delivered",  label: "🏠 Entregado",     color: "text-green-400 border-green-400/30 bg-green-400/5" },
  { value: "cancelled",  label: "❌ Cancelado",     color: "text-red-400 border-red-400/30 bg-red-400/5" },
];

interface OrderManagementPanelProps {
  order: {
    id: string;
    guestEmail: string | null;
    status: string;
    paymentMethod: string;
    subtotal: string;
    shippingCost: string;
    total: string;
    notes: string | null;
    receiptUrl: string | null;
    trackingUrl: string | null;
    createdAt: Date;
    shippingAddress: any;
    user: { name: string | null; email: string } | null;
    items: {
      id: string;
      quantity: number;
      unitPrice: string;
      productSnapshot: any;
      product: { name: string; images: any } | null;
    }[];
  };
}

export function OrderManagementPanel({ order }: OrderManagementPanelProps) {
  const [status, setStatus] = useState(order.status);
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addr = order.shippingAddress as any;
  const clientName = order.user?.name || addr?.name || "Invitado";
  const clientEmail = order.user?.email || order.guestEmail || "-";

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status);

  async function handleSave() {
    setSaving(true);
    await updateOrderStatus(order.id, status, trackingUrl);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-white/10 p-4">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Cliente</div>
          <div className="font-display font-bold text-white text-sm uppercase">{clientName}</div>
          <div className="font-mono text-xs text-zinc-400 mt-1">{clientEmail}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 p-4">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Pago</div>
          <div className="font-display font-bold text-accent text-lg">${Number(order.total).toLocaleString("es-CL")}</div>
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{order.paymentMethod}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 p-4">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Fecha</div>
          <div className="font-display font-bold text-white text-sm uppercase">
            {new Date(order.createdAt).toLocaleDateString("es-CL")}
          </div>
          <div className="font-mono text-[10px] text-zinc-500 mt-1">
            {new Date(order.createdAt).toLocaleTimeString("es-CL")}
          </div>
        </div>
        <div className={`bg-[#0a0a0a] border p-4 ${currentStatus?.color || "border-white/10"}`}>
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Estado</div>
          <div className="font-display font-bold text-sm uppercase">{currentStatus?.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Order Details */}
        <div className="flex flex-col gap-6">
          {/* Items */}
          <div className="bg-[#0a0a0a] border border-white/10">
            <div className="px-5 py-3 border-b border-white/10 font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Productos
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => {
                const snap = item.productSnapshot as any;
                const imgs = item.product?.images as string[] || [];
                const img = imgs[0] || snap?.image || null;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    {img ? (
                      <div className="relative w-12 h-12 bg-[#111] shrink-0">
                        <Image src={img} alt={snap?.name || "Producto"} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-[#111] shrink-0 flex items-center justify-center text-zinc-600 text-xs">IMG</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-white text-sm uppercase truncate">{snap?.name || item.product?.name}</div>
                      <div className="font-mono text-xs text-zinc-500 uppercase">Talla: {snap?.size} · x{item.quantity}</div>
                    </div>
                    <div className="font-mono text-sm text-accent shrink-0">
                      ${(Number(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-white/10 flex justify-between font-mono text-xs text-zinc-400">
              <span>Envío</span>
              <span>${Number(order.shippingCost).toLocaleString("es-CL")}</span>
            </div>
            <div className="px-5 py-3 border-t border-white/10 flex justify-between font-display font-bold text-white">
              <span className="uppercase tracking-widest text-sm">Total</span>
              <span className="text-accent">${Number(order.total).toLocaleString("es-CL")}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#0a0a0a] border border-white/10">
            <div className="px-5 py-3 border-b border-white/10 font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Dirección de Envío
            </div>
            <div className="px-5 py-4 font-sans text-sm text-zinc-300 leading-loose uppercase tracking-wider">
              <p><span className="text-zinc-500">Nombre:</span> {addr?.name}</p>
              <p><span className="text-zinc-500">Teléfono:</span> {addr?.phone}</p>
              <p><span className="text-zinc-500">RUT:</span> {addr?.rut}</p>
              <p><span className="text-zinc-500">Región:</span> {addr?.region}</p>
              <p><span className="text-zinc-500">Ciudad:</span> {addr?.city}</p>
              <p><span className="text-zinc-500">Dirección:</span> {addr?.address}</p>
              {order.notes && <p><span className="text-zinc-500">Notas:</span> {order.notes}</p>}
            </div>
          </div>

          {/* Receipt */}
          {order.receiptUrl && (
            <div className="bg-[#0a0a0a] border border-white/10">
              <div className="px-5 py-3 border-b border-white/10 font-mono text-xs text-zinc-400 uppercase tracking-widest">
                Comprobante de Pago
              </div>
              <div className="p-4">
                <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video bg-[#111] overflow-hidden group">
                  <Image src={order.receiptUrl} alt="Comprobante" fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-mono text-xs text-white uppercase tracking-widest">
                    Ver Completo ↗
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Management Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0a0a0a] border border-white/10">
            <div className="px-5 py-3 border-b border-white/10 font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Cambiar Estado
            </div>
            <div className="p-5 flex flex-col gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`w-full text-left px-4 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${
                    status === opt.value ? opt.color : "border-white/10 text-zinc-600 hover:border-white/30 hover:text-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10">
            <div className="px-5 py-3 border-b border-white/10 font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Link de Seguimiento
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="font-sans text-xs text-zinc-500 uppercase tracking-widest leading-loose">
                Pega el link de seguimiento de Starken, Chilexpress o Bluexpress. El cliente podrá ver el estado de su envío.
              </p>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://tracking.starken.cl/..."
                className="w-full bg-[#111] border border-white/10 px-4 py-3 font-mono text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent transition-colors"
              />
              {trackingUrl && (
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-accent uppercase tracking-widest hover:underline">
                  Verificar link ↗
                </a>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 font-display font-bold uppercase tracking-widest text-sm transition-all ${
              saved
                ? "bg-green-500 text-black"
                : "bg-accent text-black hover:bg-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar Cambios"}
          </button>

          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest text-center">
            Los cambios se reflejan instantáneamente en el sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
