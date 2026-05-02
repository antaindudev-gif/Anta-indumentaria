import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// MOCK DATA: Esto luego vendrá de Drizzle ORM (ej. await db.query.products.findMany({ where: eq(products.status, 'active') }))
const dbProducts = [
  { id: 1, title: 'DECAY HOODIE', price: 45000, slug: 'decay-hoodie', image: null, category: 'OUTERWEAR' },
  { id: 2, title: 'VOID T-SHIRT', price: 25000, slug: 'void-tshirt', image: null, category: 'TOPS' },
  { id: 3, title: 'ABYSS CARGO', price: 55000, slug: 'abyss-cargo', image: null, category: 'BOTTOMS' },
  { id: 4, title: 'NOISE LONGSLEEVE', price: 32000, slug: 'noise-longsleeve', image: null, category: 'TOPS' },
  { id: 5, title: 'SYNTHETIC VEST', price: 48000, slug: 'synthetic-vest', image: null, category: 'OUTERWEAR' },
  { id: 6, title: 'FLUID CAP', price: 18000, slug: 'fluid-cap', image: null, category: 'ACCESSORIES' },
];

export default function ShopPage() {
  return (
    <main className="min-h-screen relative bg-background overflow-hidden pt-24 pb-32">
      {/* Noise Overlay */}
      <div className="noise-bg mix-blend-screen"></div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-white/10 pb-8 mt-12">
          <div>
            <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter text-foreground leading-none">
              Shop<br/>
              <span className="text-accent">Collection</span>
            </h1>
          </div>
          <div className="flex gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <button className="hover:text-accent transition-colors text-white">All</button>
            <button className="hover:text-accent transition-colors">Tops</button>
            <button className="hover:text-accent transition-colors">Bottoms</button>
            <button className="hover:text-accent transition-colors">Outerwear</button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {dbProducts.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} className="group cursor-pointer flex flex-col">
              
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-[#111111] overflow-hidden mb-6 border border-white/5 flex items-center justify-center">
                {product.image ? (
                  <Image 
                    src={product.image} 
                    alt={product.title} 
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-zinc-600">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-center">
                      Dinámico<br/>Admin Panel
                    </span>
                  </div>
                )}
                
                {/* Overlay Hover Effect */}
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-500 z-10 mix-blend-overlay" />
                <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground z-20">
                  {product.category}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <h3 className="font-display font-bold text-lg md:text-xl uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">
                    {product.title}
                  </h3>
                </div>
                <div className="font-mono text-sm tracking-wider text-muted-foreground">
                  ${product.price.toLocaleString('es-CL')}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
      </div>
    </main>
  );
}
