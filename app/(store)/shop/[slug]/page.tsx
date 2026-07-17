import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { ProductGallery } from '@/components/store/ProductGallery';

import { Metadata } from 'next';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!product) {
    return { title: 'Producto no encontrado' };
  }

  const imgs = product.images as string[];
  const mainImage = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '';

  return {
    title: `${product.name} | ANTA Indumentaria`,
    description: product.description || `Compra ${product.name} en ANTA Indumentaria. Estética urbana vanguardista.`,
    openGraph: {
      title: `${product.name} | ANTA Indumentaria`,
      description: product.description || `Compra ${product.name} en ANTA Indumentaria.`,
      images: mainImage ? [mainImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ANTA Indumentaria`,
      description: product.description || `Compra ${product.name} en ANTA Indumentaria.`,
      images: mainImage ? [mainImage] : [],
    }
  };
}

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
    <main className="min-h-screen relative overflow-hidden pt-24 pb-32">
      {/* Noise Overlay */}
      <div className="noise-bg mix-blend-screen"></div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10 flex flex-col">
        
        {/* Back Link */}
        <Link href="/shop" className="text-muted-foreground hover:text-accent transition-colors mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest w-fit">
          <ArrowLeft className="w-4 h-4" /> Volver al Shop
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Product Images (Gallery) */}
          <div className="flex-1">
            <ProductGallery images={productImages as string[]} productName={product.name} />
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
              variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock, color: v.color }))}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
