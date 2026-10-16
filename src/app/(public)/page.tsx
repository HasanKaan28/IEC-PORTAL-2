import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import ClubMetrics from "@/components/public/ClubMetrics";
import ProjectsShowcase from "@/components/public/ProjectsShowcase";
import AboutSection from "@/components/public/AboutSection";
import BlogTeaserSection from "@/components/public/BlogTeaserSection";
import JoinCtaSection from "@/components/public/JoinCtaSection";
import Footer from "@/components/public/Footer";
import CookieBanner from "@/components/public/CookieBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ClubMetrics />
        <ProjectsShowcase />
        <AboutSection />
        <BlogTeaserSection />
        <JoinCtaSection />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
