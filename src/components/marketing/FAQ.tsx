"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  CreditCard,
  Shield,
  FileText,
  Brain,
  Users,
  Zap,
  Mail,
  ExternalLink,
} from "lucide-react";

// FAQ item type definition
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  keywords?: string[];
}

// FAQ category type definition
type FAQCategory = 
  | "pricing"
  | "technical"
  | "features"
  | "account"
  | "privacy"
  | "getting-started";

// Category configuration
interface CategoryConfig {
  label: string;
  icon: React.ReactNode;
  description: string;
}

const categories: Record<FAQCategory, CategoryConfig> = {
  pricing: {
    label: "Pricing & Billing",
    icon: <CreditCard className="h-4 w-4" />,
    description: "Questions about plans, payment, and subscriptions",
  },
  technical: {
    label: "Technical",
    icon: <FileText className="h-4 w-4" />,
    description: "File formats, limits, and technical requirements",
  },
  features: {
    label: "Features",
    icon: <Brain className="h-4 w-4" />,
    description: "AI capabilities, Teach Me mode, and other features",
  },
  account: {
    label: "Account",
    icon: <Users className="h-4 w-4" />,
    description: "Account management and subscription details",
  },
  privacy: {
    label: "Privacy & Security",
    icon: <Shield className="h-4 w-4" />,
    description: "Data privacy, security, and compliance",
  },
  "getting-started": {
    label: "Getting Started",
    icon: <Zap className="h-4 w-4" />,
    description: "How to begin using Synapse effectively",
  },
};

// FAQ data
const faqData: FAQItem[] = [
  // Pricing & Billing
  {
    id: "pricing-1",
    question: "How much does Synapse cost?",
    answer: "Synapse offers a generous free tier that includes 5 documents per month, basic AI features, and 10MB file upload limit. Our Pro plan is $12.99/month and includes unlimited documents, advanced AI features, 50MB file uploads, priority processing, and voice synthesis.",
    category: "pricing",
    keywords: ["cost", "price", "free", "pro", "subscription"],
  },
  {
    id: "pricing-2",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your current billing period, after which your account will revert to the free tier.",
    category: "pricing",
    keywords: ["cancel", "subscription", "billing", "refund"],
  },
  {
    id: "pricing-3",
    question: "Do you offer student discounts?",
    answer: "We're currently working on a student discount program. Please contact our support team with your .edu email address, and we'll notify you when the program launches.",
    category: "pricing",
    keywords: ["student", "discount", "education", "academic"],
  },
  {
    id: "pricing-4",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. We're working on adding PayPal and other payment methods soon.",
    category: "pricing",
    keywords: ["payment", "credit card", "stripe", "paypal"],
  },

  // Technical Questions
  {
    id: "technical-1",
    question: "What file formats are supported?",
    answer: "Synapse supports PDF, TXT, MD (Markdown), and various audio formats including MP3, WAV, M4A, and OGG. For best results with PDFs, ensure they contain selectable text rather than scanned images.",
    category: "technical",
    keywords: ["file", "format", "pdf", "audio", "upload"],
  },
  {
    id: "technical-2",
    question: "What are the file size limits?",
    answer: "Free tier users can upload files up to 10MB, while Pro users enjoy a 50MB limit per file. Audio files are automatically compressed for optimal performance without quality loss.",
    category: "technical",
    keywords: ["size", "limit", "upload", "maximum", "storage"],
  },
  {
    id: "technical-3",
    question: "Is there a limit on the number of documents?",
    answer: "Free users can upload up to 5 documents per month. Pro users have unlimited document uploads and can maintain an unlimited library of learning materials.",
    category: "technical",
    keywords: ["document", "limit", "quota", "monthly"],
  },
  {
    id: "technical-4",
    question: "What browsers are supported?",
    answer: "Synapse works best on modern browsers including Chrome (v90+), Firefox (v88+), Safari (v14+), and Edge (v90+). We recommend using the latest version of your browser for the best experience.",
    category: "technical",
    keywords: ["browser", "chrome", "firefox", "safari", "compatibility"],
  },

  // Feature Questions
  {
    id: "features-1",
    question: "What is Teach Me mode?",
    answer: "Teach Me mode is our innovative Socratic learning feature where you explain concepts to an AI student. The AI asks clarifying questions, helping you identify knowledge gaps and deepen understanding through teaching. It's based on the proven learning technique that teaching others is the best way to learn.",
    category: "features",
    keywords: ["teach me", "socratic", "learning", "ai student"],
  },
  {
    id: "features-2",
    question: "How do AI summaries work?",
    answer: "Our AI analyzes your uploaded documents and creates concise, structured summaries highlighting key concepts, main ideas, and important details. You can customize summary length and focus areas. Summaries are generated using advanced language models and are cached for instant access.",
    category: "features",
    keywords: ["summary", "ai", "analysis", "key concepts"],
  },
  {
    id: "features-3",
    question: "Can I generate quizzes from any document?",
    answer: "Yes! Synapse can generate multiple-choice, true/false, and short-answer questions from any uploaded document. The AI ensures questions test comprehension of key concepts. Pro users can customize difficulty levels and question types.",
    category: "features",
    keywords: ["quiz", "questions", "test", "assessment"],
  },
  {
    id: "features-4",
    question: "How does voice synthesis work?",
    answer: "Pro users can convert any text content into natural-sounding speech using our AI voice synthesis. Choose from multiple voice options and adjust speaking speed. Great for audio learners or studying on the go.",
    category: "features",
    keywords: ["voice", "audio", "synthesis", "text to speech"],
  },
  {
    id: "features-5",
    question: "What are smart flashcards?",
    answer: "Our AI generates flashcards that focus on the most important concepts from your documents. Cards use spaced repetition algorithms to optimize your study sessions, showing you cards right when you're about to forget them.",
    category: "features",
    keywords: ["flashcard", "spaced repetition", "memorization", "study"],
  },

  // Account Management
  {
    id: "account-1",
    question: "How do I upgrade to Pro?",
    answer: "Click the 'Upgrade to Pro' button in your dashboard or account settings. You'll be redirected to our secure payment page. After payment, Pro features are activated immediately.",
    category: "account",
    keywords: ["upgrade", "pro", "premium", "activate"],
  },
  {
    id: "account-2",
    question: "Can I change my email address?",
    answer: "Yes, you can update your email address in your account settings. You'll need to verify the new email address before the change takes effect. Your subscription and documents will transfer automatically.",
    category: "account",
    keywords: ["email", "change", "update", "account"],
  },
  {
    id: "account-3",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page and enter your email address. We'll send you a secure link to reset your password. The link expires after 24 hours for security.",
    category: "account",
    keywords: ["password", "reset", "forgot", "login"],
  },
  {
    id: "account-4",
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account from the account settings page. This action is permanent and will delete all your documents, progress, and subscription. We recommend downloading your data first.",
    category: "account",
    keywords: ["delete", "remove", "account", "data"],
  },

  // Privacy & Security
  {
    id: "privacy-1",
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption for all data in transit and at rest. Your documents are stored securely on enterprise-grade servers, and we never share your data with third parties. All AI processing is done with privacy in mind.",
    category: "privacy",
    keywords: ["security", "encryption", "safe", "private"],
  },
  {
    id: "privacy-2",
    question: "Do you train AI models on my documents?",
    answer: "No, we do not use your personal documents to train our AI models. Your content remains private and is only used to provide you with personalized learning features. We respect your intellectual property.",
    category: "privacy",
    keywords: ["ai training", "privacy", "data usage", "models"],
  },
  {
    id: "privacy-3",
    question: "Can I export my data?",
    answer: "Yes, you can export all your data including documents, summaries, flashcards, and quiz results from your account settings. We provide exports in common formats (PDF, JSON) for easy portability.",
    category: "privacy",
    keywords: ["export", "download", "data", "backup"],
  },
  {
    id: "privacy-4",
    question: "Is Synapse GDPR compliant?",
    answer: "Yes, we are fully GDPR compliant. We provide data portability, the right to be forgotten, and transparent data processing practices. Our privacy policy details how we handle personal data in compliance with regulations.",
    category: "privacy",
    keywords: ["gdpr", "compliance", "regulation", "privacy"],
  },

  // Getting Started
  {
    id: "getting-started-1",
    question: "How do I get started with Synapse?",
    answer: "Getting started is easy! Sign up for a free account, upload your first document (PDF, text, or audio), and explore our AI features. We recommend starting with a summary, then trying quizzes or flashcards. Check out our tutorial videos for tips.",
    category: "getting-started",
    keywords: ["start", "begin", "first", "tutorial"],
  },
  {
    id: "getting-started-2",
    question: "What makes Synapse different from other learning tools?",
    answer: "Synapse combines multiple learning modalities in one platform: AI summaries, interactive quizzes, smart flashcards, and our unique Teach Me mode. We focus on active learning techniques proven by cognitive science to improve retention and understanding.",
    category: "getting-started",
    keywords: ["different", "unique", "comparison", "features"],
  },
  {
    id: "getting-started-3",
    question: "Can I use Synapse for group study?",
    answer: "Currently, Synapse is designed for individual learning. However, you can share generated quizzes and flashcard sets with study partners. We're working on collaborative features for future releases.",
    category: "getting-started",
    keywords: ["group", "collaborative", "share", "study"],
  },
  {
    id: "getting-started-4",
    question: "Is there a mobile app?",
    answer: "Synapse is currently a web application optimized for both desktop and mobile browsers. A dedicated mobile app is on our roadmap. The web app works great on mobile devices with full feature parity.",
    category: "getting-started",
    keywords: ["mobile", "app", "ios", "android", "phone"],
  },
];

interface FeedbackState {
  [key: string]: "helpful" | "not-helpful" | null;
}

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | "all">("all");
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    const groups: Record<FAQCategory, FAQItem[]> = {
      pricing: [],
      technical: [],
      features: [],
      account: [],
      privacy: [],
      "getting-started": [],
    };

    filteredFAQs.forEach((faq) => {
      groups[faq.category].push(faq);
    });

    return groups;
  }, [filteredFAQs]);

  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setFeedback((prev) => ({
      ...prev,
      [faqId]: isHelpful ? "helpful" : "not-helpful",
    }));
    // Here you would typically send this feedback to your analytics/backend
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-16 md:py-24" id="faq">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerAnimation}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemAnimation} className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
              Support
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Synapse
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div variants={itemAnimation} className="mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
                aria-label="Search frequently asked questions"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="transition-all"
              >
                All Categories
              </Button>
              {Object.entries(categories).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key as FAQCategory)}
                  className="transition-all"
                >
                  {config.icon}
                  <span className="ml-1.5">{config.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div variants={itemAnimation}>
            {filteredFAQs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No questions found matching your search.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </Card>
            ) : (
              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {Object.entries(groupedFAQs).map(([category, faqs]) => {
                    if (faqs.length === 0) return null;

                    const categoryConfig = categories[category as FAQCategory];

                    return (
                      <motion.div
                        key={category}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="px-6 py-4 bg-muted/50 border-b">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {categoryConfig.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold">{categoryConfig.label}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {categoryConfig.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            {faqs.map((faq, index) => (
                              <AccordionItem
                                key={faq.id}
                                value={faq.id}
                                className={index === faqs.length - 1 ? "border-b-0" : ""}
                              >
                                <AccordionTrigger className="text-left hover:no-underline">
                                  <span className="pr-4">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                      {faq.answer}
                                    </p>
                                    
                                    {/* Feedback */}
                                    <div className="flex items-center gap-4 pt-2">
                                      <span className="text-sm text-muted-foreground">
                                        Was this helpful?
                                      </span>
                                      <div className="flex gap-2">
                                        <Button
                                          variant={feedback[faq.id] === "helpful" ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => handleFeedback(faq.id, true)}
                                          disabled={feedback[faq.id] !== null}
                                          className="h-8 px-3"
                                          aria-label="Mark as helpful"
                                        >
                                          <ThumbsUp className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant={feedback[faq.id] === "not-helpful" ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => handleFeedback(faq.id, false)}
                                          disabled={feedback[faq.id] !== null}
                                          className="h-8 px-3"
                                          aria-label="Mark as not helpful"
                                        >
                                          <ThumbsDown className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                      {feedback[faq.id] && (
                                        <motion.span
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          className="text-sm text-muted-foreground"
                                        >
                                          Thanks for your feedback!
                                        </motion.span>
                                      )}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Accordion>
            )}
          </motion.div>

          {/* Contact Support */}
          <motion.div variants={itemAnimation} className="mt-12">
            <Card className="p-8 text-center bg-muted/50">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">
                    Contact Support
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs">
                    View Documentation
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;