import type { Metadata } from 'next';
import { Manrope, Syne } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { WhatsAppBubble } from '@/components/layout/WhatsAppBubble';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://antaindumentaria.cl'),
  title: {
    template: '%s | ANTA Indumentaria',
    default: 'ANTA Indumentaria | Vestuario Urbano y Streetwear Chileno',
  },
  description: 'Anta Indumentaria. Estética vanguardista y disruptiva. Ropa urbana y streetwear Made in Chile. Compra poleras, polerones, buzos y conjuntos exclusivos.',
  keywords: ['anta', 'anta indumentaria', 'anta ropa', 'ropa urbana chile', 'streetwear chile', 'poleras oversize', 'boxy fit chile', 'vestuario independiente', 'diseño chileno'],
  authors: [{ name: 'Anta Indumentaria' }],
  creator: 'Anta Indumentaria',
  publisher: 'Anta Indumentaria',
  openGraph: {
    title: 'ANTA Indumentaria | Vestuario Urbano',
    description: 'Estética vanguardista y disruptiva. Ropa urbana y streetwear Made in Chile.',
    url: 'https://antaindumentaria.cl',
    siteName: 'ANTA Indumentaria',
    locale: 'es_CL',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/PNG/icon-blanco.png', sizes: '192x192', type: 'image/png' },
      { url: '/SVG/icon-blanco.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/PNG/icon-blanco.png', sizes: '180x180' },
    shortcut: '/PNG/icon-blanco.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${manrope.variable} ${syne.variable} antialiased bg-background text-foreground selection:bg-accent selection:text-black`}
      >
        {children}
        <WhatsAppBubble />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
