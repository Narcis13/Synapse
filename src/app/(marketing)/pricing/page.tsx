"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, X, Shield, Star, Users, HelpCircle } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out Synapse",
    features: [
      { text: "5 documents per month", included: true },
      { text: "10 minutes of audio processing", included: true },
      { text: "3 Teach Me sessions per month", included: true },
      { text: "Basic AI summaries", included: true },
      { text: "Standard quiz generation", included: true },
      { text: "Community support", included: true },
      { text: "Unlimited documents", included: false },
      { text: "Priority AI processing", included: false },
      { text: "Advanced learning analytics", included: false },
      { text: "Custom AI personalities", included: false },
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "19",
    description: "Unlock the full power of AI-assisted learning",
    features: [
      { text: "Unlimited documents", included: true },
      { text: "Unlimited audio processing", included: true },
      { text: "Unlimited Teach Me sessions", included: true },
      { text: "Advanced AI summaries", included: true },
      { text: "Interactive quiz generation", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced learning analytics", included: true },
      { text: "Custom AI personalities", included: true },
      { text: "Early access to new features", included: true },
      { text: "API access (coming soon)", included: true },
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    popular: true,
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    content: "Synapse Pro transformed how I study. The unlimited Teach Me sessions help me master complex topics by teaching them back.",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Software Engineer",
    content: "The audio processing feature is a game-changer. I can upload my meeting recordings and get instant, actionable summaries.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "PhD Candidate",
    content: "Worth every penny! The advanced analytics show exactly where I need to focus my studies. My retention has improved dramatically.",
    rating: 5,
  },
]

const faqs = [
  {
    question: "What happens when I reach my free tier limits?",
    answer: "When you reach your monthly limits on the free tier, you'll need to wait for the next month or upgrade to Pro for continued access. We'll notify you when you're approaching your limits.",
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer: "Yes! You can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your billing period.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes, we offer a 7-day free trial for Pro. No credit card required to start your trial.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets through our secure payment processor, Stripe.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! Students with a valid .edu email address get 30% off Pro subscriptions. Contact support to activate your discount.",
  },
  {
    question: "What's your refund policy?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied with Pro, contact us within 30 days for a full refund.",
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="container max-w-7xl py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your learning journey. Start free, upgrade when you need more.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "ghost"}
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === "yearly" ? "default" : "ghost"}
            onClick={() => setBillingPeriod("yearly")}
          >
            Yearly
            <Badge className="ml-2" variant="secondary">Save 20%</Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingPeriod === "yearly" && plan.price !== "0" 
                    ? Math.floor(parseInt(plan.price) * 0.8) 
                    : plan.price}
                </span>
                {plan.price !== "0" && (
                  <span className="text-muted-foreground ml-2">
                    per {billingPeriod === "yearly" ? "month, billed yearly" : "month"}
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground/50"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href={plan.href}>
                  {plan.cta}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Money-back Guarantee */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
          <Shield className="h-6 w-6" />
          <span className="font-semibold">30-Day Money-Back Guarantee</span>
        </div>
        <p className="text-muted-foreground mt-2">
          Try Pro risk-free. If you're not satisfied, get a full refund within 30 days.
        </p>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Loved by learners worldwide
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <CardDescription>{testimonial.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Ready to supercharge your learning?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of learners who are achieving their goals with Synapse.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-up">
              Start Free
            </Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/sign-up?plan=pro">
              Get Pro Access
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}