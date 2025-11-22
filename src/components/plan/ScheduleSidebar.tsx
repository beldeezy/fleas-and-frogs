// src/components/plan/ScheduleSidebar.tsx
"use client";

import type { Task } from "../../lib/schema";
import { TaskCard } from "../tasks/TaskCard";

type ScheduleSidebarProps = {
  unscheduled: Task[];
  scheduled: Task[];
  onTaskDragStart: (taskId: string) => void;
};

export function ScheduleSidebar({
  unscheduled,
  scheduled,
  onTaskDragStart,
}: ScheduleSidebarProps) {
  const hasAny = unscheduled.length > 0 || scheduled.length > 0;

  return (
    <div className="ff-plan-sidebar-inner">
      <h2>Schedule</h2>
      <p className="ff-muted">Drag your planned tasks into the calendar.</p>

      {!hasAny && (
        <p className="ff-hint">
          No tasks in the <strong>plan</strong> quadrant yet.
        </p>
      )}

      {unscheduled.length > 0 && (
        <section>
          <h3 className="ff-plan-sidebar-section-title">To Schedule</h3>
          <ul className="ff-task-list">
            {unscheduled.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="default"
                onDragStart={onTaskDragStart}
              />
            ))}
          </ul>
        </section>
      )}

      {scheduled.length > 0 && (
        <section className="ff-plan-sidebar-section">
          <h3 className="ff-plan-sidebar-section-title">Scheduled</h3>
          <ul className="ff-task-list ff-task-list--scheduled">
            {scheduled.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="scheduled"
                onDragStart={onTaskDragStart}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
