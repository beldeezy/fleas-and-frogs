// src/lib/schema/index.ts
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

// ----- Plan / Calendar -----

export const RECURRENCE_VALUES = ["none", "daily", "weekly"] as const;
export type RecurrenceRule = (typeof RECURRENCE_VALUES)[number];

export const CalendarBlockSchema = z.object({
  id: z.string(),
  taskId: z.string().nullable().optional(),

  title: z.string(),
  notes: z.string().nullable().optional(),

  // Store as ISO strings for Dexie friendliness
  start: z.string(), // ISO datetime
  end: z.string(),   // ISO datetime

  recurrence: z.enum(RECURRENCE_VALUES).optional(), // v1: none/daily/weekly

  color: z.string().nullable().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CalendarBlock = z.infer<typeof CalendarBlockSchema>;

// For creating new blocks from UI
export const NewCalendarBlockInputSchema = CalendarBlockSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NewCalendarBlockInput = z.infer<
  typeof NewCalendarBlockInputSchema
>;
