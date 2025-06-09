// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import GameScreen from "@/components/game/GameScreen";
import GameDashboard from "@/components/game/GameDashboard";
import GameSelection from "@/components/game/GameSelection";
import FeedingScheduleScreen from "@/components/game/FeedingScheduleScreen";
import GamePlayingScreen from "@/components/game/GamePlayingScreen"; // Your component
import { useGameStore } from "@/stores/useGameStore";
import type { GameOptions as StoreGameOptions } from "@/stores/useGameStore";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  const gameState = useGameStore((state) => state.gameState);
  const user = useGameStore((state) => state.user);
  const gameOptions = useGameStore((state) => state.gameOptions); // <-- Select gameOptions here
  const actions = useGameStore((state) => state.actions);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game Starting! All Selected Options (from app/page.tsx):", JSON.parse(JSON.stringify(gameOptions)));
      // Using JSON.parse(JSON.stringify(...)) helps in getting a clean, deep copy for logging
      // and ensures nested objects are fully expanded in some browser consoles.
    }
  }, [gameState, gameOptions]); // Re-run if gameState or gameOptions change


  if (!isHydrated) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a202c' }}><p style={{ color: '#c9c9c9', fontSize: '1.5rem' }}>Loading Game...</p></div>;
  }

  switch (gameState) {
    case "login":
      return <GameScreen onLogin={(userData, token) => actions.loginUser(userData, token)} />;

    case "dashboard":
      return user ? (
        <GameDashboard
          user={user}
          onPlayClick={actions.navigateToSelection}
          onLogout={actions.logoutUser}
          onUpdateLives={actions.updateUserLives}
        />
      ) : <GameScreen onLogin={(userData, token) => actions.loginUser(userData, token)} />;

    case "selection":
      return user ? (
        <GameSelection
          user={user}
          onBackToDashboard={actions.navigateToDashboard}
          onSelectionComplete={(options) => {
            actions.completeSelection(options);
          }}
        />
      ) : <GameScreen onLogin={(userData, token) => actions.loginUser(userData, token)} />;

    case "feeding":
      if (!user) return <GameScreen onLogin={(userData, token) => actions.loginUser(userData, token)} />;
      return (
        <FeedingScheduleScreen
          user={user}
          gameOptions={gameOptions}
          onScheduleConfirm={(scheduleData: Required<StoreGameOptions>['feedingSchedule']) => {
            actions.completeFeeding(scheduleData);
            actions.startGame();
          }}
          onBack={actions.navigateToSelection}
        />
      );

    case "playing": // Focus on this case
      if (!user || !gameOptions.selectedSeed) { // Add a check for essential gameOptions too
        // If user is lost or essential game options are missing, redirect to an appropriate state
        console.warn("User or essential game options missing for 'playing' state. Redirecting.");
        actions.navigateToDashboard(); // Or actions.navigateToSelection() or actions.logoutUser()
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a202c' }}><p style={{ color: '#c9c9c9', fontSize: '1.5rem' }}>Redirecting...</p></div>; // Or a loading state
      }
      return ( // No longer conditionally rendering based on user here, as it's checked above
        <GamePlayingScreen
          user={user}                          // <-- Pass the user prop
          gameOptions={gameOptions}            // <-- Pass the gameOptions prop
          onBackToDashboard={actions.navigateToDashboard}
        />
      );

    default:
      return <GameScreen onLogin={(userData, token) => actions.loginUser(userData, token)} />;
  }
}