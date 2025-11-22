"use client";

import type { Task } from "../../lib/schema";

type TaskCardProps = {
  task: Task;
  onDragStart?: (taskId: string) => void;
  variant?: "default" | "scheduled";
};

export function TaskCard({
  task,
  onDragStart,
  variant = "default",
}: TaskCardProps) {
  return (
    <li
      className={`ff-task ${variant === "scheduled" ? "ff-task--scheduled" : ""}`}
      draggable={!!onDragStart}
      onDragStart={() => onDragStart?.(task.id)}
    >
      <div className="ff-task-leading">
        {variant === "scheduled" ? (
          <span className="ff-task-check">✓</span>
        ) : (
          <span className="ff-task-bullet" />
        )}
      </div>

      <div className="ff-task-main">
        <span>{task.title}</span>
      </div>
    </li>
  );
}
