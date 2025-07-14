"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Sparkles,
  MessageSquare,
  FileText,
  Headphones,
  ArrowRight,
  Play,
} from "lucide-react";

interface FeatureHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Hero: React.FC = () => {
  const features: FeatureHighlight[] = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Powered Learning",
      description: "Get personalized summaries, quizzes, and flashcards",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Teach Me Mode",
      description: "Learn by teaching an AI student through dialogue",
    },
    {
      icon: <Headphones className="h-5 w-5" />,
      title: "Audio Support",
      description: "Upload lectures or generate voice explanations",
    },
  ];

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemAnimation} className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered Learning Platform
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemAnimation}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-center tracking-tight mb-6"
          >
            Learn Smarter with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Synapse
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemAnimation}
            className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-10"
          >
            Transform your documents and lectures into interactive learning experiences. 
            Upload any content and let AI help you master it through summaries, quizzes, 
            flashcards, and our unique "Teach Me" mode.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemAnimation}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button size="lg" className="group" asChild>
              <Link href="/register">
                Try Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group" asChild>
              <Link href="#demo">
                <Play className="mr-2 h-4 w-4" />
                View Demo
              </Link>
            </Button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            variants={itemAnimation}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 border-muted hover:border-primary/20 transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Video demo placeholder */}
          <motion.div
            variants={itemAnimation}
            className="relative max-w-4xl mx-auto"
            {...floatingAnimation}
          >
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border bg-muted/50">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group"
                  id="demo"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo Video
                </Button>
              </div>
              {/* Placeholder for actual video embed */}
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Video demo coming soon</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;