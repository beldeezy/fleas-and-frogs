import { describe, it, expect } from "vitest";
import { sortTasks } from "./helpers";

describe("sortTasks", () => {
  it("sorts tasks by priority", () => {
    const tasks = [
      { id: "1", priority: 3 },
      { id: "2", priority: 1 },
      { id: "3", priority: 2 }
    ];

    const sorted = sortTasks(tasks);
    expect(sorted.map(t => t.id)).toEqual(["1", "3", "2"]);
  });
});
