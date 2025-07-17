"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  FileText,
  Settings,
  BookOpen,
  Brain,
  Sparkles,
  Plus,
  Library,
  GraduationCap,
  MessageSquare,
  FlaskConical,
  Users
} from "lucide-react"

interface DashboardNavProps {
  onNavigate?: () => void
}

export function DashboardNav({ onNavigate }: DashboardNavProps) {
  const pathname = usePathname()

  const navigation = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: Home,
        },
        {
          title: "Documents",
          href: "/documents",
          icon: FileText,
        },
      ],
    },
    {
      title: "Learning",
      items: [
        {
          title: "My Library",
          href: "/library",
          icon: Library,
        },
        {
          title: "Study Sessions",
          href: "/study",
          icon: GraduationCap,
        },
        {
          title: "AI Chat",
          href: "/chat",
          icon: MessageSquare,
        },
        {
          title: "Teach Mode",
          href: "/teach",
          icon: Users,
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          title: "Quiz Builder",
          href: "/quiz-builder",
          icon: FlaskConical,
        },
        {
          title: "Flashcards",
          href: "/flashcards",
          icon: Brain,
        },
        {
          title: "AI Features",
          href: "/ai-features",
          icon: Sparkles,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ]

  return (
    <nav className="flex-1 px-6 py-8 space-y-8 overflow-y-auto">
      {/* Quick Actions */}
      <div>
        <Button
          className="w-full justify-start"
          size="sm"
          asChild
          onClick={onNavigate}
        >
          <Link href="/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Link>
        </Button>
      </div>

      {/* Navigation Sections */}
      {navigation.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                  size="sm"
                  asChild
                  onClick={onNavigate}
                >
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Help Section */}
      <div className="pt-8 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          size="sm"
          asChild
          onClick={onNavigate}
        >
          <Link href="/help">
            <BookOpen className="mr-2 h-4 w-4" />
            Help & Resources
          </Link>
        </Button>
      </div>
    </nav>
  )
}