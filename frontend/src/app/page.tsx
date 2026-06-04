import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import CompatibleStack from '../components/CompatibleStack';
import Testimonials from '../components/Testimonials';
import PlatformShowcase from '../components/PlatformShowcase';
import HowItWorks from '../components/HowItWorks';
import Security from '../components/Security';
import ForWho from '../components/ForWho';
import WhyStellar from '../components/WhyStellar';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <NavBar />
      <Hero />
      <Stats />
      <CompatibleStack />
      <Testimonials />
      <PlatformShowcase />
      <HowItWorks />
      <Security />
      <ForWho />
      <WhyStellar />
      <CTA />
      <Footer />
    </main>
  );
}
