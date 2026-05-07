import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settingsArray = await db.query.storeSettings.findMany();
  const s = settingsArray[0] || {};
  
  const content = {
    manifestoHeading: (s as any).conceptHeading1 || "CREATIVE CONCEPT",
    manifestoText: (s as any).conceptText1 || "En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno.",
    voiceHeading: (s as any).conceptHeading2 || "DISRUPTIVE FLUID",
    voiceText: (s as any).conceptText2 || "El tono de voz de la marca ANTA es audaz, disruptivo, directo y minimalista. Promoviendo siempre la individualidad y exclusividad de forma directa y con un lenguaje rebelde sin exceso de texto.",
    images: [(s as any).conceptImage1 || null, (s as any).conceptImage2 || null, null]
  };

  return (
    <main className="min-h-screen relative bg-background overflow-hidden pt-24 pb-0">
      {/* Noise Overlay */}
      <div className="noise-bg mix-blend-screen"></div>

      {/* Hero Statement */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center relative z-10 px-6 text-center border-b border-white/10">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.3em] mb-12">
          BRAND MANIFESTO / 2025
        </div>
        <h1 className="text-4xl md:text-7xl lg:text-9xl font-display font-bold uppercase tracking-tighter text-foreground leading-[0.85] max-w-[90vw]">
          CALIDAD SIN LÍMITES.<br/>
          <span className="text-muted-foreground">ROMPE LAS REGLAS.</span>
        </h1>
      </section>

      {/* Concept Block 1 */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-center">
          <div className="flex-1 w-full relative aspect-[3/4] bg-[#111111] border border-white/5 flex items-center justify-center">
            {content.images[0] ? (
              <Image src={content.images[0]!} alt="Concept 1" fill className="object-cover grayscale" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-zinc-600">
                <ImageIcon className="w-12 h-12 opacity-50" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-center">
                  Imagen Creativa 1<br/>(Admin Panel)
                </span>
              </div>
            )}
            <div className="absolute -left-4 -bottom-4 border-l border-b w-16 h-16 border-accent z-20 pointer-events-none"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-foreground mb-8">
              {content.manifestoHeading}
            </h2>
            <p className="font-sans text-sm text-foreground/70 uppercase tracking-[0.2em] leading-[2.5] max-w-xl">
              {content.manifestoText}
            </p>
          </div>
        </div>
      </section>

      {/* Concept Block 2 */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-32 relative z-10 border-t border-white/5">
        <div className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-32 items-center">
          <div className="flex-1 w-full relative aspect-[4/5] bg-[#111111] border border-white/5 flex items-center justify-center">
            {content.images[1] ? (
              <Image src={content.images[1]!} alt="Concept 2" fill className="object-cover grayscale" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-zinc-600">
                <ImageIcon className="w-12 h-12 opacity-50" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-center">
                  Imagen Creativa 2<br/>(Admin Panel)
                </span>
              </div>
            )}
            <div className="absolute top-4 right-4 font-mono text-[10px] text-accent uppercase tracking-widest z-20">02</div>
          </div>
          <div className="flex-1">
            <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-foreground mb-8">
              {content.voiceHeading}
            </h2>
            <p className="font-sans text-sm text-foreground/70 uppercase tracking-[0.2em] leading-[2.5] max-w-xl">
              {content.voiceText}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
