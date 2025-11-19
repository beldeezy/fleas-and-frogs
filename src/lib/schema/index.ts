import { z } from "zod";

export const AreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
});

export type Area = z.infer<typeof AreaSchema>;

// ----- Life Priorities -----

export const PrioritySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  order: z.number().optional(), // for drag/reorder
});

export type Priority = z.infer<typeof PrioritySchema>;

// ----- Eisenhower matrix -----

export const EISENHOWER_VALUES = ["now", "plan", "delegate", "drop"] as const;
export type EisenhowerValue = (typeof EISENHOWER_VALUES)[number];

// ----- Tasks -----

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  areaId: z.string(),
  status: z.enum(["todo", "doing", "done"]),
  priorityId: z.string().optional(), // Life Priority link
  eisenhower: z.enum(EISENHOWER_VALUES).optional(), // Eisenhower quadrant
  createdAt: z.number(),
});

export type Task = z.infer<typeof TaskSchema>;
