"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { GameOverview } from "@/components/game-overview"
import { SeedsManagement } from "@/components/seeds-management"
import { LeaderboardManagement } from "@/components/leaderboard-management"
import { PlayerManagement } from "@/components/player-management"
import { SidebarInset } from "@/components/ui/sidebar"

import type { AdminUser } from "@/store/AdminStore"; // Assuming AdminUser is exported or create a similar type here

interface AdminDashboardProps {
  adminUser: AdminUser | null; // Use the type from the store
  onLogout: () => void;
}

export function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState("overview")

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <GameOverview />
      case "seeds":
        return <SeedsManagement />
      case "leaderboards":
        return <LeaderboardManagement />
      case "players":
        return <PlayerManagement />
      default:
        return <GameOverview />
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar activeView={activeView} setActiveView={setActiveView} />
      <SidebarInset>
        <DashboardHeader 
          adminUser={adminUser ? { username: adminUser.username, role: "Admin" /* Role is visually Admin, pass for consistency if needed */ } : null} 
          onLogout={onLogout} 
        />
        <main className="flex-1 p-6">{renderContent()}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
