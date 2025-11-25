"use client";

import type { Task, EisenhowerValue } from "../../lib/schema";
import type { TaskPriority } from "../../store/taskStore";

type TaskCardProps = {
  task: Task;
  onPriorityChange?: (id: string, priorityId: TaskPriority) => void;
  onEisenhowerChange?: (id: string, value: EisenhowerValue) => void;
  onDelete?: (id: string) => void;
  onDragStart?: (taskId: string) => void;
  isLeaving?: boolean;
  isScheduled?: boolean; // passed from ScheduleSidebar
};

export function TaskCard({
  task,
  onPriorityChange,
  onEisenhowerChange,
  onDelete,
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

        {/* Optional Life Priority dropdown (by priorityId) */}
        {onPriorityChange && (
          <select
            className="ff-task-priority-select"
            value={task.priorityId ?? ""}
            onChange={(e) =>
              onPriorityChange(
                task.id,
                e.target.value ? (e.target.value as TaskPriority) : null
              )
            }
          >
            <option value="">No Life Priority</option>
            {/* You can map real priorities later */}
            {/* These are placeholders */}
            <option value="faith">Faith</option>
            <option value="family">Family</option>
            <option value="fitness">Fitness</option>
          </select>
        )}

        {/* Optional Eisenhower dropdown */}
        {onEisenhowerChange && (
          <select
            className="ff-task-eisenhower-select"
            value={task.eisenhower ?? ""}
            onChange={(e) =>
              onEisenhowerChange(
                task.id,
                e.target.value as EisenhowerValue
              )
            }
          >
            <option value="">No quadrant</option>
            <option value="UI">Urgent & Important</option>
            <option value="UNI">Urgent & Not Important</option>
            <option value="NUI">Not Urgent & Important</option>
            <option value="NUNI">Not Urgent & Not Important</option>
          </select>
        )}
      </div>

      {onDelete && (
        <button
          className="ff-task-delete"
          onClick={() => onDelete(task.id)}
          type="button"
          aria-label={`Delete task ${task.title}`}
        >
          🗑️
        </button>
      )}
    </li>
  );
}
