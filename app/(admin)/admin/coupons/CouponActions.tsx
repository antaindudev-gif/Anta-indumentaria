"use client";

import { useTransition } from "react";
import { toggleCouponStatus, deleteCoupon } from "@/app/actions/coupons";
import { Loader2, Trash2, Power } from "lucide-react";

export function CouponActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 border-t border-white/10 pt-4 mt-auto">
      <button 
        onClick={() => startTransition(() => toggleCouponStatus(id, isActive))}
        disabled={isPending}
        className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-2 border flex items-center justify-center gap-2 transition-colors ${isActive ? 'text-white border-white/20 hover:bg-white/5' : 'text-accent border-accent/20 hover:bg-accent/10'}`}
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
        {isActive ? 'Desactivar' : 'Activar'}
      </button>

      <button 
        onClick={() => {
          if (confirm('¿Eliminar cupón?')) {
            startTransition(() => deleteCoupon(id));
          }
        }}
        disabled={isPending}
        className="px-4 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      </button>
    </div>
  );
}
