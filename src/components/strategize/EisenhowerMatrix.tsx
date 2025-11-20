"use client";

import { useState, type DragEvent } from "react";
import type { Task, EisenhowerValue } from "../../lib/schema"; // <-- adjust
import { EisenhowerGrid } from "./EisenhowerGrid";
import { TaskCard } from "../tasks/TaskCard";

type EisenhowerMatrixProps = {
  priorityId: string;
  priorityName: string;
  tasksForPriority: Task[];
  hydrated: boolean;
  setTaskEisenhower: (id: string, value: EisenhowerValue) => Promise<void>;
};

export function EisenhowerMatrix({
  priorityId,
  priorityName,
  tasksForPriority,
  hydrated,
  setTaskEisenhower,
}: EisenhowerMatrixProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const unsorted = tasksForPriority.filter((t) => !t.eisenhower);

  const byQuadrant: Record<EisenhowerValue, Task[]> = {
    now: tasksForPriority.filter((t) => t.eisenhower === "now"),
    plan: tasksForPriority.filter((t) => t.eisenhower === "plan"),
    delegate: tasksForPriority.filter((t) => t.eisenhower === "delegate"),
    drop: tasksForPriority.filter((t) => t.eisenhower === "drop"),
  };

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDrop = async (quadrant: EisenhowerValue) => {
    if (!draggingTaskId) return;

    const task = tasksForPriority.find((t) => t.id === draggingTaskId);
    if (!task || task.priorityId !== priorityId) {
      // Only allow dropping into its own Life Priority matrix
      setDraggingTaskId(null);
      return;
    }

    try {
      await setTaskEisenhower(draggingTaskId, quadrant);
    } finally {
      setDraggingTaskId(null);
    }
  };

  const handleUnsortedDragOver = (e: DragEvent<HTMLDivElement>) => {
    // Just to allow smooth drag leave/enter; no drop here.
    e.preventDefault();
  };

  // lightweight breadcrumb for debugging this layer if needed
  console.log(
    "EisenhowerMatrix render:",
    priorityName,
    "tasksForPriority=",
    tasksForPriority.length
  );

  return (
    <section className="ff-section">
      <h2>{priorityName}</h2>
      <p className="ff-muted">
        Sort tasks for <strong>{priorityName}</strong> using importance and
        urgency.
      </p>

      {/* Eisenhower matrix grid */}
      <EisenhowerGrid
        tasksByQuadrant={byQuadrant}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
      />

      {/* Unsorted tasks */}
      <div
        style={{ marginTop: "1.25rem" }}
        onDragOver={handleUnsortedDragOver}
      >
        <h3>Unsorted tasks</h3>
        <p className="ff-hint">
          Drag these into a quadrant above to place them.
        </p>
        <ul className="ff-task-list">
          {unsorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
            />
          ))}
        </ul>

        {hydrated && !tasksForPriority.length && (
          <p className="ff-hint">
            No tasks assigned to {priorityName} yet. Use the Prioritize stage to
            assign tasks to this Life Priority.
          </p>
        )}
      </div>
    </section>
  );
}
