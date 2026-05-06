import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

import { ShopFilters } from '@/components/store/ShopFilters';

export const dynamic = "force-dynamic";

export default async function ShopPage(props: { searchParams: Promise<{ sort?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'newest';
  const category = searchParams.category || 'all';

  let allProducts = await db.query.products.findMany({
    where: eq(products.status, 'active'),
    with: { variants: true },
  });

  // Filter by category
  if (category !== 'all') {
    allProducts = allProducts.filter(p => p.category === category);
  }

  // Sort
  allProducts.sort((a, b) => {
    switch (sort) {
      case 'price-asc': return Number(a.price) - Number(b.price);
      case 'price-desc': return Number(b.price) - Number(a.price);
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'newest': 
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

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
          
          <ShopFilters />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {allProducts.length === 0 ? (
            <div className="col-span-3 text-center py-24">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">No hay productos disponibles aún.</p>
            </div>
          ) : (
            allProducts.map((product) => {
              const imgs = product.images as string[];
              const mainImage = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null;

              return (
                <Link key={product.id} href={`/shop/${product.slug}`} className="group cursor-pointer flex flex-col">
                  
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] bg-[#111111] overflow-hidden mb-6 border border-white/5 flex items-center justify-center">
                    {mainImage ? (
                      <Image 
                        src={mainImage} 
                        alt={product.name} 
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-zinc-600">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-center">
                          Sin imagen
                        </span>
                      </div>
                    )}
                    
                    {/* Overlay Hover Effect */}
                    <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-500 z-10 mix-blend-overlay" />
                    <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground z-20">
                      {product.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="font-display font-bold text-lg md:text-xl uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <div className="font-mono text-sm tracking-wider text-muted-foreground">
                      ${Number(product.price).toLocaleString('es-CL')}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        
      </div>
    </main>
  );
}
