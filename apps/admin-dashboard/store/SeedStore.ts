import api from '@/lib/api';
import toast from 'react-hot-toast';
import { create } from 'zustand';

// Helper function (can be moved to a utility file if used elsewhere)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export interface Seed { // Exporting Seed interface
    id: string;
    name: string;
    description: string;
    waterDrainRate: number;
    nutrientDrainRate: number;
    imageUrl?: string;
    createdBy?: string;
    createdAt: string;
    _id?: string; // Keep _id if backend sends it, id is preferred
  }

// Interface for the data payload when updating a seed, image is optional base64 string
interface SeedUpdatePayload {
    name?: string;
    description?: string;
    waterDrainRate?: number;
    nutrientDrainRate?: number;
    image?: string; // base64 image string
}

interface SeedStoreState {
    seeds: Seed[];
    isLoading: boolean;
    fetchSeeds: () => Promise<void>;
    addSeed: (newSeed: Seed) => void; // This was a placeholder, full implementation would be similar to createSeed in component
    removeSeed: (seedId: string) => Promise<boolean>;
    updateSeed: (seedId: string, updatedData: SeedUpdatePayload) => Promise<boolean>;
    clearSeeds: () => void;
  }

  export const useSeedStore = create<SeedStoreState>((set, get) => ({
    seeds: [],
    isLoading: false,

    fetchSeeds: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get("/api/seeds");
            const fetchedSeeds = response.data.seeds.map((seed: any) => ({
              ...seed,
              id: seed._id,
            }));
            set({ seeds: fetchedSeeds, isLoading: false });
          } catch (error: any) {
            console.error("Detailed error fetching seeds:", {
              message: error.message,
              response: error.response ? {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers
              } : 'No response received',
              request: error.request ? error.request : 'No request object',
              config: error.config,
              rawErrorObject: error
            });
            toast.error(error.response?.data?.message || "Failed to fetch seeds. Check console for details.");
            set({ isLoading: false }); // Ensure loading is set to false on error
          }
    },
    addSeed: (newSeed) => set((state) => ({ // This is for direct local state update if needed.
        seeds: [...state.seeds, { ...newSeed, id: newSeed._id || newSeed.id }], // ensure id is set
      })),

    updateSeed: async (seedId: string, updatedData: SeedUpdatePayload) => {
        set({ isLoading: true });
        const toastId = toast.loading("Updating seed...");
        try {
          const response = await api.put(`/api/seeds/${seedId}`, updatedData);
          if (response.data.seed) {
            const updatedSeedFromServer = {
              ...response.data.seed,
              id: response.data.seed._id,
            };
            set((state) => ({
              seeds: state.seeds.map((s) => (s.id === seedId ? updatedSeedFromServer : s)),
            }));
            toast.success(response.data.message || "Seed updated successfully!", { id: toastId });
            set({ isLoading: false });
            return true;
          } else {
            toast.error(response.data.message || "Failed to update seed. Unexpected response.", { id: toastId });
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          console.error("Detailed error updating seed:", error);
          toast.error(error.response?.data?.message || "An error occurred while updating the seed.", { id: toastId });
          set({ isLoading: false });
          return false;
        }
      },

    removeSeed: async (seedId: string) => {
        set({ isLoading: true });
        const toastId = toast.loading("Deleting seed...");
        try {
          await api.delete(`/api/seeds/${seedId}`);
          set((state) => ({
            seeds: state.seeds.filter((s) => s.id !== seedId),
          }));
          toast.success("Seed deleted successfully!", { id: toastId });
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          console.error("Detailed error deleting seed:", error);
          toast.error(error.response?.data?.message || "An error occurred while deleting the seed.", { id: toastId });
          set({ isLoading: false });
          return false;
        }
      },
    clearSeeds: () => set({ seeds: [], isLoading: false }),
  }));