"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Zap, Award, BookOpen } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const metrics: Metric[] = [
  {
    label: "Active Learners",
    value: "50,000+",
    change: "+120%",
    icon: Users,
    color: "text-blue-500",
    description: "Students actively using Synapse",
  },
  {
    label: "Study Time Saved",
    value: "42%",
    change: "average",
    icon: Clock,
    color: "text-green-500",
    description: "Less time studying, better results",
  },
  {
    label: "Grade Improvement",
    value: "89%",
    change: "of users",
    icon: TrendingUp,
    color: "text-purple-500",
    description: "Report better grades after 3 months",
  },
  {
    label: "AI Interactions",
    value: "2M+",
    change: "per month",
    icon: Zap,
    color: "text-orange-500",
    description: "Questions answered by our AI",
  },
  {
    label: "Success Rate",
    value: "94%",
    change: "satisfaction",
    icon: Award,
    color: "text-yellow-500",
    description: "Users recommend Synapse",
  },
  {
    label: "Documents Processed",
    value: "500K+",
    change: "and counting",
    icon: BookOpen,
    color: "text-indigo-500",
    description: "Study materials enhanced with AI",
  },
];

function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [count, setCount] = React.useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
  const { ref, inView } = useInView({ triggerOnce: true });

  React.useEffect(() => {
    if (inView && numericValue) {
      const increment = numericValue / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, numericValue, duration]);

  const formatValue = (num: number) => {
    const match = value.match(/[^0-9]+$/);
    const suffix = match ? match[0] : "";
    const prefix = value.match(/^[^0-9]+/);
    const prefixStr = prefix ? prefix[0] : "";
    
    if (value.includes("K")) {
      return `${prefixStr}${(num / 1000).toFixed(0)}K${suffix}`;
    }
    if (value.includes("M")) {
      return `${prefixStr}${(num / 1000000).toFixed(1)}M${suffix}`;
    }
    return `${prefixStr}${num}${suffix}`;
  };

  return (
    <span ref={ref}>
      {inView ? formatValue(count) : value}
    </span>
  );
}

export function PerformanceMetrics() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <TrendingUp className="w-3 h-3 mr-1" />
            Real Results
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Performance That Speaks{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Volumes
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who are already transforming their learning experience with Synapse
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-lg bg-background", metric.color)}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold">
                      <AnimatedCounter value={metric.value} />
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by students from top universities worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {["🎓 Harvard", "🎓 MIT", "🎓 Stanford", "🎓 Oxford", "🎓 Cambridge"].map((uni) => (
              <span key={uni} className="text-lg font-medium">
                {uni}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}