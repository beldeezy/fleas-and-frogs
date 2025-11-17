"use client";

import { FormEvent, useState } from "react";
import { useTaskStore } from "@/lib/tasks";

const DEFAULT_PRIORITY_NAMES = [
  "Faith",
  "Family",
  "Finance",
  "Future",
  "Fitness",
  "Fun",
  "Fleas",
  "Frogs",
];

export default function PrioritizePage() {
  const tasks = useTaskStore((state) => state.tasks);
  const priorities = useTaskStore((state) => state.priorities);
  const mindDumpConfirmed = useTaskStore((state) => state.mindDumpConfirmed);
  const setPriorities = useTaskStore((state) => state.setPriorities);
  const assignTaskPriority = useTaskStore((state) => state.assignTaskPriority);

  const [priorityText, setPriorityText] = useState(
    DEFAULT_PRIORITY_NAMES.join("\n")
  );

  const unprioritized = tasks.filter((t) => t.priorityId == null);
  const prioritized = tasks.filter((t) => t.priorityId != null);

  // 1) If Mind Dump isn't confirmed, show lock screen
  if (!mindDumpConfirmed) {
    return (
      <main className="ff-container">
        <h1>Prioritize</h1>
        <p className="ff-muted">
          This stage unlocks after you complete your Mind Dump.
        </p>
        <section className="ff-section">
          <p className="ff-hint">
            Go back to <strong>Mind Dump</strong>, list everything on your mind,
            then confirm you’re done to move forward.
          </p>
        </section>
      </main>
    );
  }

  // 2) If no priorities defined yet, ask user to define their Life Priorities
  const handlePrioritiesSubmit = (e: FormEvent) => {
    e.preventDefault();
    const names = priorityText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!names.length) return;
    setPriorities(names);
  };

  if (!priorities.length) {
    return (
      <main className="ff-container">
        <h1>Prioritize</h1>
        <p className="ff-muted">
          Define your Life Priorities so you can sort tasks into what matters
          most.
        </p>

        <section className="ff-section">
          <form
            onSubmit={handlePrioritiesSubmit}
            className="ff-form-vertical"
          >
            <p className="ff-hint">
              One priority per line. Example: the 8F’s (Faith, Family, Finance,
              Future, Fitness, Fun, Fleas, Frogs).
            </p>
            <textarea
              id="priorityText"
              className="ff-textarea"
              value={priorityText}
              onChange={(e) => setPriorityText(e.target.value)}
            />
            <div>
              <button type="submit" className="ff-button">
                Save priorities
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  // 3) Normal prioritization UI once everything is unlocked
  return (
    <main className="ff-container">
      <h1>Prioritize</h1>
      <p className="ff-muted">
        Sort tasks into your core life priorities (like Faith, Family, Finance,
        Future, Fitness, Fun, Fleas, Frogs).
      </p>

      <section className="ff-section">
        <h2>Unassigned tasks</h2>
        <ul className="ff-task-list">
          {unprioritized.map((task) => (
            <li key={task.id} className="ff-task">
              <span>{task.label}</span>
              <select
                className="ff-select"
                value={task.priorityId ?? ""}
                onChange={(e) =>
                  assignTaskPriority(task.id, Number(e.target.value))
                }
              >
                <option value="">Choose priority…</option>
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
        {!unprioritized.length && (
          <p className="ff-hint">
            All tasks currently have a priority. Add more in Mind Dump if
            needed.
          </p>
        )}
      </section>

      <section className="ff-section">
        <h2>Tasks by priority</h2>
        {priorities.map((priority) => {
          const tasksForPriority = prioritized.filter(
            (t) => t.priorityId === priority.id
          );
          if (!tasksForPriority.length) return null;
          return (
            <div key={priority.id} style={{ marginBottom: "1rem" }}>
              <h3>{priority.name}</h3>
              <ul className="ff-task-list">
                {tasksForPriority.map((task) => (
                  <li key={task.id} className="ff-task">
                    <span>{task.label}</span>
                    <select
                      className="ff-select"
                      value={task.priorityId ?? ""}
                      onChange={(e) =>
                        assignTaskPriority(task.id, Number(e.target.value))
                      }
                    >
                      <option value="">Choose priority…</option>
                      {priorities.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
