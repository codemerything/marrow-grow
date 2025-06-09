// store/gameStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Core Types ---
type GameState = "login" | "dashboard" | "selection" | "feeding" | "playing";

interface User {
  username: string;
  email: string;
  lives: number; // Corresponds to 'seedLives' from PlayerSchema
  lastSpinDate?: string;
}

// --- Detailed Option Interfaces ---
export interface SelectedSeed { // Exporting for use in GameSelection.tsx
  id: string; // The _id from your API
  name: string;
  description: string;
  imageUrl: string;
  waterDrainRate: number;
  nutrientDrainRate: number;
}

export interface SelectedSoil { // Exporting
  id: string;
  name: string;
  description: string;
  image: string;
  waterDrainRate: number; // Based on game.js logic
  nutrientDrainRate: number; // Based on game.js logic
}

export interface SelectedDefense { // Exporting
  id: string;
  name: string;
  description: string;
  image: string;
}

// GameOptions stores the selected items and the feeding schedule
export interface GameOptions { // Exporting for use elsewhere if needed
  selectedSeed?: SelectedSeed;
  selectedSoil?: SelectedSoil;
  selectedDefense?: SelectedDefense;
  feedingSchedule?: {
    month1: { amount: number; nutrient: string }; // 'nutrient' is the key/ID of the nutrient mix
    month2: { amount: number; nutrient: string };
    month3: { amount: number; nutrient: string };
  };
}

// --- GameStoreState Interface ---
interface GameStoreState {
  gameState: GameState;
  user: User | null;
  accessToken: string | null;
  gameOptions: GameOptions;
  actions: {
    loginUser: (userData: User, token: string) => void;
    logoutUser: () => void;
    setAccessToken: (token: string | null) => void;
    setUserData: (userData: Partial<User>) => void;
    updateUserLives: (newLives: number) => void;

    navigateToSelection: () => void;
    navigateToDashboard: () => void;
    navigateToFeeding: () => void;
    startGame: () => void;
    setGameState: (newState: GameState) => void;

    completeSelection: (options: {
      seed: SelectedSeed;
      soil: SelectedSoil;
      defense: SelectedDefense;
    }) => void;
    completeFeeding: (feedingOptions: Required<GameOptions>['feedingSchedule']) => void;
    resetGameOptions: () => void;
  };
}

// --- Create the Zustand Store ---
export const useGameStore = create(
  persist<GameStoreState>(
    (set, get) => ({
      // Initial State
      gameState: "login",
      user: null,
      accessToken: null,
      gameOptions: {},

      // Actions Implementation
      actions: {
        loginUser: (userData, token) => set({ user: userData, accessToken: token, gameState: "dashboard", gameOptions: {} }),
        logoutUser: () => set({ user: null, accessToken: null, gameState: "login", gameOptions: {} }),
        setAccessToken: (token) => set({ accessToken: token }),
        setUserData: (userData) => set((state) => ({ user: state.user ? { ...state.user, ...userData } : null })),
        updateUserLives: (newLives) => set((state) => {
          if (state.user) return { user: { ...state.user, lives: newLives } };
          return {};
        }),

        navigateToSelection: () => {
          if (get().user) set({ gameState: "selection" });
          else set({ gameState: "login" });
        },
        navigateToDashboard: () => {
          if (get().user) set({ gameState: "dashboard" });
          else set({ gameState: "login" });
        },
        navigateToFeeding: () => {
          if (get().user && get().gameOptions.selectedSeed && get().gameOptions.selectedSoil && get().gameOptions.selectedDefense) {
            set({ gameState: "feeding" });
          } else {
            console.warn("Cannot navigate to feeding: Missing selections or user.");
            set((state) => ({ gameState: state.user ? "selection" : "login" }));
          }
        },
        startGame: () => {
          if (get().user && get().gameOptions.feedingSchedule) {
             set({ gameState: "playing" });
          } else {
            console.warn("Cannot start game: Missing feeding schedule or user.");
            set((state) => ({ gameState: state.user ? "feeding" : "login" }));
          }
        },
        setGameState: (newState) => set({ gameState: newState }),

        completeSelection: (options) => {
          set((state) => ({ // Ensure state is correctly referenced
            gameOptions: {
              ...state.gameOptions, // Preserve existing gameOptions like feedingSchedule if set out of order
              selectedSeed: options.seed,
              selectedSoil: options.soil,
              selectedDefense: options.defense,
            },
            gameState: "feeding", // Transition to feeding screen
          }));
        },
        completeFeeding: (feedingOptions) => {
          set((state) => ({
            gameOptions: { ...state.gameOptions, feedingSchedule: feedingOptions },
          }));
        },
        resetGameOptions: () => set({ gameOptions: {} }),
      },
    }),
    {
      name: 'marrow-grow-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        gameState: state.gameState,
        gameOptions: state.gameOptions,
      }),
    }
  )
);