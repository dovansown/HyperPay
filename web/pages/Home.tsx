import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Partners } from '@/components/sections/Partners';
import { Finance } from '@/components/sections/Finance';
import { Features } from '@/components/sections/Features';
import { Newsletter } from '@/components/sections/Newsletter';
import { Footer } from '@/components/layout/Footer';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Partners />
        <Finance />
        <Features />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
