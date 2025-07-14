import { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { Testimonials } from "@/components/marketing/Testimonials";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FAQ } from "@/components/marketing/FAQ";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { PerformanceMetrics } from "@/components/marketing/PerformanceMetrics";
import { SocialLinks } from "@/components/marketing/SocialLinks";
import { ScrollToTop } from "@/components/marketing/ScrollToTop";

export const metadata: Metadata = {
  title: "Synapse - Learn Smarter with AI-Powered Education",
  description: "Transform your learning experience with AI-powered summaries, interactive quizzes, and innovative Teach Me mode. Join 50,000+ students already excelling with Synapse.",
  keywords: "AI learning, study tools, educational technology, PDF summarizer, audio transcription, Teach Me mode, flashcards, quizzes",
  openGraph: {
    title: "Synapse - Learn Smarter with AI-Powered Education",
    description: "Transform your learning experience with AI-powered summaries, interactive quizzes, and innovative Teach Me mode.",
    type: "website",
    url: "https://synapse-learn.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Synapse - AI-Powered Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Synapse - Learn Smarter with AI",
    description: "Transform your learning experience with AI-powered tools",
    images: ["/twitter-image.png"],
    creator: "@synapse_learn",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://synapse-learn.com",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Smooth scroll wrapper */}
      <main className="relative overflow-x-hidden">
        {/* Hero Section - Above the fold */}
        <Hero />
        
        {/* Performance Metrics - Build trust early */}
        <PerformanceMetrics />
        
        {/* Features - Show value proposition */}
        <Features />
        
        {/* Testimonials - Social proof */}
        <Testimonials />
        
        {/* Pricing - Clear conversion path */}
        <PricingSection />
        
        {/* FAQ - Address concerns */}
        <FAQ />
        
        {/* Newsletter - Capture leads */}
        <NewsletterSignup />
        
        {/* Footer with social links */}
        <footer className="border-t py-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start gap-2">
                <h3 className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Synapse
                </h3>
                <p className="text-sm text-muted-foreground">
                  © 2024 Synapse Learning. All rights reserved.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </div>
              
              <SocialLinks />
            </div>
          </div>
        </footer>
        
        {/* Scroll to top button */}
        <ScrollToTop />
      </main>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Synapse",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "2547",
            },
            description: "AI-powered learning platform with summaries, quizzes, and innovative Teach Me mode",
            featureList: [
              "AI-powered document summarization",
              "Interactive quiz generation",
              "Smart flashcards with spaced repetition",
              "Teach Me mode with Socratic learning",
              "Audio transcription and synthesis",
              "Real-time collaboration",
            ],
          }),
        }}
      />
    </>
  );
}