import { db } from "./fnf-db";
import { TaskSchema, EisenhowerValue } from "../schema";
import { z } from "zod";

// Base types from Zod
export type Task = z.infer<typeof TaskSchema>;

// Input type: no id/createdAt (those are generated here)
export const NewTaskInputSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  eisenhower: true, // Eisenhower is set later in Strategize
});
export type NewTaskInput = z.infer<typeof NewTaskInputSchema>;

// READ: get all tasks from Dexie
export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.toArray();
}

// CREATE: validate input, generate id/timestamp, persist, return full Task
export async function addTask(input: NewTaskInput): Promise<Task> {
  const parsed = NewTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error("Invalid task input");
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const task: Task = {
    ...parsed.data,
    id,
    createdAt: Date.now(),
  };

  try {
    await db.tasks.add(task);
    return task;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to add task");
  }
}

// UPDATE: generic full-task update
export async function updateTask(task: Task): Promise<Task> {
  try {
    await db.tasks.put(task);
    return task;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update task");
  }
}

// UPDATE: assign or clear a task's priority
export async function setTaskPriority(
  taskId: string,
  priorityId: string | null
): Promise<Task> {
  const existing = await db.tasks.get(taskId);

  if (!existing) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const updated: Task = {
    ...existing,
    priorityId: priorityId ?? undefined,
  };

  try {
    await db.tasks.put(updated);
    return updated;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to set task priority");
  }
}

// UPDATE: set Eisenhower quadrant for a task
export async function setTaskEisenhower(
  taskId: string,
  eisenhower: EisenhowerValue | null
): Promise<Task> {
  const existing = await db.tasks.get(taskId);

  if (!existing) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const updated: Task = {
    ...existing,
    eisenhower: eisenhower ?? undefined,
  };

  try {
    await db.tasks.put(updated);
    return updated;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to set Eisenhower quadrant");
  }
}

// DELETE: remove a task entirely
export async function deleteTask(taskId: string): Promise<void> {
  try {
    await db.tasks.delete(taskId);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete task");
  }
}

