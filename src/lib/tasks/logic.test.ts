// src/lib/tasks/logic.test.ts
import { describe, it, expect } from "vitest";
import type { Task, EisenhowerValue } from "../schema";
import {
  getIncompleteTasks,
  sortByPriority,
  computePrioritizedTasks,
  groupTasksByEisenhower,
} from "./logic";

// Minimal helper to fake Tasks
function makeTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? "1",
    title: (overrides as any).title ?? "Test",
    createdAt: (overrides as any).createdAt ?? Date.now(),
    completed: (overrides as any).completed ?? false,
    priorityId: (overrides as any).priorityId,
    eisenhower: (overrides as any).eisenhower,
    ...(overrides as any),
  } as Task;
}

describe("getIncompleteTasks", () => {
  it("filters out completed tasks", () => {
    const tasks: Task[] = [
      makeTask({ id: "1", completed: false }),
      makeTask({ id: "2", completed: true }),
    ];

    const result = getIncompleteTasks(tasks);
    expect(result.map((t) => t.id)).toEqual(["1"]);
  });
});

describe("sortByPriority", () => {
  it("sorts tasks by priorityId", () => {
    const tasks: Task[] = [
      makeTask({ id: "1", priorityId: "2" }),
      makeTask({ id: "2", priorityId: "1" }),
      makeTask({ id: "3", priorityId: "3" }),
    ];

    const result = sortByPriority(tasks);
    expect(result.map((t) => t.id)).toEqual(["2", "1", "3"]);
  });
});

describe("computePrioritizedTasks", () => {
  it("filters out completed tasks and sorts by priorityId", () => {
    const tasks: Task[] = [
      makeTask({ id: "1", priorityId: "2", completed: false }),
      makeTask({ id: "2", priorityId: "1", completed: true }),
      makeTask({ id: "3", priorityId: "1", completed: false }),
    ];

    const result = computePrioritizedTasks(tasks);
    expect(result.map((t) => t.id)).toEqual(["3", "1"]);
  });
});

describe("groupTasksByEisenhower", () => {
  it("groups tasks into Eisenhower buckets", () => {
    const tasks: Task[] = [
      makeTask({ id: "1", eisenhower: "do" as EisenhowerValue }),
      makeTask({ id: "2", eisenhower: "schedule" as EisenhowerValue }),
      makeTask({ id: "3", eisenhower: "delegate" as EisenhowerValue }),
      makeTask({ id: "4", eisenhower: "delete" as EisenhowerValue }),
      makeTask({ id: "5", eisenhower: undefined }),
    ];

    const buckets = groupTasksByEisenhower(tasks);

    expect(buckets.do.map((t) => t.id)).toEqual(["1"]);
    expect(buckets.schedule.map((t) => t.id)).toEqual(["2"]);
    expect(buckets.delegate.map((t) => t.id)).toEqual(["3"]);
    expect(buckets.delete.map((t) => t.id)).toEqual(["4"]);
    expect(buckets.none.map((t) => t.id)).toEqual(["5"]);
  });
});
