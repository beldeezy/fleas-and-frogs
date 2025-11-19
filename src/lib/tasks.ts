import { create } from "zustand";

export type TaskStage = "mindDump" | "prioritized" | "strategized";

export type TaskType = "flea" | "frog";

export type EisenhowerQuadrant =
  | "do" // important + urgent
  | "schedule" // important + not urgent
  | "delegate" // not important + urgent
  | "eliminate"; // not important + not urgent

export interface Task {
  id: number;
  label: string;
  stage: TaskStage;
  type?: TaskType;
  priorityId?: number | null;
  quadrant?: EisenhowerQuadrant | null;
}

export interface Priority {
  id: number;
  name: string;
}

interface TaskStore {
  tasks: Task[];
  priorities: Priority[];
  mindDumpConfirmed: boolean;
  addTask: (label: string) => void;
  confirmMindDump: () => void;
  setPriorities: (names: string[]) => void;
  assignTaskPriority: (taskId: number, priorityId: number) => void;
  setTaskQuadrant: (taskId: number, quadrant: EisenhowerQuadrant) => void;
}

const initialTasks: Task[] = [
  {
    id: 1,
    label: "Reply to an important message",
    stage: "mindDump",
  },
  {
    id: 2,
    label: "Outline weekly Fleas & Frogs workflow",
    stage: "mindDump",
  },
  {
    id: 3,
    label: "Tidy up one small workspace area",
    stage: "mindDump",
  },
];

// priorities will be user-defined after confirmation
const initialPriorities: Priority[] = [];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: initialTasks,
  priorities: initialPriorities,
  mindDumpConfirmed: false,

  addTask: (label: string) => {
    const current = get().tasks;
    const nextId = current.length ? Math.max(...current.map((t) => t.id)) + 1 : 1;
    set({
      tasks: [
        ...current,
        {
          id: nextId,
          label,
          stage: "mindDump",
          priorityId: null,
          quadrant: null,
        },
      ],
    });
  },

  confirmMindDump: () => {
    set({ mindDumpConfirmed: true });
  },

  setPriorities: (names: string[]) => {
    const priorities: Priority[] = names.map((name, index) => ({
      id: index + 1,
      name,
    }));
    set({ priorities });
  },

  assignTaskPriority: (taskId, priorityId) => {
    set({
      tasks: get().tasks.map((task) =>
        task.id === taskId
          ? { ...task, priorityId, stage: "prioritized" }
          : task
      ),
    });
  },

  setTaskQuadrant: (taskId, quadrant) => {
    set({
      tasks: get().tasks.map((task) =>
        task.id === taskId
          ? { ...task, quadrant, stage: "strategized" }
          : task
      ),
    });
  },
}));
