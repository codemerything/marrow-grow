"use client"
import Image from "next/image"
import Header from "@/components/layout/Header"
import MainMenu from "@/components/game/MainMenu"

interface GameScreenProps {
  onLogin: (user: { username: string; email: string; lives: number }, accessToken: string) => void
}

export default function GameScreen({ onLogin }: GameScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      {/* Game Widget Container */}
      <div className="relative w-[800px] h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-800">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image src="/images/bg1.png" alt="Marrow Grow Background" fill className="object-cover pixel-art" priority />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Header with Logo */}
        <Header />

        {/* Main Menu */}
        <MainMenu onLogin={onLogin} />
      </div>
    </div>
  )
}
