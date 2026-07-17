import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="logo-bg mix-blend-screen"></div>
      <Navbar />
      <div className="flex-1 relative z-10">
        {children}
      </div>
      <Footer />
    </div>
  );
}
