"use client"

import { useState } from "react"
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import NotificationsModal from "@/components/user/NotificationsModal"
import api from "@/lib/api"
import { useUserStore } from "@/stores/userStore"

interface UserInfoProps {
  user: {
    username: string
    email: string
    lives: number
  }
}

export default function UserInfo({ user }: UserInfoProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const { clearPlayer } = useUserStore();

  const handleLogout = async () => {
    try {
      // Call the backend signout endpoint to clear the refresh token cookie
      await api.post("/api/auth/signout");
      
      // Clear the auth store
      clearPlayer();
      
      // Navigate back to home/login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, we should still clear the local state
      clearPlayer();
      window.location.href = "/";
    }
  }

  const handleNotifications = () => {
    setIsNotificationsOpen(true)
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
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

      {/* Notifications Modal */}
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  )
}
