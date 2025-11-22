// src/store/calendarStore.ts
import { create } from "zustand";
import type {
  CalendarBlock,
  NewCalendarBlockInput,
} from "../../src/lib/schema/index";

import {
  getAllCalendarBlocks,
  addCalendarBlock,
  updateCalendarBlock as _repoUpdateCalendarBlock,
  deleteCalendarBlock as _repoDeleteCalendarBlock,
} from "../lib/db/calendar-blocks-repo";

// Loosen types if needed to match your repo implementation
const repoUpdateCalendarBlock: any = _repoUpdateCalendarBlock;
const repoDeleteCalendarBlock: any = _repoDeleteCalendarBlock;

// Small helpers
const safeDeleteBlock = (blocks: CalendarBlock[], id: string): CalendarBlock[] => {
  const next = blocks.filter((b) => b.id !== id);
  if (next.length === blocks.length) {
    console.warn("safeDeleteBlock: no block with id", id);
    return blocks;
  }
  return next;
};

const safeReplaceBlock = (
  blocks: CalendarBlock[],
  saved: CalendarBlock
): CalendarBlock[] => {
  let found = false;
  const next = blocks.map((b) => {
    if (b.id === saved.id) {
      found = true;
      return saved;
    }
    return b;
  });

  if (!found) {
    console.warn("safeReplaceBlock: no block with id", saved.id);
    return blocks;
  }
  return next;
};

type CalendarStore = {
  blocks: CalendarBlock[];
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  loadBlocks: () => Promise<void>;
  addBlock: (input: NewCalendarBlockInput) => Promise<void>;
  updateBlock: (id: string, patch: Partial<CalendarBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;

  clearError: () => void;
};

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  blocks: [],
  isLoading: false,
  error: null,
  hydrated: false,

  clearError: () => set({ error: null }),

  async loadBlocks() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const allBlocks = await getAllCalendarBlocks();

      set({
        blocks: Array.isArray(allBlocks) ? allBlocks : [],
        isLoading: false,
        hydrated: true,
        error: null,
      });
    } catch (err) {
      console.error("loadBlocks failed", err);
      set({
        blocks: [],
        isLoading: false,
        hydrated: true,
        error:
          err instanceof Error ? err.message : "Failed to load calendar blocks",
      });
    }
  },

  async addBlock(input) {
    const prevBlocks = get().blocks ?? [];
    set({ isLoading: true, error: null });
  
    try {
      console.log("[calendarStore.addBlock] input", input);
      const created = await addCalendarBlock(input);
      if (!created) throw new Error("addBlock: repo returned no block");
  
      set({
        blocks: [...prevBlocks, created],
        isLoading: false,
      });
    } catch (err) {
      console.error("[calendarStore.addBlock] failed", err);
      set({
        blocks: prevBlocks,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to add calendar block",
      });
    }
  },
  
  async updateBlock(id, patch) {
    const prevBlocks = get().blocks ?? [];
    if (!prevBlocks.length) {
      console.warn("updateBlock: no blocks in store");
      return;
    }
  
    const existing = prevBlocks.find((b) => b.id === id);
    if (!existing) {
      console.warn("updateBlock: no block with id", id);
      return;
    }
  
    const localUpdated: CalendarBlock = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
  
    const optimistic = prevBlocks.map((b) =>
      b.id === id ? localUpdated : b
    );
  
    console.log("[calendarStore.updateBlock] optimistic", localUpdated);
  
    set({ blocks: optimistic, isLoading: true, error: null });
  
    try {
      const saved: CalendarBlock = await repoUpdateCalendarBlock(localUpdated);
      set((state) => ({
        blocks: safeReplaceBlock(state.blocks ?? [], saved),
        isLoading: false,
      }));
    } catch (err) {
      console.error("[calendarStore.updateBlock] failed; rolling back", err);
      set({
        blocks: prevBlocks,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to update calendar block",
      });
    }
  },
  

  async deleteBlock(id) {
    const prevBlocks = get().blocks ?? [];
    set({ isLoading: true, error: null });

    const optimistic = safeDeleteBlock(prevBlocks, id);
    set({ blocks: optimistic });

    try {
      await repoDeleteCalendarBlock(id);
      set({ isLoading: false });
    } catch (err) {
      console.error("deleteBlock failed; rolling back", err);
      set({
        blocks: prevBlocks,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to delete calendar block",
      });
    }
  },
}));
