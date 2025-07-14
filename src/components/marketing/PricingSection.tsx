"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X, Sparkles, Zap, Shield, Heart, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

interface PricingTier {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: PricingFeature[];
  badge?: string;
  highlighted?: boolean;
  cta: string;
  icon: React.ElementType;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "Perfect for trying out Synapse",
    icon: Heart,
    cta: "Start Free",
    features: [
      { text: "5 documents per month", included: true },
      { text: "10 minutes of audio processing", included: true },
      { text: "3 Teach Me sessions", included: true },
      { text: "Basic AI summaries", included: true },
      { text: "Quiz generation", included: true },
      { text: "Flashcard creation", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    price: {
      monthly: 12.99,
      yearly: 129.99,
    },
    description: "Everything you need to excel in your studies",
    icon: Zap,
    badge: "Most Popular",
    highlighted: true,
    cta: "Start Pro Trial",
    features: [
      { text: "Unlimited documents", included: true },
      { text: "300 minutes of audio/month", included: true },
      { text: "Unlimited Teach Me sessions", included: true },
      { text: "Advanced AI summaries", included: true },
      { text: "Unlimited quizzes", included: true },
      { text: "Smart flashcards with spaced repetition", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics & insights", included: true },
      { text: "Export to Anki, Notion, Obsidian", included: true },
    ],
  },
  {
    name: "Team",
    price: {
      monthly: 39.99,
      yearly: 399.99,
    },
    description: "For study groups and classrooms",
    icon: Shield,
    badge: "Coming Soon",
    cta: "Join Waitlist",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited audio processing", included: true },
      { text: "Collaborative learning spaces", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Custom AI personalities", included: true },
      { text: "White-label options", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "99.9% uptime SLA", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const savings = billingCycle === "yearly" ? "Save 17%" : null;

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/20 to-purple-400/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-l from-primary/10 to-pink-400/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Choose Your Learning Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm font-medium", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <span className={cn("text-sm font-medium flex items-center gap-2", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
              Yearly
              {savings && (
                <Badge variant="secondary" className="text-xs">
                  {savings}
                </Badge>
              )}
            </span>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "relative h-full flex flex-col",
                  tier.highlighted && "border-primary shadow-lg scale-105 z-10"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant={tier.highlighted ? "default" : "secondary"} className="px-3 py-1">
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <tier.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${billingCycle === "yearly" ? (tier.price.yearly / 12).toFixed(2) : tier.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {billingCycle === "yearly" && tier.price.yearly > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${tier.price.yearly} billed yearly
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          !feature.included && "text-muted-foreground/50"
                        )}>
                          {feature.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button 
                    className={cn(
                      "w-full group",
                      tier.highlighted ? "shadow-lg" : ""
                    )}
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                    disabled={tier.name === "Team"}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            30-day money-back guarantee • No credit card required for free plan
          </p>
        </motion.div>
      </div>
    </section>
  );
}