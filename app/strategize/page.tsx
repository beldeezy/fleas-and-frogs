"use client";

import { useEffect, useState, type DragEvent } from "react";
import { useTaskStore } from "../../src/store/taskStore";
import type { EisenhowerValue } from "../../src/lib/schema";

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

export default function StrategizePage() {
  const rawTasks = useTaskStore((state) => state.tasks);
  const rawPriorities = useTaskStore((state) => state.priorities);
  const hydrated = useTaskStore((state) => state.hydrated ?? false);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const setTaskEisenhower = useTaskStore((state) => state.setTaskEisenhower);

  // Ensure we always have arrays so .map/.filter never throw
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];
  const priorities = Array.isArray(rawPriorities) ? rawPriorities : [];

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (
    priorityId: string,
    quadrant: EisenhowerValue
  ) => {
    if (!draggingTaskId) return;

    const task = tasks.find((t) => t.id === draggingTaskId);
    if (!task || task.priorityId !== priorityId) {
      // Only allow dropping into its own Life Priority matrix
      setDraggingTaskId(null);
      return;
    }

    await setTaskEisenhower(draggingTaskId, quadrant);
    setDraggingTaskId(null);
  };

  return (
    <main className="ff-container">
      <h1>Strategize</h1>
      <p className="ff-muted">
        Use the Eisenhower Matrix in each Life Priority to decide what to do
        now, what to plan, what to delegate, and what to drop.
      </p>

      {!hydrated && (
        <p className="ff-hint">Loading your tasks and priorities…</p>
      )}

      {priorities.map((priority) => {
        const tasksForPriority = tasks.filter(
          (t) => t.priorityId === priority.id
        );

        const unsorted = tasksForPriority.filter((t) => !t.eisenhower);

        const byQuadrant: Record<EisenhowerValue, typeof tasksForPriority> = {
          now: tasksForPriority.filter((t) => t.eisenhower === "now"),
          plan: tasksForPriority.filter((t) => t.eisenhower === "plan"),
          delegate: tasksForPriority.filter((t) => t.eisenhower === "delegate"),
          drop: tasksForPriority.filter((t) => t.eisenhower === "drop"),
        };

        return (
          <section key={priority.id} className="ff-section">
            <h2>{priority.name}</h2>
            <p className="ff-muted">
              Sort tasks for <strong>{priority.name}</strong> using importance
              and urgency.
            </p>

            {/* Eisenhower Matrix */}
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
                  onDrop={() => handleDrop(priority.id, q.key)}
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
                    {byQuadrant[q.key].map((task) => (
                      <li
                        key={task.id}
                        className="ff-task"
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                      >
                        <span>{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Unsorted tasks */}
            <div style={{ marginTop: "1.25rem" }}>
              <h3>Unsorted tasks</h3>
              <p className="ff-hint">
                Drag these into a quadrant above to place them.
              </p>
              <ul className="ff-task-list">
                {unsorted.map((task) => (
                  <li
                    key={task.id}
                    className="ff-task"
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                  >
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>
              {hydrated && !tasksForPriority.length && (
                <p className="ff-hint">
                  No tasks assigned to {priority.name} yet. Use the Prioritize
                  stage to assign tasks to this Life Priority.
                </p>
              )}
            </div>
          </section>
        );
      })}

      {hydrated && !priorities.length && (
        <p className="ff-hint">
          You don’t have any Life Priorities yet. Start in the Prioritize
          stage to define them.
        </p>
      )}
    </main>
  );
}
