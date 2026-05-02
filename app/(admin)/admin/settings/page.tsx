import { db } from "@/lib/db";
import { updateStoreSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settingsArray = await db.query.storeSettings.findMany();
  const settings = settingsArray[0] || {
    heroTitle: "Rompe las reglas.\nHaz tu propio\ncamino.",
    heroDescription: "Estética vanguardista y disruptiva. Calidad sin límites. Vestuario urbano independiente para un mundo onírico.",
    heroCtaText: "Ver Colección",
    heroImageUrl: "",
    manifestoTitle: "Disruptive\nFluid",
    manifestoDescription: "En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno.",
    galleryImage1: "",
    galleryImage2: "",
  };

  return (
    <div className="flex flex-col gap-12 max-w-4xl pb-24">
      <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">Configuración del Home</h1>
      
      <form action={updateStoreSettings} className="flex flex-col gap-12">
        {/* HERO SECTION */}
        <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
          <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">Sección Principal (Hero)</h2>
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Principal (Soporta saltos de línea)</label>
            <textarea 
              name="heroTitle" 
              defaultValue={settings.heroTitle} 
              rows={3} 
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descripción</label>
            <textarea 
              name="heroDescription" 
              defaultValue={settings.heroDescription} 
              rows={2} 
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto del Botón</label>
            <input 
              name="heroCtaText" 
              defaultValue={settings.heroCtaText} 
              type="text"
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-2 mt-4 border-t border-white/5 pt-6">
            <label className="font-mono text-[10px] text-accent uppercase tracking-widest">URL de Imagen Hero (Desde Cloudflare R2)</label>
            <input 
              name="heroImageUrl" 
              defaultValue={settings.heroImageUrl || ''} 
              type="text"
              placeholder="https://pub-xxxxxx.r2.dev/foto.jpg"
              className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-zinc-400 outline-none focus:border-accent transition-colors" 
            />
            <p className="text-[10px] text-zinc-600 font-mono mt-1">Más adelante conectaremos el botón de subir, por ahora pega el link de R2 aquí.</p>
          </div>
        </div>

        {/* MANIFESTO SECTION */}
        <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
          <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">Sección Manifiesto & Galería</h2>
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Manifiesto</label>
            <textarea 
              name="manifestoTitle" 
              defaultValue={settings.manifestoTitle} 
              rows={2} 
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto del Manifiesto</label>
            <textarea 
              name="manifestoDescription" 
              defaultValue={settings.manifestoDescription} 
              rows={3} 
              className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-white/5 pt-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-accent uppercase tracking-widest">URL Galería 1</label>
              <input 
                name="galleryImage1" 
                defaultValue={settings.galleryImage1 || ''} 
                type="text"
                placeholder="https://..."
                className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-zinc-400 outline-none focus:border-accent transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-accent uppercase tracking-widest">URL Galería 2</label>
              <input 
                name="galleryImage2" 
                defaultValue={settings.galleryImage2 || ''} 
                type="text"
                placeholder="https://..."
                className="bg-[#111111] border border-white/10 p-4 font-sans text-sm text-zinc-400 outline-none focus:border-accent transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end sticky bottom-8">
          <button type="submit" className="bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-sm uppercase tracking-widest px-10 py-5 shadow-2xl">
            Guardar Cambios y Publicar
          </button>
        </div>
      </form>
    </div>
  );
}
