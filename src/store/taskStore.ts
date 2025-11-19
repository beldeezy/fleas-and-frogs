import { create } from "zustand";
import type { Task, EisenhowerValue } from "../../src/lib/schema/index";

import {
  type NewTaskInput,
  getAllTasks,
  addTask,
  updateTask as _repoUpdateTask,
  setTaskPriority as _repoSetTaskPriority,
  setTaskEisenhower as _repoSetTaskEisenhower,
  // deleteTask as _repoDeleteTask,
} from "../lib/db/tasks-repo";

// 🔧 Loosen repo typings where needed
const repoUpdateTask: any = _repoUpdateTask;
const repoSetTaskPriority: any = _repoSetTaskPriority;
const repoSetTaskEisenhower: any = _repoSetTaskEisenhower;
// const repoDeleteTask: any = _repoDeleteTask;

export type TaskPriority = string | null;

type TaskStore = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  loadTasks: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask?: (id: string) => Promise<void>;

  setTaskPriority: (id: string, priorityId: TaskPriority) => Promise<void>;
  setTaskEisenhower: (id: string, value: EisenhowerValue) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  hydrated: false,

  async loadTasks() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const tasks = await getAllTasks();
      set({ tasks, isLoading: false, hydrated: true });
    } catch (err) {
      console.error("loadTasks failed", err);
      set({
        isLoading: false,
        hydrated: true, // we tried; stop showing "loading"
        error:
          err instanceof Error ? err.message : "Failed to load tasks",
      });
    }
  },

  async addTask(input) {
    set({ error: null });
    try {
      const created = await addTask(input);
      set((state) => ({
        tasks: [...state.tasks, created],
      }));
    } catch (err) {
      console.error("addTask failed", err);
      set({
        error:
          err instanceof Error ? err.message : "Failed to add task",
      });
    }
  },

  async updateTask(id, patch) {
    set({ error: null });

    const prevTasks = get().tasks;
    const idx = prevTasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      console.warn("updateTask: no task with id", id);
      return;
    }

    const existing = prevTasks[idx];
    const updatedTask: Task = { ...existing, ...patch };

    // ✅ Optimistic local update
    const optimistic = [...prevTasks];
    optimistic[idx] = updatedTask;
    set({ tasks: optimistic });

    try {
      // ✅ Repo expects a full Task object
      const saved: Task = await repoUpdateTask(updatedTask);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? saved : t)),
      }));
    } catch (err) {
      console.error("updateTask failed; rolling back", err);
      set({ tasks: prevTasks });
      set({
        error:
          err instanceof Error ? err.message : "Failed to update task",
      });
    }
  },

  // async deleteTask(id) {
  //   set({ error: null });
  //   const prevTasks = get().tasks;
  //   const nextTasks = prevTasks.filter((t) => t.id !== id);
  //   set({ tasks: nextTasks });
  //
  //   try {
  //     await repoDeleteTask(id);
  //   } catch (err) {
  //     console.error("deleteTask failed; rolling back", err);
  //     set({ tasks: prevTasks });
  //     set({
  //       error:
  //         err instanceof Error ? err.message : "Failed to delete task",
  //     });
  //   }
  // },

  async setTaskPriority(id, priorityId) {
    set({ error: null });

    const prevTasks = get().tasks;

    // ✅ Optimistic update uses the correct field: priorityId
    const optimistic = prevTasks.map((t) =>
      t.id === id
        ? { ...t, priorityId: priorityId ?? undefined }
        : t
    );
    set({ tasks: optimistic });

    try {
      const updated: Task = await repoSetTaskPriority(id, priorityId);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? updated : t
        ),
      }));
    } catch (err) {
      console.error("setTaskPriority failed; rolling back", err);
      set({ tasks: prevTasks });
      set({
        error:
          err instanceof Error
            ? err.message
            : "Failed to set task priority",
      });
    }
  },

  async setTaskEisenhower(id, value) {
    set({ error: null });

    const prevTasks = get().tasks;
    const optimistic = prevTasks.map((t) =>
      t.id === id ? { ...t, eisenhower: value ?? undefined } : t
    );
    set({ tasks: optimistic });

    try {
      const updated: Task = await repoSetTaskEisenhower(id, value);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? updated : t
        ),
      }));
    } catch (err) {
      console.error("setTaskEisenhower failed; rolling back", err);
      set({ tasks: prevTasks });
      set({
        error:
          err instanceof Error
            ? err.message
            : "Failed to set Eisenhower value",
      });
    }
  },
}));
