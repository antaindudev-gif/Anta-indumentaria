import { Suspense } from "react";
import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const productsCount = await db.query.products.findMany().then(res => res.length);
  const usersCount = await db.query.users.findMany().then(res => res.length);

  return (
    <div className="flex flex-col gap-12 max-w-4xl">
      <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white">Panel General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Total Productos</h2>
          <p className="font-display text-4xl text-white">{productsCount}</p>
        </div>
        
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Total Usuarios</h2>
          <p className="font-display text-4xl text-white">{usersCount}</p>
        </div>
        
        <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-4">
          <h2 className="font-mono text-muted-foreground text-xs uppercase tracking-widest">Órdenes Pendientes</h2>
          <p className="font-display text-4xl text-accent">0</p>
        </div>
      </div>
    </div>
  );
}
