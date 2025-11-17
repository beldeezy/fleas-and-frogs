"use client";

import { useTaskStore, EisenhowerQuadrant } from "@/lib/tasks";

const QUADRANT_LABELS: Record<EisenhowerQuadrant, string> = {
  do: "Do (Important + Urgent)",
  schedule: "Schedule (Important + Not Urgent)",
  delegate: "Delegate (Not Important + Urgent)",
  eliminate: "Eliminate (Not Important + Not Urgent)",
};

export default function StrategizePage() {
  const tasks = useTaskStore((state) => state.tasks);
  const priorities = useTaskStore((state) => state.priorities);
  const setTaskQuadrant = useTaskStore((state) => state.setTaskQuadrant);

  const prioritizedTasks = tasks.filter((t) => t.priorityId != null);

  return (
    <main className="ff-container">
      <h1>Strategize</h1>
      <p className="ff-muted">
        Use the Eisenhower Matrix within each priority to decide what to do,
        schedule, delegate, or eliminate.
      </p>

      {priorities.map((priority) => {
        const tasksForPriority = prioritizedTasks.filter(
          (t) => t.priorityId === priority.id
        );
        if (!tasksForPriority.length) return null;

        return (
          <section key={priority.id} className="ff-section">
            <h2>{priority.name}</h2>
            <ul className="ff-task-list">
              {tasksForPriority.map((task) => (
                <li key={task.id} className="ff-task">
                  <span>{task.label}</span>
                  <select
                    className="ff-select"
                    value={task.quadrant ?? ""}
                    onChange={(e) =>
                      setTaskQuadrant(
                        task.id,
                        e.target.value as EisenhowerQuadrant
                      )
                    }
                  >
                    <option value="">Choose quadrant…</option>
                    {Object.entries(QUADRANT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
