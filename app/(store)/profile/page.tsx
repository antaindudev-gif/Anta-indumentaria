import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }

  // Fetch complete user profile from DB
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, session.user.id!)
  });

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen flex flex-col gap-12">
      <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white">Mi Perfil</h1>
      
      <div className="border border-white/10 bg-[#111111] p-8 flex flex-col gap-8">
        <div className="flex items-center gap-6 border-b border-white/5 pb-8">
          <img src={session.user.image || ''} alt={session.user.name || 'User'} className="w-16 h-16 rounded-full border border-white/10" />
          <div className="flex flex-col">
            <h2 className="font-mono text-white text-lg">{session.user.name}</h2>
            <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">{session.user.email}</p>
          </div>
        </div>

        <form action={async (formData) => {
          "use server";
          const { updateProfile } = await import("@/app/actions/profile");
          await updateProfile(formData);
        }} className="flex flex-col gap-8">
          <h3 className="font-mono text-accent text-xs uppercase tracking-widest">Datos de Envío Automático</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">RUT (Ej: 12.345.678-9)</label>
              <input 
                name="rut"
                type="text" 
                defaultValue={userProfile?.rut || ''}
                placeholder="RUT" 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Teléfono</label>
              <input 
                name="phone"
                type="tel" 
                defaultValue={(userProfile?.address as any)?.phone || ''}
                placeholder="+56 9 1234 5678" 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Calle y Número</label>
            <input 
              name="street"
              type="text" 
              defaultValue={(userProfile?.address as any)?.street || ''}
              placeholder="Ej: Av. Providencia 1234, Depto 405" 
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Comuna</label>
              <input 
                name="comuna"
                type="text" 
                defaultValue={(userProfile?.address as any)?.comuna || ''}
                placeholder="Ej: Providencia" 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Región</label>
              <input 
                name="region"
                type="text" 
                defaultValue={(userProfile?.address as any)?.region || ''}
                placeholder="Ej: Metropolitana" 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-white text-black px-8 py-4 font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent transition-colors">
              Guardar Datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
