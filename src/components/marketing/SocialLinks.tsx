"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Linkedin, Youtube, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLink {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "Twitter",
    href: "https://twitter.com/synapse_learn",
    icon: Twitter,
    color: "hover:text-blue-400",
  },
  {
    name: "GitHub",
    href: "https://github.com/synapse-learning",
    icon: Github,
    color: "hover:text-gray-400",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/synapse-learning",
    icon: Linkedin,
    color: "hover:text-blue-600",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@synapse-learning",
    icon: Youtube,
    color: "hover:text-red-500",
  },
  {
    name: "Discord",
    href: "https://discord.gg/synapse-learn",
    icon: MessageCircle,
    color: "hover:text-indigo-400",
  },
];

interface SocialLinksProps {
  className?: string;
  showLabels?: boolean;
  variant?: "default" | "ghost";
}

export function SocialLinks({ className, showLabels = false, variant = "ghost" }: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinks.map((social, index) => (
        <motion.div
          key={social.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Button
            variant={variant}
            size={showLabels ? "default" : "icon"}
            className={cn(
              "transition-all duration-200",
              social.color,
              !showLabels && "h-10 w-10"
            )}
            asChild
          >
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${social.name}`}
            >
              <social.icon className={cn("h-5 w-5", showLabels && "mr-2")} />
              {showLabels && <span>{social.name}</span>}
            </a>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}