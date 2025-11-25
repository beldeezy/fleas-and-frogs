import { create } from "zustand";
import type { Task, EisenhowerValue } from "../../src/lib/schema/index";

import {
  computePrioritizedTasks,
  groupTasksByEisenhower,
} from "../lib/tasks/logic";

import {
  type NewTaskInput,
  getAllTasks,
  addTask,
  updateTask as _repoUpdateTask,
  setTaskPriority as _repoSetTaskPriority,
  setTaskEisenhower as _repoSetTaskEisenhower,
  deleteTask as _repoDeleteTask,
} from "../lib/db/tasks-repo";

// 🔧 Loosen repo typings where needed
const repoUpdateTask: any = _repoUpdateTask;
const repoSetTaskPriority: any = _repoSetTaskPriority;
const repoSetTaskEisenhower: any = _repoSetTaskEisenhower;
const repoDeleteTask: any = _repoDeleteTask;

export type TaskPriority = string | null;

// 🔒 Small helpers to keep state safe and predictable
const safeDeleteTask = (tasks: Task[], id: string): Task[] => {
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length) {
    console.warn("safeDeleteTask: no task with id", id);
    return tasks;
  }
  return next;
};

const safeReplaceTask = (tasks: Task[], saved: Task): Task[] => {
  let found = false;
  const next = tasks.map((t) => {
    if (t.id === saved.id) {
      found = true;
      return saved;
    }
    return t;
  });

  if (!found) {
    console.warn("safeReplaceTask: no task with id", saved.id);
    return tasks;
  }
  return next;
};

type TaskStore = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  // 👇 computed views that use pure logic helpers
  prioritizedTasks: () => Task[];
  eisenhowerBuckets: () => Record<EisenhowerValue | "none", Task[]>;

  loadTasks: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  setTaskPriority: (id: string, priorityId: TaskPriority) => Promise<void>;
  setTaskEisenhower: (id: string, value: EisenhowerValue) => Promise<void>;

  clearError: () => void;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  hydrated: false,

  // 👇 These two just delegate to the helpers in src/lib/tasks/logic.ts
  prioritizedTasks: () => computePrioritizedTasks(get().tasks),
  eisenhowerBuckets: () => groupTasksByEisenhower(get().tasks),

  clearError: () => set({ error: null }),

  async loadTasks() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const allTasks = await getAllTasks();

      // 🧹 Identify legacy tasks from the old Inbox / pre-areaId days
      const legacyInboxTasks = allTasks.filter(
        (t) => t.areaId === "inbox" || !t.areaId
      );

      // Keep everything else
      const tasks = allTasks.filter(
        (t) => !(t.areaId === "inbox" || !t.areaId)
      );

      // Try to delete legacy tasks from the DB so they never come back
      if (legacyInboxTasks.length) {
        try {
          await Promise.all(legacyInboxTasks.map((t) => repoDeleteTask(t.id)));
          console.log(
            `Cleaned up ${legacyInboxTasks.length} legacy inbox tasks`
          );
        } catch (cleanupErr) {
          console.warn(
            "Failed to fully clean legacy inbox tasks",
            cleanupErr
          );
        }
      }

      set({
        tasks: Array.isArray(tasks) ? tasks : [],
        isLoading: false,
        hydrated: true,
        error: null,
      });
    } catch (err) {
      console.error("loadTasks failed", err);
      set({
        isLoading: false,
        hydrated: true, // we tried; stop showing "loading"
        tasks: [],
        error:
          err instanceof Error ? err.message : "Failed to load tasks",
      });
    }
  },

  async addTask(input) {
    const prevTasks = get().tasks ?? [];
    set({ isLoading: true, error: null });

    try {
      const created = await addTask(input);
      if (!created) {
        throw new Error("addTask: repo returned no task");
      }

      set({
        tasks: [...prevTasks, created],
        isLoading: false,
      });
    } catch (err) {
      console.error("addTask failed", err);
      set({
        tasks: prevTasks,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to add task",
      });
    }
  },

  async updateTask(id, patch) {
    const prevTasks = get().tasks ?? [];
    if (!prevTasks.length) {
      console.warn("updateTask: no tasks in store");
      return;
    }

    const existing = prevTasks.find((t) => t.id === id);
    if (!existing) {
      console.warn("updateTask: no task with id", id);
      return;
    }

    // 🔁 Local merged version (what we *intend* the task to become)
    const localUpdated: Task = { ...existing, ...patch };

    // ✅ Optimistic local update (no mutation)
    set({
      tasks: prevTasks.map((t) => (t.id === id ? localUpdated : t)),
      isLoading: true,
      error: null,
    });

    try {
      // Repo wants a full Task and returns the saved version
      const saved: Task = await repoUpdateTask(localUpdated);

      // ✅ Replace with whatever the DB actually saved
      set((state) => ({
        tasks: safeReplaceTask(state.tasks ?? [], saved),
        isLoading: false,
      }));
    } catch (err) {
      console.error("updateTask failed; rolling back", err);
      set({
        tasks: prevTasks,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to update task",
      });
    }
  },


  async deleteTask(id) {
    const prevTasks = get().tasks ?? [];
    set({ isLoading: true, error: null });

    const optimistic = safeDeleteTask(prevTasks, id);
    set({ tasks: optimistic });

    try {
      await repoDeleteTask(id);
      set({ isLoading: false });
    } catch (err) {
      console.error("deleteTask failed; rolling back", err);
      set({
        tasks: prevTasks,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to delete task",
      });
    }
  },

  async setTaskPriority(id, priorityId) {
    const prevTasks = get().tasks ?? [];
    set({ isLoading: true, error: null });

    // ✅ Optimistic update of priorityId
    const optimistic = prevTasks.map((t) =>
      t.id === id
        ? { ...t, priorityId: priorityId ?? undefined }
        : t
    );
    set({ tasks: optimistic });

    try {
      // Repo will read, merge, and return a full Task
      const updated: Task = await repoSetTaskPriority(id, priorityId);

      set((state) => ({
        tasks: safeReplaceTask(state.tasks ?? [], updated),
        isLoading: false,
      }));
    } catch (err) {
      console.error("setTaskPriority failed; rolling back", err);
      set({
        tasks: prevTasks,
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to set task priority",
      });
    }
  },


  async setTaskEisenhower(id, value) {
    const prevTasks = get().tasks ?? [];
    set({ isLoading: true, error: null });

    // ✅ Optimistic update of Eisenhower quadrant
    const optimistic = prevTasks.map((t) =>
      t.id === id ? { ...t, eisenhower: value ?? undefined } : t
    );
    set({ tasks: optimistic });

    try {
      // Repo reads, merges, and returns a full Task
      const updated: Task = await repoSetTaskEisenhower(id, value);

      set((state) => ({
        tasks: safeReplaceTask(state.tasks ?? [], updated),
        isLoading: false,
      }));
    } catch (err) {
      console.error("setTaskEisenhower failed; rolling back", err);
      set({
        tasks: prevTasks,
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to set Eisenhower value",
      });
    }
  },

}));
