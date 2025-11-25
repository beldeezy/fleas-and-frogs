"use client";

import type { Task, EisenhowerValue } from "../../lib/schema";
import { TaskCard } from "../tasks/TaskCard";

type EisenhowerGridProps = {
  tasksByQuadrant: Record<EisenhowerValue, Task[]>;
  onDrop: (quadrant: EisenhowerValue) => void;
  onDragStart: (taskId: string) => void;
};

const COLUMNS: { key: EisenhowerValue; label: string; description: string }[] = [
  { key: "now",      label: "Do Now",    description: "Urgent & important" },
  { key: "plan",     label: "Plan",      description: "Important, not urgent" },
  { key: "delegate", label: "Delegate",  description: "Urgent, less important" },
  { key: "drop",     label: "Drop",      description: "Neither urgent nor important" },
];

export function EisenhowerGrid({
  tasksByQuadrant,
  onDrop,
  onDragStart,
}: EisenhowerGridProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // allow drop
    e.preventDefault();
  };

  const handleDropOnColumn = (
    e: React.DragEvent<HTMLDivElement>,
    quadrant: EisenhowerValue
  ) => {
    e.preventDefault();
    onDrop(quadrant);
  };

  return (
    <div className="ff-eisenhower-grid">
      {COLUMNS.map((col) => {
        const tasks = tasksByQuadrant[col.key] ?? [];

        return (
          <div
            key={col.key}
            className="ff-eisenhower-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnColumn(e, col.key)}
          >
            <header className="ff-eisenhower-header">
              <h3>{col.label}</h3>
              <p className="ff-hint">{col.description}</p>
            </header>

            <ul className="ff-task-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart}
                  // they’re already in this quadrant, so no dropdown here;
                  // movement between quadrants happens via drag + drop
                />
              ))}

              {!tasks.length && (
                <li className="ff-task ff-task-empty">
                  <span className="ff-hint">No tasks here yet.</span>
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
