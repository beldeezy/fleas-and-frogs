"use client";

import type { DragEvent } from "react";
import type { Task, EisenhowerValue } from "../../lib/schema"; // <-- adjust
import { TaskCard } from "../tasks/TaskCard";

const QUADRANTS: {
  key: EisenhowerValue;
  title: string;
  subtitle: string;
}[] = [
  { key: "now", title: "Now", subtitle: "Important + Urgent" },
  { key: "plan", title: "Plan", subtitle: "Important + Not Urgent" },
  { key: "delegate", title: "Delegate", subtitle: "Not Important + Urgent" },
  { key: "drop", title: "Drop", subtitle: "Not Important + Not Urgent" },
];

type EisenhowerGridProps = {
  tasksByQuadrant: Record<EisenhowerValue, Task[]>;
  onDrop: (quadrant: EisenhowerValue) => void | Promise<void>;
  onDragStart: (taskId: string) => void;
};

export function EisenhowerGrid({
  tasksByQuadrant,
  onDrop,
  onDragStart,
}: EisenhowerGridProps) {
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
        marginTop: "1rem",
      }}
    >
      {QUADRANTS.map((q) => (
        <div
          key={q.key}
          onDragOver={handleDragOver}
          onDrop={() => onDrop(q.key)}
          style={{
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "0.75rem",
            minHeight: "120px",
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.125rem",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontWeight: 600 }}>{q.title}</span>
            <span className="ff-hint">{q.subtitle}</span>
          </div>

          <ul className="ff-task-list">
            {tasksByQuadrant[q.key].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={onDragStart}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
