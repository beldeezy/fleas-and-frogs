// src/lib/tasks/logic.ts
import type { Task, EisenhowerValue } from "../schema";

// 1. Filter out completed tasks
export function getIncompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.completed);
}

// 2. Sort by priority (highest first)
export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aP = a.priorityId ?? "";
    const bP = b.priorityId ?? "";
    return aP.localeCompare(bP);
  });
}

// 3. Combine both: incomplete + sorted
export function computePrioritizedTasks(tasks: Task[]): Task[] {
  return sortByPriority(getIncompleteTasks(tasks));
}

// 4. Group tasks by Eisenhower value
export function groupTasksByEisenhower(
  tasks: Task[]
): Record<EisenhowerValue | "none", Task[]> {
  const result: Record<EisenhowerValue | "none", Task[]> = {
    none: []
  };

  for (const task of tasks) {
    const key = (task.eisenhower ?? "none") as EisenhowerValue | "none";
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(task);
  }

  return result;
}
