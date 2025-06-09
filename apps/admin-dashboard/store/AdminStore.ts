import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Updated interface to match your PlayerSchema more closely
export interface AdminUser {
  username: string;
  email: string;
  isAdmin: boolean;
  // You can add other relevant fields from PlayerSchema if needed for the admin dashboard
  // For example: seedLives?: number; lastSpinDate?: Date;
}

interface AdminStoreState {
  accessToken: string | null;
  adminUser: AdminUser | null;
  isHydrated: boolean; // Add hydration flag
  setAccessToken: (token: string | null) => void;
  setAdminUser: (user: AdminUser | null) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      adminUser: null,
      isHydrated: false,
      setAccessToken: (token) => set({ accessToken: token }),
      setAdminUser: (user) => set({ adminUser: user }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the adminUser, not the accessToken
      partialize: (state) => ({ adminUser: state.adminUser }),
      onRehydrateStorage: () => (state) => {
        // Set hydration flag when rehydration is complete
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Helper function to clear everything on logout
export const clearAdminSession = () => {
  const store = useAdminStore.getState();
  store.setAccessToken(null);
  store.setAdminUser(null);
  
  // Explicitly remove the localStorage item
  localStorage.removeItem('admin-auth-storage');
};