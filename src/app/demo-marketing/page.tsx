import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Testimonials from "@/components/marketing/Testimonials";

export default function DemoMarketingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Testimonials />
    </main>
  );
}