import {
  Navbar,
  HeroSection,
  FeaturesSection,
  WorkflowSection,
  TechHighlightsSection,
  CtaSection,
  Footer,
} from "@/components";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <TechHighlightsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
