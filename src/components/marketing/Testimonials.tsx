"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Star,
  Quote,
  Award,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  GraduationCap,
  Building2,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  school: string;
  avatar: string;
  rating: number;
  quote: string;
  achievement: string;
  studyTimeReduced: number;
  gradeImprovement: string;
}

interface Metric {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

interface University {
  name: string;
  logo: string;
}

interface Award {
  title: string;
  organization: string;
  year: string;
}

const Testimonials: React.FC = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [counters, setCounters] = useState<Record<string, number>>({});

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Sarah Chen",
      school: "Stanford University",
      avatar: "SC",
      rating: 5,
      quote: "Synapse transformed how I study for medical school. The Teach Me mode helped me understand complex anatomy concepts by explaining them to the AI. My study time decreased while my retention improved dramatically!",
      achievement: "Top 5% in class",
      studyTimeReduced: 45,
      gradeImprovement: "B+ to A+",
    },
    {
      id: "2",
      name: "Michael Rodriguez",
      school: "MIT",
      avatar: "MR",
      rating: 5,
      quote: "As an engineering student, I upload all my lecture recordings. The AI-generated summaries and quizzes are incredible. I went from struggling with thermodynamics to acing my exams!",
      achievement: "Dean's List",
      studyTimeReduced: 38,
      gradeImprovement: "C+ to A",
    },
    {
      id: "3",
      name: "Emily Johnson",
      school: "Harvard Law School",
      avatar: "EJ",
      rating: 5,
      quote: "The flashcard generation from case law PDFs is a game-changer. I can review hundreds of cases efficiently. Synapse helped me rank in the top 10% of my class!",
      achievement: "Law Review Editor",
      studyTimeReduced: 52,
      gradeImprovement: "B to A+",
    },
    {
      id: "4",
      name: "David Kim",
      school: "UC Berkeley",
      avatar: "DK",
      rating: 5,
      quote: "I'm an auditory learner, so the voice synthesis feature is perfect. I listen to AI-generated explanations during my commute. My GPA improved by a full point!",
      achievement: "Research Assistant",
      studyTimeReduced: 41,
      gradeImprovement: "3.2 to 4.0 GPA",
    },
    {
      id: "5",
      name: "Jessica Martinez",
      school: "Yale University",
      avatar: "JM",
      rating: 5,
      quote: "Synapse's quiz generation helped me identify knowledge gaps I didn't even know I had. The progress tracking keeps me motivated. Best study tool I've ever used!",
      achievement: "Phi Beta Kappa",
      studyTimeReduced: 35,
      gradeImprovement: "B+ to A",
    },
    {
      id: "6",
      name: "Alex Thompson",
      school: "Columbia University",
      avatar: "AT",
      rating: 5,
      quote: "The real-time sync across devices means I can study anywhere. I upload PDFs on my laptop and review flashcards on my phone. My productivity has skyrocketed!",
      achievement: "Valedictorian",
      studyTimeReduced: 48,
      gradeImprovement: "3.5 to 3.95 GPA",
    },
  ];

  const metrics: Metric[] = [
    {
      label: "Study Time Reduced",
      value: 42,
      suffix: "%",
      icon: <Clock className="h-5 w-5" />,
      color: "blue",
    },
    {
      label: "Grade Improvement",
      value: 89,
      suffix: "%",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "green",
    },
    {
      label: "User Satisfaction",
      value: 98,
      suffix: "%",
      icon: <Star className="h-5 w-5" />,
      color: "yellow",
    },
    {
      label: "Active Users",
      value: 50000,
      suffix: "+",
      icon: <Users className="h-5 w-5" />,
      color: "purple",
    },
  ];

  const universities: University[] = [
    { name: "Stanford", logo: "🎓" },
    { name: "MIT", logo: "🏛️" },
    { name: "Harvard", logo: "🎓" },
    { name: "Berkeley", logo: "🏛️" },
    { name: "Yale", logo: "🎓" },
    { name: "Columbia", logo: "🏛️" },
    { name: "Princeton", logo: "🎓" },
    { name: "Cornell", logo: "🏛️" },
  ];

  const awards: Award[] = [
    { title: "Best EdTech Platform", organization: "EdTech Awards", year: "2024" },
    { title: "Innovation in Learning", organization: "TechCrunch", year: "2024" },
    { title: "Student Choice Award", organization: "Academic Excellence", year: "2023" },
  ];

  // Animated counter logic
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    metrics.forEach((metric) => {
      let current = 0;
      const increment = metric.value / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= metric.value) {
          current = metric.value;
          clearInterval(timer);
        }
        setCounters((prev) => ({ ...prev, [metric.label]: Math.floor(current) }));
      }, interval);
    });

    return () => {
      metrics.forEach((metric) => {
        setCounters((prev) => ({ ...prev, [metric.label]: metric.value }));
      });
    };
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);
    handleSelect();

    const autoplayInterval = setInterval(() => {
      if (!isPaused) {
        carouselApi.scrollNext();
      }
    }, 5000);

    return () => {
      clearInterval(autoplayInterval);
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi, isPaused]);

  const getMetricColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-600 bg-blue-500/10",
      green: "text-green-600 bg-green-500/10",
      yellow: "text-yellow-600 bg-yellow-500/10",
      purple: "text-purple-600 bg-purple-500/10",
    };
    return colorMap[color] || "text-primary bg-primary/10";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

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

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemAnimation} className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Students Love{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Learning with Synapse
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who have transformed their study habits and achieved academic excellence
            </p>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            variants={containerAnimation}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                variants={itemAnimation}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${getMetricColorClasses(metric.color)}`}>
                    {metric.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    {counters[metric.label] || 0}{metric.suffix}
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial Carousel */}
          <motion.div
            variants={itemAnimation}
            className="mb-16"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <Carousel
              setApi={setCarouselApi}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="h-full"
                    >
                      <Card className="h-full hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {testimonial.avatar}
                              </div>
                              <div>
                                <h4 className="font-semibold">{testimonial.name}</h4>
                                <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                              </div>
                            </div>
                            <Quote className="h-8 w-8 text-muted-foreground/20" />
                          </div>

                          {/* Rating */}
                          <div className="flex gap-0.5 mb-4">
                            {renderStars(testimonial.rating)}
                          </div>

                          {/* Quote */}
                          <p className="text-sm leading-relaxed mb-4 min-h-[120px]">
                            "{testimonial.quote}"
                          </p>

                          {/* Achievement Badge */}
                          <Badge variant="secondary" className="mb-4">
                            <Trophy className="h-3 w-3 mr-1" />
                            {testimonial.achievement}
                          </Badge>

                          {/* Stats */}
                          <div className="space-y-2 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Study time reduced:</span>
                              <span className="font-semibold text-green-600">{testimonial.studyTimeReduced}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Grade improvement:</span>
                              <span className="font-semibold text-blue-600">{testimonial.gradeImprovement}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Social Proof Section */}
          <motion.div variants={itemAnimation}>
            <Card className="p-8 md:p-12 bg-muted/30">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Trusted by Students at Top Universities</h3>
                <p className="text-muted-foreground">Used by learners at over 500+ institutions worldwide</p>
              </div>

              {/* University Logos */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                {universities.map((uni, index) => (
                  <motion.div
                    key={uni.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-2">{uni.logo}</div>
                    <p className="text-sm text-muted-foreground">{uni.name}</p>
                  </motion.div>
                ))}
              </div>

              {/* Awards and Recognition */}
              <div className="border-t pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {awards.map((award, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h4 className="font-semibold">{award.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {award.organization} • {award.year}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-8 border-t">
                <Badge variant="outline" className="px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  SSL Encrypted
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  FERPA Compliant
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Building2 className="h-4 w-4 mr-2" />
                  SOC 2 Certified
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academic Partner
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemAnimation}
            className="text-center mt-16"
          >
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Join thousands of successful students using Synapse
            </p>
            <Button size="lg" className="group">
              Start Your Success Story
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;