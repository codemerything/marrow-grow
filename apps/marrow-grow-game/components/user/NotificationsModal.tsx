"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Gift, Trophy, Skull, Leaf } from "lucide-react"

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock notifications data
const NOTIFICATIONS = [
  {
    id: 1,
    type: "reward",
    message: "You received a bonus life from daily spin!",
    icon: Gift,
    color: "text-green-400",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "achievement",
    message: "New high score! You reached the leaderboard!",
    icon: Trophy,
    color: "text-yellow-400",
    time: "Yesterday",
    read: false,
  },
  {
    id: 3,
    type: "event",
    message: "Skele Raiders tried to steal your plants!",
    icon: Skull,
    color: "text-red-400",
    time: "2 days ago",
    read: true,
  },
  {
    id: 4,
    type: "growth",
    message: "Your Bone Blossom has entered Phantom Bloom stage!",
    icon: Leaf,
    color: "text-purple-400",
    time: "3 days ago",
    read: true,
  },
]

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500 border-2 max-h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-pixel text-purple-300 flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-300" />
            Notifications
          </DialogTitle>
          <span className="bg-purple-600 text-white text-xs font-pixel px-2 py-1 rounded-full">
            {NOTIFICATIONS.filter((n) => !n.read).length} new
          </span>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {NOTIFICATIONS.length > 0 ? (
              NOTIFICATIONS.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? "bg-gray-800 border-gray-700" : "bg-gray-800/80 border-purple-600"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`${notification.color} bg-gray-700 p-2 rounded-full flex items-center justify-center`}
                    >
                      <notification.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-pixel text-xs">{notification.message}</p>
                      <p className="text-gray-400 font-pixel text-[10px] mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-purple-500 rounded-full mt-1"></div>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 font-pixel text-xs">No notifications yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
