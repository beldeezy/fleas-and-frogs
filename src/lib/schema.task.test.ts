// src/lib/schema.task.test.ts
import { describe, it, expect } from "vitest";
import { TaskSchema } from "./schema"; // keep this as-is if it's already working

describe("taskSchema", () => {
  it("accepts a valid task", () => {
    const input = {
      id: "1",
      title: "Test task",

      // ✅ required by your Zod schema
      areaId: "inbox",           // any string
      status: "todo",            // one of "todo" | "doing" | "done"
      createdAt: Date.now(),     // number, not string

      // other fields can be added if your schema requires them,
      // but Zod would have complained already if they were missing.
    };

    const parsed = TaskSchema.parse(input);
    expect(parsed.title).toBe("Test task");
  });

  it("rejects an invalid task", () => {
    // Intentionally missing required fields / wrong types
    const bad = {
      id: "1",
      title: "",     // assume your schema disallows empty title
      // no areaId
      status: "wrong-status", // not "todo" | "doing" | "done"
      createdAt: "not-a-number",
    } as any;

    expect(() => TaskSchema.parse(bad)).toThrow();
  });
});
