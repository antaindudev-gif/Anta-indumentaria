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
  title: 'Anta Indumentaria | Dark Luxury',
  description: 'Tienda online de vestuario urbano independiente con estética alternativa, oscura y editorial.',
  icons: {
    icon: [
      { url: '/SVG/icon-blanco.svg', type: 'image/svg+xml' },
      { url: '/PNG/icon-blanco.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/PNG/icon-blanco.png', sizes: '512x512' },
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
