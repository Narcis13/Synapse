"use client"

import { useState, useEffect } from "react"
import { useConvexAuth, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/dashboard/UserNav"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bell } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isAuthenticated, isLoading])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const usagePercentage = user.subscription.tier === "free" 
    ? (user.subscription.documentsUsed / user.subscription.documentsLimit) * 100
    : 0

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">Synapse</h2>
            <Badge variant={user.subscription.tier === "pro" ? "default" : "secondary"}>
              {user.subscription.tier === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
          
          <DashboardNav />
          
          {/* Usage Meters */}
          <div className="p-6 border-t">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="font-medium">
                    {user.subscription.documentsUsed}/{user.subscription.documentsLimit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
              
              {user.subscription.tier === "free" && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Audio Minutes</span>
                    <span className="font-medium">
                      {user.subscription.audioMinutesUsed}/{user.subscription.audioMinutesLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(user.subscription.audioMinutesUsed / user.subscription.audioMinutesLimit) * 100} 
                    className="h-2" 
                  />
                </div>
              )}
            </div>
            
            {user.subscription.tier === "free" && (
              <Button className="w-full mt-4" size="sm" asChild>
                <a href="/settings/billing">Upgrade to Pro</a>
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Synapse</h2>
              <Badge variant={user.subscription.tier === "pro" ? "default" : "secondary"}>
                {user.subscription.tier === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>
            
            <DashboardNav onNavigate={() => setSidebarOpen(false)} />
            
            {/* Mobile Usage Meters */}
            <div className="p-6 border-t mt-auto">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="font-medium">
                      {user.subscription.documentsUsed}/{user.subscription.documentsLimit}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>
                
                {user.subscription.tier === "free" && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Audio Minutes</span>
                      <span className="font-medium">
                        {user.subscription.audioMinutesUsed}/{user.subscription.audioMinutesLimit}
                      </span>
                    </div>
                    <Progress 
                      value={(user.subscription.audioMinutesUsed / user.subscription.audioMinutesLimit) * 100} 
                      className="h-2" 
                    />
                  </div>
                )}
              </div>
              
              {user.subscription.tier === "free" && (
                <Button className="w-full mt-4" size="sm" asChild>
                  <a href="/settings/billing">Upgrade to Pro</a>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions Toolbar */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/documents/new">New Document</a>
              </Button>
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Navigation */}
            <UserNav user={user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  )
}