import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import ProjectsShowcase from "@/components/public/ProjectsShowcase";
import AboutSection from "@/components/public/AboutSection";
import JoinCtaSection from "@/components/public/JoinCtaSection";
import Footer from "@/components/public/Footer";
import CookieBanner from "@/components/public/CookieBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar overlay />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ProjectsShowcase />
        <AboutSection />
        <JoinCtaSection />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
