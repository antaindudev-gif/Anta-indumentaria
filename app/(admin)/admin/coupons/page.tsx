import { db } from "@/lib/db";
import { Plus, Tag } from "lucide-react";
import { createCoupon } from "@/app/actions/coupons";
import { CouponActions } from "./CouponActions";

export default async function CouponsPage() {
  const allCoupons = await db.query.coupons.findMany({
    orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
  });

  return (
    <div className="w-full flex">
      {/* LEFT: List of Coupons */}
      <div className="flex-1 flex flex-col p-12">
        <div className="mb-12">
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2">Cupones</h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Gestiona los descuentos de la tienda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allCoupons.map((coupon) => (
            <div key={coupon.id} className={`p-6 border ${coupon.isActive ? 'border-accent/50 bg-[#111]' : 'border-white/5 bg-[#050505] opacity-50'} relative group transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <Tag className="w-4 h-4 text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest bg-white text-black px-2 py-1 font-bold">
                  {coupon.discountPercentage}% OFF
                </span>
              </div>
              <h3 className="font-mono text-xl font-bold tracking-widest mb-1">{coupon.code}</h3>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-6">
                Creado: {new Date(coupon.createdAt).toLocaleDateString()}
              </p>

              <CouponActions id={coupon.id} isActive={coupon.isActive} />
            </div>
          ))}

          {allCoupons.length === 0 && (
            <div className="col-span-full border border-dashed border-white/20 p-12 flex flex-col items-center justify-center text-zinc-500 gap-4">
              <Tag className="w-8 h-8 opacity-50" />
              <p className="font-mono text-xs uppercase tracking-widest text-center">No hay cupones activos</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Create Coupon */}
      <div className="w-1/3 bg-[#0a0a0a] border-l border-white/5 p-12 h-screen sticky top-0 flex flex-col justify-center">
        <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Crear Cupón</h2>
        
        <form action={createCoupon} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Código</label>
            <input 
              type="text" 
              name="code" 
              placeholder="Ej: VERANO20" 
              className="bg-black border border-white/10 p-4 font-mono text-sm text-white outline-none focus:border-accent transition-colors uppercase" 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descuento (%)</label>
            <input 
              type="number" 
              name="discountPercentage" 
              placeholder="20" 
              min="1" 
              max="100" 
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              required 
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input type="checkbox" name="isActive" defaultChecked className="w-4 h-4 accent-accent bg-black border-white/10" />
            <span className="font-mono text-[10px] text-white uppercase tracking-widest">Activo al crear</span>
          </label>

          <button type="submit" className="mt-8 bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-sm uppercase tracking-widest p-4 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Crear Cupón
          </button>
        </form>
      </div>
    </div>
  );
}
