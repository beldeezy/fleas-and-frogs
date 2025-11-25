"use client";

import { useState, type DragEvent } from "react";
import type { Task, EisenhowerValue } from "../../lib/schema";
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

  // Tasks with no Eisenhower quadrant yet
  const unsorted = tasksForPriority.filter((t) => !t.eisenhower);

  // Tasks grouped by quadrant
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
      // Only allow dropping tasks that belong to this Life Priority
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
    // Allow drag-over so the drag doesn't cancel when hovering this area
    e.preventDefault();
  };

  const handleEisenhowerChange = async (
    taskId: string,
    value: EisenhowerValue
  ) => {
    try {
      await setTaskEisenhower(taskId, value);
    } catch (err) {
      console.error("Failed to set Eisenhower value:", err);
    }
  };

  // breadcrumb for debugging this layer if needed
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
          Drag these into a quadrant above, or choose a quadrant from the
          dropdown.
        </p>

        <ul className="ff-task-list">
          {unsorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              // also allow setting Eisenhower via dropdown on the card
              onEisenhowerChange={handleEisenhowerChange}
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
