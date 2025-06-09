"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, username: "SkullMaster", score: 9850, icon: Trophy, color: "text-yellow-400" },
  { rank: 2, username: "BoneCollector", score: 8920, icon: Medal, color: "text-gray-300" },
  { rank: 3, username: "GhostGrower", score: 8100, icon: Award, color: "text-orange-400" },
  { rank: 4, username: "SpookyFarmer", score: 7650, icon: null, color: "text-white" },
  { rank: 5, username: "CryptKeeper", score: 7200, icon: null, color: "text-white" },
  { rank: 6, username: "MarrowMaster", score: 6800, icon: null, color: "text-white" },
  { rank: 7, username: "PhantomPlanter", score: 6350, icon: null, color: "text-white" },
  { rank: 8, username: "DeadlyGardener", score: 5900, icon: null, color: "text-white" },
]

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-900 border-purple-500 border-2 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-pixel text-purple-300">Leaderboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 text-purple-300 font-pixel text-xs border-b border-purple-500 pb-2">
            <span>Rank</span>
            <span className="col-span-2">Grower</span>
            <span className="text-right">Score</span>
          </div>

          {/* Leaderboard Entries */}
          <div className="space-y-2">
            {LEADERBOARD_DATA.map((entry) => (
              <div
                key={entry.rank}
                className="grid grid-cols-4 gap-2 items-center bg-gray-800 rounded p-2 border border-gray-700"
              >
                <div className="flex items-center gap-1">
                  <span className={`font-pixel text-sm ${entry.color}`}>#{entry.rank}</span>
                  {entry.icon && <entry.icon className={`w-4 h-4 ${entry.color}`} />}
                </div>
                <span className="col-span-2 font-pixel text-sm text-white truncate">{entry.username}</span>
                <span className="font-pixel text-sm text-yellow-300 text-right">{entry.score.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 font-pixel text-xs pt-4 border-t border-gray-700">
            Rankings based on total potency score
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
