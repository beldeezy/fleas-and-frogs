"use client";

import type { Task } from "../../lib/schema";

type TaskCardProps = {
  task: Task;
  onDragStart?: (taskId: string) => void;
  isLeaving?: boolean;
  isScheduled?: boolean; // ← NEW (passed from ScheduleSidebar)
};

export function TaskCard({
  task,
  onDragStart,
  isLeaving = false,
  isScheduled = false,
}: TaskCardProps) {
  return (
    <li
      className={`ff-task ${isLeaving ? "ff-task--leaving" : ""} ${
        isScheduled ? "ff-task--scheduled" : ""
      }`}
      draggable={!!onDragStart}
      onDragStart={() => onDragStart?.(task.id)}
    >
      <div className="ff-task-leading">
        {isScheduled ? (
          <span className="ff-task-check">✓</span>
        ) : (
          <span className="ff-task-bullet" />
        )}
      </div>

      <div className="ff-task-main">
        <span className="ff-task-title">{task.title}</span>
      </div>
    </li>
  );
}
