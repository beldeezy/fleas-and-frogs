// src/components/strategize/EisenhowerGrid.tsx
"use client";

import type { Task, EisenhowerValue } from "../../lib/schema";
import { TaskCard } from "../tasks/TaskCard";

type EisenhowerGridProps = {
  tasksByQuadrant: Record<EisenhowerValue, Task[]>;
  onDrop: (quadrant: EisenhowerValue) => void;
  onDragStart: (taskId: string) => void;
};

type QuadrantMeta = {
  key: EisenhowerValue;
  label: string;
  description: string;
};

const Q_NOW: QuadrantMeta = {
  key: "now",
  label: "Do Now",
  description: "Urgent & important",
};

const Q_PLAN: QuadrantMeta = {
  key: "plan",
  label: "Plan",
  description: "Important, not urgent",
};

const Q_DELEGATE: QuadrantMeta = {
  key: "delegate",
  label: "Delegate",
  description: "Urgent, less important",
};

const Q_DROP: QuadrantMeta = {
  key: "drop",
  label: "Drop",
  description: "Neither urgent nor important",
};

export function EisenhowerGrid({
  tasksByQuadrant,
  onDrop,
  onDragStart,
}: EisenhowerGridProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropOnQuadrant = (
    e: React.DragEvent<HTMLDivElement>,
    quadrant: EisenhowerValue
  ) => {
    e.preventDefault();
    onDrop(quadrant);
  };

  const renderQuadrant = (meta: QuadrantMeta) => {
    const tasks = tasksByQuadrant[meta.key] ?? [];

    return (
      <div
        key={meta.key}
        className={`ff-eisenhower-quadrant ff-eisenhower-quadrant--${meta.key}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnQuadrant(e, meta.key)}
      >
        <header className="ff-eisenhower-header">
          <h3>{meta.label}</h3>
          <p className="ff-hint">{meta.description}</p>
        </header>

        <ul className="ff-task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
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
  };

  return (
    <div className="ff-eisenhower-grid">
      <div className="ff-eisenhower-grid-body">
        <div className="ff-eisenhower-row">
          {renderQuadrant(Q_NOW)}
          {renderQuadrant(Q_PLAN)}
        </div>
        <div className="ff-eisenhower-row">
          {renderQuadrant(Q_DELEGATE)}
          {renderQuadrant(Q_DROP)}
        </div>
      </div>
    </div>
  );
}
