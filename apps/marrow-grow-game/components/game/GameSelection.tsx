// components/game/GameSelection.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import HelpMenu from "@/components/game/HelpMenu";
import DailySpinModal from "@/components/game/DailySpinModal";
import HowToPlayModal from "@/components/game/HowToPlayModal";
import LeaderboardModal from "@/components/game/LeaderboardModal";
import { useGameStore } from "@/stores/useGameStore";
// Import the detailed types from gameStore or a shared types file
import type { SelectedSeed, SelectedSoil, SelectedDefense } from "@/stores/useGameStore"; // Adjust path if needed

// API Seed Data structure (as returned by your API)
interface ApiSeedData {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  waterDrainRate: number;
  nutrientDrainRate: number;
  // other fields from API...
}

// --- Soil Data with Properties (based on game.js logic) ---
// Remember to replace placeholder image paths with your actual paths in /public
const SOIL_DATA: Record<string, SelectedSoil> = {
  "bone-dust": {
    id: "bone-dust",
    name: "Bone Dust", // Display name for "ossuary" logic from game.js
    description: "Favors nutrient retention.",
    image: "/soil/bone_dust.png", // EXAMPLE: Replace with actual path
    waterDrainRate: 0.5, // from ossuary in game.js
    nutrientDrainRate: 0.6, // from ossuary in game.js
  },
  "magic-moss": {
    id: "magic-moss",
    name: "Magic Moss", // Display name for "graveblend" logic from game.js
    description: "Favors water retention.",
    image: "/soil/magic_moss.png", // EXAMPLE: Replace with actual path
    waterDrainRate: 0.6, // from graveblend in game.js
    nutrientDrainRate: 0.4, // from graveblend in game.js
  },
  "eh-not-sure": {
    id: "eh-not-sure",
    name: "Eh.. Not sure", // Display name for "marrowmoss" logic from game.js
    description: "A balanced, mysterious mix.",
    image: "/soil/marrow_moss.png", // EXAMPLE: Replace with actual path
    waterDrainRate: 0.5, // from marrowmoss in game.js
    nutrientDrainRate: 0.5, // from marrowmoss in game.js
  },
};
const SOIL_OPTIONS_FOR_DISPLAY: SelectedSoil[] = Object.values(SOIL_DATA);

// --- Defense Data with Properties ---
// Remember to replace placeholder image paths
const DEFENSE_DATA: Record<string, SelectedDefense> = {
  grower: {
    id: "grower",
    name: "Grower",
    description: "Defends against pests", //
    image: "/defense/grower.png", // EXAMPLE: Replace with actual path
  },
  hound: {
    id: "hound",
    name: "Hound",
    description: "Defends against raiders", //
    image: "/defense/hound.png", // EXAMPLE: Replace with actual path
  },
  vault: {
    id: "vault",
    name: "Vault",
    description: "Protects your seeds", //
    image: "/defense/vault.png", // EXAMPLE: Replace with actual path
  },
};
const DEFENSE_OPTIONS_FOR_DISPLAY: SelectedDefense[] = Object.values(DEFENSE_DATA);


interface GameSelectionProps {
  user: { username: string; email: string; lives: number; };
  onBackToDashboard: () => void;
  onSelectionComplete: (options: {
    seed: SelectedSeed;
    soil: SelectedSoil;
    defense: SelectedDefense;
  }) => void;
}

type SelectionType = "seed" | "soil" | "defense";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function GameSelection({ user, onBackToDashboard, onSelectionComplete }: GameSelectionProps) {
  const [apiSeedOptions, setApiSeedOptions] = useState<ApiSeedData[]>([]);
  const [isLoadingSeeds, setIsLoadingSeeds] = useState(true);
  const [errorSeeds, setErrorSeeds] = useState<string | null>(null);

  const [selectedSeedObj, setSelectedSeedObj] = useState<SelectedSeed | null>(null);
  const [selectedSoilObj, setSelectedSoilObj] = useState<SelectedSoil | null>(null);
  const [selectedDefenseObj, setSelectedDefenseObj] = useState<SelectedDefense | null>(null);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isDailySpinModalOpen, setIsDailySpinModalOpen] = useState(false);
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const accessToken = useGameStore((state) => state.accessToken);
  const actions = useGameStore((state) => state.actions);

  useEffect(() => {
    const fetchSeeds = async () => {
      setIsLoadingSeeds(true);
      setErrorSeeds(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/seeds`, { // Ensure this is your correct API endpoint for seeds
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch seeds: ${response.statusText}`);
        const data = await response.json();
        // Assuming API returns { seeds: [...] } or just [...]
        setApiSeedOptions(data.seeds || data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorSeeds(error.message);
        } else {
          setErrorSeeds("An unknown error occurred");
        }
        console.error("Error fetching seeds:", error);
      } finally {
        setIsLoadingSeeds(false);
      }
    };
    fetchSeeds();
  }, [accessToken]);

  const handleSelection = (type: SelectionType, item: ApiSeedData | SelectedSoil | SelectedDefense) => {
    switch (type) {
      case "seed":
        const seedData = item as ApiSeedData;
        setSelectedSeedObj({
          id: seedData._id,
          name: seedData.name,
          description: seedData.description,
          imageUrl: seedData.imageUrl,
          waterDrainRate: seedData.waterDrainRate,
          nutrientDrainRate: seedData.nutrientDrainRate,
        });
        break;
      case "soil":
        setSelectedSoilObj(item as SelectedSoil);
        break;
      case "defense":
        setSelectedDefenseObj(item as SelectedDefense);
        break;
    }
  };

  const handleBeginRitual = () => {
    if (selectedSeedObj && selectedSoilObj && selectedDefenseObj) {
      onSelectionComplete({
        seed: selectedSeedObj,
        soil: selectedSoilObj,
        defense: selectedDefenseObj,
      });
    }
  };

  const toggleHelpMenu = () => setIsHelpMenuOpen(!isHelpMenuOpen);

  // Modal Handlers
  const handleOpenDailySpin = () => setIsDailySpinModalOpen(true);
  const handleCloseDailySpin = () => setIsDailySpinModalOpen(false);
  const handleOpenHowToPlay = () => setIsHowToPlayModalOpen(true);
  const handleCloseHowToPlay = () => setIsHowToPlayModalOpen(false);
  const handleOpenLeaderboard = () => setIsLeaderboardModalOpen(true);
  const handleCloseLeaderboard = () => setIsLeaderboardModalOpen(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="relative w-[800px] h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-800">
        <div className="absolute inset-0">
          <Image src="/images/bg3.png" alt="Marrow Grow Lab" fill className="object-cover pixel-art" priority /> {/* */}
        </div>
        <Header />

        {/* Modals */}
        <DailySpinModal isOpen={isDailySpinModalOpen} onClose={handleCloseDailySpin} canSpin={true} onSpinComplete={() => console.log('Daily spin completed')} />
        <HowToPlayModal isOpen={isHowToPlayModalOpen} onClose={handleCloseHowToPlay} />
        <LeaderboardModal isOpen={isLeaderboardModalOpen} onClose={handleCloseLeaderboard} />
        <div className="absolute top-4 left-20 z-10">
          <Button onClick={onBackToDashboard} className="bg-gray-600 hover:bg-gray-700 border-2 border-gray-500 font-pixel text-sm px-4 py-2">
            <ArrowLeft size={16} className="mr-2 text-yellow-300" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={toggleHelpMenu}
            className="bg-orange-500 hover:bg-orange-600 border-2 border-orange-400 font-pixel text-xs px-3 py-1 text-black"
          >
            HELP
          </Button>
        </div>
        {isHelpMenuOpen && <HelpMenu
          user={user}
          onClose={() => setIsHelpMenuOpen(false)}
          onLogoutClick={actions.logoutUser}
          onDailySpinClick={handleOpenDailySpin}
          onHowToPlayClick={handleOpenHowToPlay}
          onLeaderboardClick={handleOpenLeaderboard}
        />}

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[550px] sm:w-[500px]">
          <div className="bg-gray-900/90 border-2 border-gray-800 rounded-lg p-4 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-3">
              {/* Seed Selection */}
              <div className="space-y-2">
                <h3 className="font-pixel text-center text-white text-xs mb-2">Seed Selection</h3>
                <div className="space-y-2">
                  {isLoadingSeeds ? <p className="font-pixel text-center text-gray-400 text-xs">Loading seeds...</p>
                    : errorSeeds ? <p className="font-pixel text-center text-red-400 text-xs">Error: {errorSeeds}</p>
                      : apiSeedOptions.length === 0 ? <p className="font-pixel text-center text-gray-400 text-xs">No seeds available.</p>
                        : apiSeedOptions.map((option) => (
                          <div
                            key={option._id}
                            onClick={() => handleSelection("seed", option)}
                            className={`bg-gray-800 border-2 ${selectedSeedObj?.id === option._id ? "border-cyan-500" : "border-gray-700"} rounded p-2 cursor-pointer hover:bg-gray-700 transition-colors`}
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 mb-1 relative">
                                <Image src={option.imageUrl} alt={option.name} fill className="object-contain pixel-art" unoptimized />
                              </div>
                              <p className="font-pixel text-cyan-300 text-xs text-center">{option.name}</p>
                            </div>
                          </div>
                        ))}
                </div>
              </div>

              {/* Soil Selection */}
              <div className="space-y-2">
                <h3 className="font-pixel text-center text-white text-xs mb-2">Soil Selection</h3>
                <div className="space-y-2">
                  {SOIL_OPTIONS_FOR_DISPLAY.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleSelection("soil", option)}
                      className={`bg-gray-800 border-2 ${selectedSoilObj?.id === option.id ? "border-purple-500" : "border-gray-700"} rounded p-2 cursor-pointer hover:bg-gray-700 transition-colors`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-1 relative">
                          <Image src={option.image} alt={option.name} fill className="object-contain pixel-art" />
                        </div>
                        <p className="font-pixel text-purple-300 text-xs text-center">{option.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defense Selection */}
              <div className="space-y-2">
                <h3 className="font-pixel text-center text-white text-xs mb-2">Defense Selection</h3>
                <div className="space-y-2">
                  {DEFENSE_OPTIONS_FOR_DISPLAY.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleSelection("defense", option)}
                      className={`bg-gray-800 border-2 ${selectedDefenseObj?.id === option.id ? "border-red-500" : "border-gray-700"} rounded p-2 cursor-pointer hover:bg-gray-700 transition-colors`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-1 relative">
                          <Image src={option.image} alt={option.name} fill className="object-contain pixel-art" />
                        </div>
                        <p className="font-pixel text-red-300 text-xs text-center">{option.name}</p>
                        <p className="font-pixel text-gray-400 text-[8px] text-center">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                onClick={handleBeginRitual}
                disabled={!selectedSeedObj || !selectedSoilObj || !selectedDefenseObj || isLoadingSeeds}
                className="bg-yellow-600 hover:bg-yellow-500 text-black font-pixel text-sm px-6 py-2 border-2 border-yellow-700"
              >
                Begin the Ritual
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}