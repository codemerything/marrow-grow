"use client"

import { useState } from "react"
import GameButton from "@/components/ui/GameButton"
import NotificationsModal from "@/components/user/NotificationsModal"
import { Dice6, HelpCircle, Trophy, Play, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardMenuProps {
  user: {
    username: string
    email: string
    lives: number
  }
  canSpinToday: boolean
  onDailySpinClick: () => void
  onHowToPlayClick: () => void
  onLeaderboardClick: () => void
  onPlayClick: () => void
  onLogout: () => void
}

export default function DashboardMenu({
  user,
  canSpinToday,
  onDailySpinClick,
  onHowToPlayClick,
  onLeaderboardClick,
  onPlayClick,
  onLogout,
}: DashboardMenuProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.clear()
    // Call the logout function passed from parent
    onLogout()
  }

  const handleNotifications = () => {
    setIsNotificationsOpen(true)
  }

  return (
    <>
      {/* User Info & Controls - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Connection Status & User Info */}
        <div className="bg-purple-600 border-2 border-purple-500 rounded px-3 py-1 text-white font-pixel text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connected:</span>
          </div>
          <div className="text-yellow-300">
            {user.email.substring(0, 6)}...{user.email.slice(-4)}
          </div>
          <div className="text-yellow-300">@{user.username}</div>
        </div>

        {/* Notification Button */}
        <Button
          onClick={handleNotifications}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 p-2 transition-colors"
        >
          <Bell size={16} className="text-yellow-300" />
        </Button>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          size="sm"
          className="bg-red-600 hover:bg-red-700 border-2 border-red-500 p-2 transition-colors"
        >
          <LogOut size={16} className="text-yellow-300" />
        </Button>
      </div>

      {/* Main Dashboard Menu - Center */}
      <div className="flex flex-col items-center justify-center min-h-full relative z-10">
        <div className="bg-purple-600/90 border-2 border-purple-500 rounded-lg p-6 backdrop-blur-sm max-w-md">
          {/* Top Row - Daily Spin and Lives */}
          <div className="flex gap-4 mb-4 justify-center">
            <GameButton
              onClick={onDailySpinClick}
              variant="primary"
              className="flex-1 h-12 text-xs"
              icon={<Dice6 size={14} className="text-yellow-300" />}
              disabled={!canSpinToday}
            >
              {canSpinToday ? "Daily Spin" : "Spin Used"}
            </GameButton>

            <GameButton variant="secondary" className="flex-1 h-12 text-xs">
              <div className="flex items-center justify-center gap-1">
                <span className="text-white">Lives:</span>
                <span className="text-yellow-300">{user.lives}</span>
              </div>
            </GameButton>
          </div>

          {/* Second Row - How to Play and Leaderboard */}
          <div className="flex gap-4 mb-6 justify-center">
            <GameButton
              onClick={onHowToPlayClick}
              variant="secondary"
              className="flex-1 h-12 text-xs"
              icon={<HelpCircle size={14} className="text-cyan-300" />}
            >
              How to Play
            </GameButton>

            <GameButton
              onClick={onLeaderboardClick}
              variant="secondary"
              className="flex-1 h-12 text-xs"
              icon={<Trophy size={14} className="text-yellow-300" />}
            >
              Leaderboard
            </GameButton>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h2 className="text-yellow-300 font-pixel text-lg mb-2">Welcome, {user.username}!</h2>
            <p className="text-white font-pixel text-xs">Ready to start your growing adventure?</p>
          </div>

          {/* Play Button */}
          <div className="text-center">
            <GameButton
              onClick={onPlayClick}
              className="w-full h-14 bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-600 text-base"
              icon={<Play size={18} className="text-black" />}
            >
              Play
            </GameButton>
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  )
}
