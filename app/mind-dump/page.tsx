"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "../../src/store/taskStore";
import { MindDumpInput } from "../../src/components/mind-dump/MindDumpInput";

export default function MindDumpPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const hydrated = useTaskStore((state) => state.hydrated);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [mindDumpConfirmed, setMindDumpConfirmed] = useState(false);

  const router = useRouter();

  // hydrate tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const confirmMindDump = () => {
    if (!mindDumpTasks.length) return;

    setMindDumpConfirmed(true);
    router.push("/prioritize");
  };

  return (
    <main className="ff-container">
      <h1>Mind Dump</h1>
      <p className="ff-muted">Get everything out of your head.</p>

      <section className="ff-section" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <MindDumpInput disabled={mindDumpConfirmed} />
      </section>

      {!hydrated && <p className="ff-hint">Loading your tasks…</p>}

      <section className="ff-section">
        <h2>Captured tasks</h2>
        <ul className="ff-task-list">
          {mindDumpTasks.map((task) => (
            <li
              key={task.id}
              className="ff-task"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{task.title}</span>

              <button
                onClick={() => handleDelete(task.id)}
                aria-label="Delete task"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "0.25rem",
                }}
                className="ff-icon-button"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>

        {!mindDumpTasks.length && hydrated && (
          <p className="ff-hint">
            Start typing above to dump tasks from your head.
          </p>
        )}
      </section>

      <section className="ff-section">
        <button
          className="ff-button"
          onClick={confirmMindDump}
          disabled={mindDumpConfirmed || !mindDumpTasks.length}
        >
          {mindDumpConfirmed
            ? "Mind Dump confirmed"
            : "I’ve listed everything I can think of"}
        </button>
        <p className="ff-hint">
          Once confirmed, you’ll move on to defining your Life Priorities in the
          Prioritize stage.
        </p>
      </section>
    </main>
  );
}
