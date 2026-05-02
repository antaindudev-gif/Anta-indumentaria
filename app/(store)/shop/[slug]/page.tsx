import Link from 'next/link';
import { ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';

// MOCK DATA: Esto luego vendrá de Drizzle ORM (ej. await db.query.products.findFirst({ where: eq(products.slug, params.slug) }))
const dbProduct = {
  id: 1,
  title: 'DECAY HOODIE',
  price: 45000,
  slug: 'decay-hoodie',
  category: 'OUTERWEAR',
  description: 'Prenda diseñada con patrones destructivos y materiales de alta resistencia. Estética oscura pensada para la ciudad de asfalto y neón. Costuras expuestas y silueta oversize fluida.',
  sizes: ['S', 'M', 'L', 'XL'],
  images: [null, null], // Lista de imágenes (null = espacio dinámico)
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen relative bg-background overflow-hidden pt-24 pb-32">
      {/* Noise Overlay */}
      <div className="noise-bg mix-blend-screen"></div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10 flex flex-col">
        
        {/* Back Link */}
        <Link href="/shop" className="text-muted-foreground hover:text-accent transition-colors mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest w-fit">
          <ArrowLeft className="w-4 h-4" /> Volver al Shop
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Product Images (Gallery) */}
          <div className="flex-1 flex flex-col gap-4">
            {dbProduct.images.map((img, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] bg-[#111111] overflow-hidden border border-white/5 flex items-center justify-center">
                {img ? (
                  <Image src={img} alt={`${dbProduct.title} - Vista ${idx + 1}`} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-zinc-600">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                    <span className="font-mono text-xs uppercase tracking-widest text-center">
                      Imagen Dinámica {idx + 1}<br/>(Admin Panel)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col lg:sticky lg:top-24 h-fit">
            <div className="font-mono text-xs text-accent uppercase tracking-widest mb-4">
              {dbProduct.category} // 00{dbProduct.id}
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-foreground mb-6 leading-none">
              {dbProduct.title}
            </h1>
            <div className="font-mono text-2xl text-muted-foreground mb-12">
              ${dbProduct.price.toLocaleString('es-CL')}
            </div>

            <p className="font-sans text-sm text-foreground/70 uppercase tracking-[0.15em] leading-loose mb-12 max-w-md">
              {dbProduct.description}
            </p>

            {/* Size Selector */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Talla</span>
                <button className="font-mono text-[10px] text-accent uppercase tracking-widest underline underline-offset-4">Guía de Tallas</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {dbProduct.sizes.map((size) => (
                  <button key={size} className="border border-white/20 py-4 font-mono text-sm hover:border-accent hover:text-accent transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button className={buttonVariants({ 
              size: "lg", 
              className: "w-full bg-accent text-accent-foreground hover:bg-white text-sm py-8 rounded-none font-sans font-bold uppercase tracking-widest transition-all mb-6" 
            })}>
              Agregar al Carrito <ArrowRight className="ml-4 w-5 h-5" />
            </button>
            
            <p className="font-mono text-[10px] text-muted-foreground text-center uppercase tracking-widest">
              Envíos a todo Chile. Despacho en 3-5 días hábiles.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
