"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Header from "@/components/layout/Header"
import DashboardMenu from "@/components/game/DashboardMenu"
import DailySpinModal from "@/components/game/DailySpinModal"
import LeaderboardModal from "@/components/game/LeaderboardModal"
import HowToPlayModal from "@/components/game/HowToPlayModal"

interface GameDashboardProps {
  user: {
    username: string
    email: string
    lives: number
    lastSpinDate?: string
  }
  onPlayClick: () => void
  onLogout: () => void
  onUpdateLives: (newLives: number) => void
}

export default function GameDashboard({ user, onPlayClick, onLogout, onUpdateLives }: GameDashboardProps) {
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)
  const [canSpin, setCanSpin] = useState(false)
  const [localLives, setLocalLives] = useState(user.lives)

  // Check if user can spin based on localStorage data
  useEffect(() => {
    // Check if user can spin today (24-hour cooldown)
    const checkSpinEligibility = () => {
      const lastSpinDate = localStorage.getItem('lastSpinDate')

      if (!lastSpinDate) {
        setCanSpin(true)
        return
      }

      const lastSpin = new Date(lastSpinDate)
      const now = new Date()
      const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60)

      // Allow spin if 24 hours have passed since last spin
      setCanSpin(hoursSinceLastSpin >= 24)
    }

    // Load seed lives from localStorage or use default from user prop
    const loadSeedLives = () => {
      const storedLives = localStorage.getItem('seedLives')
      if (storedLives) {
        setLocalLives(parseInt(storedLives))
      } else {
        // Initialize localStorage with current lives
        localStorage.setItem('seedLives', user.lives.toString())
      }
    }

    checkSpinEligibility()
    loadSeedLives()

    // Check eligibility every minute in case the 24-hour period expires while user is on the page
    const intervalId = setInterval(checkSpinEligibility, 60000)

    return () => clearInterval(intervalId)
  }, [user.lives])

  const handleSpinComplete = (awardedLives: number) => {
    if (awardedLives > 0) {
      // Update lives in localStorage
      const newLives = localLives + awardedLives
      localStorage.setItem('seedLives', newLives.toString())
      setLocalLives(newLives)

      // Also update parent component state
      onUpdateLives(newLives)
    }

    // Update spin status
    setCanSpin(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      {/* Game Widget Container */}
      <div className="relative w-[800px] h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-800">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image src="/images/bg2.png" alt="Marrow Grow Forest" fill className="object-cover pixel-art" priority />
        </div>

        {/* Header with Logo */}
        <Header />

        {/* Main Dashboard with User Info */}
        <DashboardMenu
          user={{ ...user, lives: localLives }} // Use local lives from localStorage
          canSpinToday={canSpin}
          onDailySpinClick={() => setIsSpinModalOpen(true)}
          onHowToPlayClick={() => setIsHowToPlayOpen(true)}
          onLeaderboardClick={() => setIsLeaderboardOpen(true)}
          onPlayClick={onPlayClick}
          onLogout={onLogout}
        />

        {/* Modals */}
        <DailySpinModal
          isOpen={isSpinModalOpen}
          onClose={() => setIsSpinModalOpen(false)}
          canSpin={canSpin}
          onSpinComplete={handleSpinComplete}
        />

        <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />

        <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
      </div>
    </div>
  )
}
