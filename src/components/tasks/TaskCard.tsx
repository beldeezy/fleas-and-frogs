"use client";

import type { Task } from "../../lib/schema"; // <-- adjust path if needed

type TaskCardProps = {
  task: Task;
  onDragStart?: (taskId: string) => void;
};

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  return (
    <li
      className="ff-task"
      draggable
      onDragStart={() => onDragStart?.(task.id)}
    >
      <div className="ff-task-main">
        <span>{task.title}</span>
      </div>
      {/* Right-side controls could go here later */}
    </li>
  );
}
