import { create } from "zustand";
import type { Priority } from "../../src/lib/schema/index";

import {
  getAllPriorities,
  addPriority as repoAddPriority,
  updatePriority as repoUpdatePriority,
  updatePrioritiesOrder as repoUpdatePrioritiesOrder,
  deletePriority as repoDeletePriority,
} from "../lib/db/priorities-repo";

type PriorityStore = {
  priorities: Priority[];
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  loadPriorities: () => Promise<void>;
  addPriority: (name: string) => Promise<void>;
  updatePriority: (priority: Priority) => Promise<void>;
  deletePriority: (id: string) => Promise<void>;
  reorderPriorities: (ordered: Priority[]) => Promise<void>;
};

export const usePriorityStore = create<PriorityStore>((set, get) => ({
  priorities: [],
  isLoading: false,
  error: null,
  hydrated: false,

  async loadPriorities() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const priorities = await getAllPriorities();
      set({ priorities, isLoading: false, hydrated: true });
    } catch (err) {
      console.error("loadPriorities failed", err);
      set({
        isLoading: false,
        hydrated: true, // we attempted; stop showing "loading"
        error:
          err instanceof Error ? err.message : "Failed to load priorities",
      });
    }
  },

  async addPriority(name) {
    set({ error: null });
    try {
      const created = await repoAddPriority({ name });
      set((state) => ({
        priorities: [...state.priorities, created],
      }));
    } catch (err) {
      console.error("addPriority failed", err);
      set({
        error:
          err instanceof Error ? err.message : "Failed to add priority",
      });
    }
  },

  async updatePriority(priority) {
    set({ error: null });
    try {
      const updated = await repoUpdatePriority(priority);
      set((state) => ({
        priorities: state.priorities.map((p) =>
          p.id === updated.id ? updated : p
        ),
      }));
    } catch (err) {
      console.error("updatePriority failed", err);
      set({
        error:
          err instanceof Error ? err.message : "Failed to update priority",
      });
    }
  },

  async deletePriority(id) {
    set({ error: null });

    const prev = get().priorities;
    const next = prev.filter((p) => p.id !== id);
    set({ priorities: next });

    try {
      await repoDeletePriority(id);
    } catch (err) {
      console.error("deletePriority failed; rolling back", err);
      set({ priorities: prev });
      set({
        error:
          err instanceof Error ? err.message : "Failed to delete priority",
      });
    }
  },

  async reorderPriorities(ordered) {
    set({ error: null });
    const prev = get().priorities;
    set({ priorities: ordered });

    try {
      await repoUpdatePrioritiesOrder(ordered);
    } catch (err) {
      console.error("reorderPriorities failed; rolling back", err);
      set({ priorities: prev });
      set({
        error:
          err instanceof Error
            ? err.message
            : "Failed to reorder priorities",
      });
    }
  },
}));
