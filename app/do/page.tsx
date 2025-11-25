// app/do/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useTaskStore } from "../../src/store/taskStore";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }

  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function DoPage() {
  // ---- Timer state ----
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [running]);

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setSeconds(0);
  };

  // ---- Tasks: “Now” section ----
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated ?? false);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  useEffect(() => {
    if (!hydrated) {
      void loadTasks();
    }
  }, [hydrated, loadTasks]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // assume tasks have a "priority" field with values like "now" | "next" | "later"
  const nowTasks = useMemo(
    () =>
      safeTasks.filter((t) =>
        String((t as any).priority ?? "")
          .toLowerCase()
          .includes("now")
      ),
    [safeTasks]
  );

  return (
    <main className="ff-container">
      <h1>Do</h1>
      <p className="ff-subtitle">
        One focused timer and your “Now” list. Hit start and work the list.
      </p>

      {/* Macro timer */}
      <section className="ff-do-timer">
        <div className="ff-do-timer-display">{formatTime(seconds)}</div>

        <div className="ff-do-timer-controls">
          <button
            className="ff-button"
            onClick={handleStart}
            disabled={running}
          >
            Start
          </button>
          <button
            className="ff-button"
            onClick={handlePause}
            disabled={!running}
          >
            Pause
          </button>
          <button
            className="ff-button"
            onClick={handleReset}
            disabled={seconds === 0}
          >
            Reset
          </button>
        </div>
      </section>

      {/* “Now” tasks */}
      <section className="ff-do-now">
        <h2 className="ff-section-title">Now</h2>

        {!hydrated && (
          <p className="ff-hint">Loading your tasks…</p>
        )}

        {hydrated && nowTasks.length === 0 && (
          <p className="ff-hint">
            You haven&apos;t marked any tasks as &quot;Now&quot; yet.
          </p>
        )}

        {hydrated && nowTasks.length > 0 && (
          <ul className="ff-do-now-list">
            {nowTasks.map((task) => (
              <li key={task.id} className="ff-do-now-item">
                <span className="ff-do-now-bullet" />
                <span className="ff-do-now-title">{task.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
