// src/components/plan/ScheduleSidebar.tsx
"use client";

import type { Task } from "../../lib/schema";
import { TaskCard } from "../tasks/TaskCard";

type ScheduleSidebarProps = {
  tasks: Task[];
  onTaskDragStart: (taskId: string) => void;
};

export function ScheduleSidebar({
  tasks,
  onTaskDragStart,
}: ScheduleSidebarProps) {
  const hasTasks = tasks && tasks.length > 0;

  return (
    <div className="ff-plan-sidebar-inner">
      <h2>Schedule</h2>
      <p className="ff-muted">
        These are tasks you marked to{" "}
        <strong>plan</strong> in the Strategize stage. Drag them into
        the calendar to time-block.
      </p>

      {!hasTasks && (
        <p className="ff-hint">
          No tasks in the <strong>plan</strong> quadrant yet. Use
          Strategize to choose what to plan.
        </p>
      )}

      {hasTasks && (
        <ul className="ff-task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onTaskDragStart}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
