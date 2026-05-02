import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';

import { db } from '@/lib/db';

export const dynamic = "force-dynamic";

export default async function Home() {
  const settingsArray = await db.query.storeSettings.findMany();
  const settings = settingsArray[0] || {
    heroTitle: "Rompe las reglas.\nHaz tu propio\ncamino.",
    heroDescription: "Estética vanguardista y disruptiva. Calidad sin límites. Vestuario urbano independiente para un mundo onírico.",
    heroCtaText: "Ver Colección",
    heroCtaLink: "/shop",
    heroImageUrl: null,
    manifestoTitle: "Disruptive\nFluid",
    manifestoDescription: "En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno.",
    galleryImage1: null,
    galleryImage2: null,
  };

  const dbConceptImages = [
    { id: 1, url: settings.galleryImage1 },
    { id: 2, url: settings.galleryImage2 },
  ];

  return (
    <main className="flex flex-col min-h-screen relative bg-background overflow-hidden">
      {/* Noise Overlay */}
      <div className="noise-bg mix-blend-screen"></div>
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-12 pt-32 pb-24 z-10 w-full max-w-screen-2xl mx-auto">
        
        {/* Massive Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center z-0 pointer-events-none select-none mix-blend-difference opacity-40">
          <h1 className="text-[32vw] font-display font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.1)] whitespace-nowrap tracking-tighter">
            ANTA
          </h1>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col lg:flex-row gap-16 items-center justify-between mt-12 w-full">
          
          <div className="flex-1 max-w-2xl pb-4">
            <h2 className="text-5xl md:text-7xl font-display font-bold text-foreground uppercase tracking-tight mb-6 leading-[0.85] whitespace-pre-line">
              {settings.heroTitle}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-sans tracking-[0.2em] uppercase mb-10 max-w-lg leading-loose">
              {settings.heroDescription}
            </p>
            <Link 
              href={settings.heroCtaLink}
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-accent text-black hover:bg-white text-sm px-10 py-7 rounded-none font-sans font-bold uppercase tracking-widest transition-all w-fit mt-4" 
              })}
            >
              {settings.heroCtaText} <ArrowRight className="ml-4 w-5 h-5" />
            </Link>
          </div>

          <div className="w-full lg:w-[450px] relative aspect-[3/4] bg-[#111111] group flex items-center justify-center border border-white/5 shadow-2xl">
            {settings.heroImageUrl ? (
              <Image 
                src={settings.heroImageUrl} 
                alt="Anta Hero" 
                fill
                className="object-cover grayscale"
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-500 gap-4">
                <ImageIcon className="w-12 h-12 opacity-50" />
                <span className="font-mono text-xs uppercase tracking-widest text-center">
                  Espacio Dinámico<br/>(Añadir imagen en Admin)
                </span>
              </div>
            )}
            
            {/* Disruptive Borders */}
            <div className="absolute inset-0 border border-white/20 z-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-4 left-4 border-l border-t w-8 h-8 border-accent z-20 pointer-events-none"></div>
            <div className="absolute bottom-4 right-4 border-r border-b w-8 h-8 border-accent z-20 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Brand Manifesto Section */}
      <section className="py-32 px-6 md:px-12 bg-background relative z-10 border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center">
          <div className="flex-1 grid grid-cols-2 gap-4">
            {dbConceptImages.map((item, idx) => (
               <div key={item.id} className="relative aspect-[3/4] bg-[#111111] overflow-hidden group flex items-center justify-center border border-white/5">
                 {item.url ? (
                   <Image src={item.url} alt="Concept" fill className="object-cover opacity-80" />
                 ) : (
                   <div className="flex flex-col items-center gap-2 text-zinc-600">
                     <ImageIcon className="w-6 h-6" />
                     <span className="font-mono text-[10px] uppercase">Img {idx + 1}</span>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors z-10 mix-blend-overlay" />
                 <div className="absolute bottom-4 left-4 font-mono text-xs text-muted-foreground z-30">00{item.id}</div>
               </div>
            ))}
          </div>
          <div className="flex-1">
            <h3 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wider mb-8 text-foreground leading-none whitespace-pre-line">
              {settings.manifestoTitle}
            </h3>
            <p className="font-sans text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em] leading-loose max-w-md mb-8">
              {settings.manifestoDescription}
            </p>
            <Link href="/about" className="text-accent hover:text-white transition-colors uppercase tracking-widest text-xs font-bold flex items-center group">
              Brand Manifesto <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
