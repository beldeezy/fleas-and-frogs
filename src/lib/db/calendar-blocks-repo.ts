// src/lib/db/calendar-blocks-repo.ts

import { db } from "./fnf-db";
import type {
  CalendarBlock,
  NewCalendarBlockInput,
} from "../schema";

// Get all blocks (we'll later add range-based queries)
export async function getAllCalendarBlocks(): Promise<CalendarBlock[]> {
  try {
    const blocks = await db.calendar_blocks.toArray();
    return Array.isArray(blocks) ? blocks : [];
  } catch (err) {
    console.error("getAllCalendarBlocks failed", err);
    throw err;
  }
}

// Get blocks in a time range (optional but useful for the week view)
export async function getCalendarBlocksInRange(
  startIso: string,
  endIso: string
): Promise<CalendarBlock[]> {
  try {
    const all = await db.calendar_blocks.toArray();
    return all.filter((block) => {
      return block.start < endIso && block.end > startIso;
    });
  } catch (err) {
    console.error("getCalendarBlocksInRange failed", err);
    throw err;
  }
}

export async function addCalendarBlock(
  input: NewCalendarBlockInput
): Promise<CalendarBlock> {
  const now = new Date().toISOString();

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const block: CalendarBlock = {
    id,
    taskId: input.taskId ?? null,
    title: input.title,
    notes: input.notes ?? null,
    start: input.start,
    end: input.end,
    recurrence: input.recurrence ?? "none",
    color: input.color ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.calendar_blocks.add(block);
    return block;
  } catch (err) {
    console.error("addCalendarBlock failed", err);
    throw err;
  }
}

export async function updateCalendarBlock(
  updated: CalendarBlock
): Promise<CalendarBlock> {
  try {
    const next: CalendarBlock = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    await db.calendar_blocks.put(next);
    return next;
  } catch (err) {
    console.error("updateCalendarBlock failed", err);
    throw err;
  }
}

export async function deleteCalendarBlock(id: string): Promise<void> {
  try {
    await db.calendar_blocks.delete(id);
  } catch (err) {
    console.error("deleteCalendarBlock failed", err);
    throw err;
  }
}
