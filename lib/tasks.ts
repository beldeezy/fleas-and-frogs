export type TaskType = "flea" | "frog";

export interface Task {
  id: number;
  type: TaskType;
  label: string;
}

export const sampleTasks: Task[] = [
  { id: 1, type: "flea", label: "Reply to an important message" },
  { id: 2, type: "frog", label: "Outline weekly Fleas & Frogs workflow" },
  { id: 3, type: "flea", label: "Tidy up one small workspace area" },
];
