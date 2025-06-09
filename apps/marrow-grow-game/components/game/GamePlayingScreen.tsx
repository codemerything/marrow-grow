"use client"

import MainGameScreen from "@/components/game/MainGameScreen"

interface GamePlayingScreenProps {
  user: {
    username: string
    email: string
    lives: number
  }
  gameOptions: {
    seedType?: string
    soilType?: string
    defenseType?: string
    feedingSchedule?: any
  }
  onBackToDashboard: () => void
}

export default function GamePlayingScreen({ user, gameOptions, onBackToDashboard }: GamePlayingScreenProps) {
  return <MainGameScreen user={user} gameOptions={gameOptions} onBackToDashboard={onBackToDashboard} />
}
