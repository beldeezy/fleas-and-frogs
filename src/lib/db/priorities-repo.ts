import { db } from "./fnf-db";
import { PrioritySchema } from "../schema";
import { z } from "zod";

export type Priority = z.infer<typeof PrioritySchema>;

// Only name is provided from UI
const NewPriorityInputSchema = z.object({
  name: z.string(),
});
export type NewPriorityInput = z.infer<typeof NewPriorityInputSchema>;

export async function getAllPriorities(): Promise<Priority[]> {
  const all = await db.priorities.toArray();

  // sort by order if present, otherwise by createdAt
  return all.sort((a, b) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    if (ao !== bo) return ao - bo;
    return a.createdAt - b.createdAt;
  });
}

export async function addPriority(input: NewPriorityInput): Promise<Priority> {
  const parsed = NewPriorityInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error("Invalid priority input");
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const count = await db.priorities.count();

  const priority: Priority = {
    id,
    name: parsed.data.name,
    createdAt: Date.now(),
    order: count, // append to end
  };

  try {
    await db.priorities.add(priority);
    return priority;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to add priority");
  }
}

export async function updatePriority(priority: Priority): Promise<Priority> {
  try {
    await db.priorities.put(priority);
    return priority;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update priority");
  }
}

export async function updatePrioritiesOrder(
  priorities: Priority[]
): Promise<void> {
  try {
    await db.priorities.bulkPut(priorities);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to reorder priorities");
  }
}

export async function deletePriority(id: string): Promise<void> {
  try {
    await db.priorities.delete(id);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete priority");
  }
}
