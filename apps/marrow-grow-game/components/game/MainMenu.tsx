"use client"

import { useState } from "react"
import GameButton from "@/components/ui/GameButton"
import AuthModal from "@/components/auth/AuthModal"
import { LogIn } from "lucide-react"

interface MainMenuProps {
  onLogin: (user: { username: string; email: string; lives: number }, accessToken: string) => void
}

export default function MainMenu({ onLogin }: MainMenuProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-full relative z-10">
        <div className="flex flex-col gap-4 items-center">
          {/* Main Sign In Button */}
          <GameButton onClick={() => setIsAuthModalOpen(true)} className="w-64 h-14 text-xl" icon={<LogIn />}>
            SIGN IN
          </GameButton>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={onLogin} />
    </>
  )
}
