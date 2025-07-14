"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast.success("Welcome aboard! 🎉 You've successfully subscribed to our newsletter.");
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 5000);
    }, 1500);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden border-primary/20 shadow-xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative p-8 md:p-12">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 mb-4"
                >
                  <Mail className="w-8 h-8 text-primary" />
                </motion.div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Stay in the Loop
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get weekly study tips, exclusive features, and be the first to know about new AI learning tools. 
                  No spam, just pure learning gold.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isSubscribed}
                    className={cn(
                      "flex-1 h-12 px-4 transition-all",
                      isSubscribed && "border-green-500"
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading || isSubscribed}
                    className={cn(
                      "min-w-[140px] group transition-all",
                      isSubscribed && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Send className="mr-2 h-4 w-4 animate-pulse" />
                        Subscribing...
                      </>
                    ) : isSubscribed ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Subscribed!
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                </p>
              </form>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10"
              >
                {[
                  { icon: "📚", text: "Weekly study guides" },
                  { icon: "🚀", text: "Early access to features" },
                  { icon: "🎁", text: "Exclusive discounts" },
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground"
                  >
                    <span className="text-2xl">{benefit.icon}</span>
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}