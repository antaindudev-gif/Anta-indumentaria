import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// MOCK DATA: Esto luego vendrá de Drizzle ORM (ej. await db.query.aboutContent.findFirst())
const dbAboutContent = {
  manifestoHeading: "CREATIVE CONCEPT",
  manifestoText: "En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno. Nuestra identidad debe ser siempre expresada para construir un mensaje sólido y reconocible worldwide.",
  voiceHeading: "DISRUPTIVE FLUID",
  voiceText: "El tono de voz de la marca ANTA es audaz, disruptivo, directo y minimalista. Promoviendo siempre la individualidad y exclusividad de forma directa y con un lenguaje rebelde sin exceso de texto.",
  images: [null, null, null] // nulls for dynamic admin uploads
};

export default function AboutPage() {
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
            {dbAboutContent.images[0] ? (
              <Image src={dbAboutContent.images[0]!} alt="Concept 1" fill className="object-cover grayscale" />
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
              {dbAboutContent.manifestoHeading}
            </h2>
            <p className="font-sans text-sm text-foreground/70 uppercase tracking-[0.2em] leading-[2.5] max-w-xl">
              {dbAboutContent.manifestoText}
            </p>
          </div>
        </div>
      </section>

      {/* Concept Block 2 */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-32 relative z-10 border-t border-white/5">
        <div className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-32 items-center">
          <div className="flex-1 w-full relative aspect-[4/5] bg-[#111111] border border-white/5 flex items-center justify-center">
            {dbAboutContent.images[1] ? (
              <Image src={dbAboutContent.images[1]!} alt="Concept 2" fill className="object-cover grayscale" />
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
              {dbAboutContent.voiceHeading}
            </h2>
            <p className="font-sans text-sm text-foreground/70 uppercase tracking-[0.2em] leading-[2.5] max-w-xl">
              {dbAboutContent.voiceText}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
