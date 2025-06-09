import api from "@/lib/api";
import {create } from "zustand";

export interface LeaderboardEntry {
    _id: string; // The backend uses _id for the player
    username: string; // Player name
    totalYield?: number; // For all-time
    avgPotency?: number; // For all-time
    growCount?: number; // For all-time
    weeklyYield?: number; // For weekly
    weeklyPotency?: number; // For weekly
    weeklyGrowCount?: number; // For weekly
    monthlyYield?: number; // For monthly
    monthlyPotency?: number; // For monthly
    monthlyGrowCount?: number; // For monthly
    rank?: number;
}

interface LeaderboardStoreState {
    weeklyLeaderboard: LeaderboardEntry[];
    monthlyLeaderboard: LeaderboardEntry[];
    allTimeLeaderboard: LeaderboardEntry[];
    loading: {
        weekly: boolean;
        monthly: boolean;
        allTime: boolean;
    };
    error: {
        weekly: string | null;
        monthly: string | null;
        allTime: string | null;
    };
    fetchWeeklyLeaderboard: () => Promise<void>;
    fetchMonthlyLeaderboard: () => Promise<void>;
    fetchAllTimeLeaderboard: () => Promise<void>;
    clearLeaderboard: (type: 'weekly' | 'monthly' | 'allTime') => Promise<void>;
}
    
export const useLeaderboardStore = create<LeaderboardStoreState>((set) => ({
weeklyLeaderboard: [],
monthlyLeaderboard: [],
allTimeLeaderboard: [],
loading: {
    weekly: false,
    monthly: false,
    allTime: false,
},
error: {
    weekly: null,
    monthly: null,
    allTime: null,
},

fetchWeeklyLeaderboard: async () => {
    set((state) => ({
        loading: {
            ...state.loading,
            weekly: true,
        },
        error: {
            ...state.error,
            weekly: null,
        },
    }))
    try {
        const response = await api.get("/api/leaderboard/weekly");
        const data: LeaderboardEntry[] = response.data;
        const rankedData = data.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
        set((state) => ({
            weeklyLeaderboard: rankedData,
            loading: {
                ...state.loading,
                weekly: false,
            },
        }))
    } catch (error: any) {
        set((state) => ({ error: { ...state.error, weekly: error.message }, loading: { ...state.loading, weekly: false } }));
        console.error("Failed to fetch weekly leaderboard:", error);
      }
},

fetchMonthlyLeaderboard: async () => {
    set((state) => ({
        loading: {
            ...state.loading,
            monthly: true,
        },
        error: {
            ...state.error,
            monthly: null,
        },
    }))
    try {   
        const response = await api.get("/api/leaderboard/monthly");
        const data: LeaderboardEntry[] = response.data;
        const rankedData = data.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
        set((state) => ({
            monthlyLeaderboard: rankedData,
            loading: {
                ...state.loading,
                monthly: false,
            },
        }))
    } catch (error: any) {
        set((state) => ({ error: { ...state.error, monthly: error.message }, loading: { ...state.loading, monthly: false } }));
        console.error("Failed to fetch monthly leaderboard:", error);
      }
},
fetchAllTimeLeaderboard: async () => {
    set((state) => ({
        loading: {
            ...state.loading,
            allTime: true,
        },
        error: {
            ...state.error,
            allTime: null,
        },
    }))
    try {
        const response = await api.get("/api/leaderboard/alltime");
        const data: LeaderboardEntry[] = response.data;
        const rankedData = data.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
        set((state) => ({
            allTimeLeaderboard: rankedData,
            loading: {
                ...state.loading,
                allTime: false,
            },
        }))
    } catch (error: any) {
        set((state) => ({ error: { ...state.error, allTime: error.message }, loading: { ...state.loading, allTime: false } }));
        console.error("Failed to fetch all-time leaderboard:", error);
      }
    
},
clearLeaderboard: async (type: 'weekly' | 'monthly' | 'allTime') => {
    try {
        const response = await api.delete("/leaderboard/clear");
        if(!response){
            throw new Error("Failed to clear leaderboard");
        }

        if (type === 'allTime') {
            set({
                allTimeLeaderboard: [],
            });
            useLeaderboardStore.getState().fetchAllTimeLeaderboard();
        } else if (type === 'weekly') {
            set({ weeklyLeaderboard: [] });
        } else if (type === 'monthly') {
            set({ monthlyLeaderboard: [] });
        }
    } catch (error) {
        console.error("Failed to clear leaderboard:", error);
    }

}
}));