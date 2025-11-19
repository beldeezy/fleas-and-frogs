"use client";

import { useEffect } from "react";
import { useTaskStore } from "../../src/store/taskStore";

export default function InboxPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <main className="ff-container">
      <h1>Inbox (deprecated)</h1>
      <p className="ff-hint">
        This page is read-only. New tasks should be created from the Mind
        Dump page.
      </p>

      {!hydrated && <p className="ff-hint">Loading tasks…</p>}

      <ul className="ff-task-list">
        {tasks.map((t) => (
          <li key={t.id} className="ff-task">
            {t.title} – {t.status} ({t.areaId ?? "no area"})
          </li>
        ))}
      </ul>
    </main>
  );
}
