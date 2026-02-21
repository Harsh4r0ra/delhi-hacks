import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBy from "@/components/landing/TrustedBy";
import WhoWeAre from "@/components/landing/WhoWeAre";
import BentoFeatures from "@/components/landing/BentoFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import FAQSection from "@/components/landing/FAQSection";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { useConsensusSimulation } from "@/hooks/useConsensusSimulation";

const Index = () => {
  const { completedRounds, failures } = useConsensusSimulation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection completedRounds={completedRounds} failures={failures} />
        <TrustedBy />
        <WhoWeAre />
        <div id="features">
          <BentoFeatures />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <Benefits />
        <WhyChooseUs />
        <div id="faq">
          <FAQSection />
        </div>
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
