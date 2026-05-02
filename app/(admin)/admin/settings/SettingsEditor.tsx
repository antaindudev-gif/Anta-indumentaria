"use client";

import { useState } from "react";
import { updateStoreSettings } from "@/app/actions/settings";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";

export function SettingsEditor({ initialSettings }: { initialSettings: any }) {
  const [heroTitle, setHeroTitle] = useState(initialSettings.heroTitle);
  const [heroDescription, setHeroDescription] = useState(initialSettings.heroDescription);
  const [heroCtaText, setHeroCtaText] = useState(initialSettings.heroCtaText);
  const [manifestoTitle, setManifestoTitle] = useState(initialSettings.manifestoTitle);
  const [manifestoDescription, setManifestoDescription] = useState(initialSettings.manifestoDescription);
  
  const [heroPreview, setHeroPreview] = useState(initialSettings.heroImageUrl);
  const [gallery1Preview, setGallery1Preview] = useState(initialSettings.galleryImage1);
  const [gallery2Preview, setGallery2Preview] = useState(initialSettings.galleryImage2);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-6rem)] gap-8 overflow-hidden">
      
      {/* LEFT FORM PANE */}
      <div className="w-1/2 h-full overflow-y-auto pr-4 custom-scrollbar">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-8">Edición: Home</h1>
        
        <form 
          action={async (formData) => {
            setIsSubmitting(true);
            await updateStoreSettings(formData);
            setIsSubmitting(false);
          }} 
          className="flex flex-col gap-12 pb-24"
        >
          {/* HERO SECTION */}
          <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">1. Hero (Inicio)</h2>
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Principal</label>
              <textarea 
                name="heroTitle" 
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                rows={3} 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Descripción</label>
              <textarea 
                name="heroDescription" 
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={2} 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto del Botón</label>
              <input 
                name="heroCtaText" 
                value={heroCtaText}
                onChange={(e) => setHeroCtaText(e.target.value)}
                type="text"
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>

            <div className="flex flex-col gap-2 mt-4 border-t border-white/5 pt-6">
              <label className="font-mono text-[10px] text-accent uppercase tracking-widest">Fondo del Home (Sube imagen, se comprime a WEBP automáticamente)</label>
              <input 
                name="heroImageFile" 
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setHeroPreview)}
                className="bg-[#111111] border border-white/10 p-4 font-sans text-xs text-zinc-400 outline-none focus:border-accent transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black hover:file:bg-accent cursor-pointer" 
              />
            </div>
          </div>

          {/* MANIFESTO SECTION */}
          <div className="border border-white/10 bg-[#0a0a0a] p-8 flex flex-col gap-6">
            <h2 className="font-mono text-accent text-sm uppercase tracking-widest border-b border-white/10 pb-4">2. Manifiesto & Galería</h2>
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Título Manifiesto</label>
              <textarea 
                name="manifestoTitle" 
                value={manifestoTitle}
                onChange={(e) => setManifestoTitle(e.target.value)}
                rows={2} 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Texto del Manifiesto</label>
              <textarea 
                name="manifestoDescription" 
                value={manifestoDescription}
                onChange={(e) => setManifestoDescription(e.target.value)}
                rows={3} 
                className="bg-black border border-white/10 p-4 font-sans text-sm text-white outline-none focus:border-accent transition-colors" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-white/5 pt-6">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-accent uppercase tracking-widest">Galería 1</label>
                <input 
                  name="galleryImage1File" 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setGallery1Preview)}
                  className="bg-[#111111] border border-white/10 p-4 font-sans text-xs text-zinc-400 outline-none focus:border-accent file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black cursor-pointer" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-accent uppercase tracking-widest">Galería 2</label>
                <input 
                  name="galleryImage2File" 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setGallery2Preview)}
                  className="bg-[#111111] border border-white/10 p-4 font-sans text-xs text-zinc-400 outline-none focus:border-accent file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="bg-white text-black hover:bg-accent transition-colors font-mono font-bold text-sm uppercase tracking-widest px-10 py-5 shadow-2xl flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
            Guardar Cambios y Publicar
          </button>
        </form>
      </div>

      {/* RIGHT PREVIEW PANE */}
      <div className="w-1/2 h-full bg-[#050505] border border-white/5 overflow-y-auto relative custom-scrollbar">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-50 p-2 border-b border-white/10 flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Previsualización: Home</span>
        </div>
        
        {/* MINI HOME PREVIEW */}
        <div className="scale-[0.8] origin-top flex flex-col min-h-[150vh] relative bg-background overflow-hidden pointer-events-none">
          <div className="noise-bg mix-blend-screen absolute inset-0 z-0"></div>
          
          <section className="relative min-h-[90vh] flex flex-col justify-center px-12 pt-32 pb-24 z-10 w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center z-0 mix-blend-difference opacity-40">
              <h1 className="text-[32vw] font-display font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.1)] whitespace-nowrap tracking-tighter">
                ANTA
              </h1>
            </div>

            <div className="relative z-20 flex flex-col lg:flex-row gap-16 items-center justify-between mt-12 w-full">
              <div className="flex-1 max-w-2xl pb-4">
                <h2 className="text-5xl md:text-7xl font-display font-bold text-foreground uppercase tracking-tight mb-6 leading-[0.85] whitespace-pre-line">
                  {heroTitle || 'ROMPE LAS REGLAS.'}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground font-sans tracking-[0.2em] uppercase mb-10 max-w-lg leading-loose">
                  {heroDescription}
                </p>
                <div className="bg-accent text-black text-sm px-10 py-7 font-sans font-bold uppercase tracking-widest w-fit flex items-center">
                  {heroCtaText} <ArrowRight className="ml-4 w-5 h-5" />
                </div>
              </div>

              <div className="w-full lg:w-[450px] relative aspect-[3/4] bg-[#111111] group flex items-center justify-center border border-white/5 shadow-2xl">
                {heroPreview ? (
                  <Image src={heroPreview} alt="Hero" fill className="object-cover grayscale" />
                ) : (
                  <ImageIcon className="w-12 h-12 opacity-50 text-zinc-500" />
                )}
                <div className="absolute top-4 left-4 border-l border-t w-8 h-8 border-accent z-20 pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 border-r border-b w-8 h-8 border-accent z-20 pointer-events-none"></div>
              </div>
            </div>
          </section>

          <section className="py-32 px-12 bg-background relative z-10 border-t border-white/10">
            <div className="flex flex-col md:flex-row gap-24 items-center">
              <div className="flex-1 grid grid-cols-2 gap-4">
                {[gallery1Preview, gallery2Preview].map((url, idx) => (
                   <div key={idx} className="relative aspect-[3/4] bg-[#111111] overflow-hidden flex items-center justify-center border border-white/5">
                     {url ? (
                       <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover opacity-80" />
                     ) : (
                       <ImageIcon className="w-6 h-6 text-zinc-600" />
                     )}
                     <div className="absolute bottom-4 left-4 font-mono text-xs text-muted-foreground z-30">00{idx + 1}</div>
                   </div>
                ))}
              </div>
              <div className="flex-1">
                <h3 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wider mb-8 text-foreground leading-none whitespace-pre-line">
                  {manifestoTitle}
                </h3>
                <p className="font-sans text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em] leading-loose max-w-md mb-8">
                  {manifestoDescription}
                </p>
                <div className="text-accent uppercase tracking-widest text-xs font-bold flex items-center">
                  Brand Manifesto <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
