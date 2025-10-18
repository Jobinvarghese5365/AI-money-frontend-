import { create } from "zustand";
import api from "../lib/api";

export const useBudget = create((set, get) => ({
  budget: { totalAmount: 0, bills: 0, debt: 0, savings: 0 },
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/budget");
      set({ budget: data, loading: false });
    } catch {
      set({ error: "Failed to load budget", loading: false });
    }
  },

  save: async (patch) => {
    const next = { ...get().budget, ...patch };
    set({ budget: next });
    await api.put("/budget", next);
  },
}));
