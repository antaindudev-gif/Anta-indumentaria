import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/store/AddToCartButton';

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { variants: true },
  });

  if (!product) notFound();

  const imgs = product.images as string[];
  const productImages = Array.isArray(imgs) && imgs.length > 0 ? imgs : [null];
  const mainImage = productImages[0] || null;

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
            {productImages.map((img, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] bg-[#111111] overflow-hidden border border-white/5 flex items-center justify-center">
                {img ? (
                  <Image src={img} alt={`${product.name} - Vista ${idx + 1}`} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-zinc-600">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                    <span className="font-mono text-xs uppercase tracking-widest text-center">
                      Sin imagen
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col lg:sticky lg:top-24 h-fit">
            <div className="font-mono text-xs text-accent uppercase tracking-widest mb-4">
              {product.category.toUpperCase()}
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-foreground mb-6 leading-none">
              {product.name}
            </h1>
            <div className="font-mono text-2xl text-muted-foreground mb-12 flex items-center gap-4">
              ${Number(product.price).toLocaleString('es-CL')}
              {product.compareAtPrice && (
                <span className="text-base line-through text-zinc-600">${Number(product.compareAtPrice).toLocaleString('es-CL')}</span>
              )}
            </div>

            {product.description && (
              <p className="font-sans text-sm text-foreground/70 uppercase tracking-[0.15em] leading-loose mb-12 max-w-md">
                {product.description}
              </p>
            )}

            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={Number(product.price)}
              image={mainImage}
              slug={product.slug}
              variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
