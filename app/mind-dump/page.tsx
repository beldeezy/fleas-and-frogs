"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTaskStore } from "../../src/store/taskStore";

export default function MindDumpPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const hydrated = useTaskStore((state) => state.hydrated);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const createTask = useTaskStore((state) => state.createTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [input, setInput] = useState("");
  const [mindDumpConfirmed, setMindDumpConfirmed] = useState(false);

  // hydrate tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || mindDumpConfirmed) return;

    await createTask({
      title: trimmed,
      areaId: "mind-dump",
      status: "todo",
    });

    setInput("");
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const confirmMindDump = () => {
    if (!mindDumpTasks.length) return;
    setMindDumpConfirmed(true);
  };

  return (
    <main className="ff-container">
      <h1>Mind Dump</h1>
      <p className="ff-muted">Get everything out of your head.</p>

      <form
        onSubmit={handleSubmit}
        className="ff-section"
        style={{ display: "flex", gap: "0.5rem" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a task and press Enter…"
          className="ff-input"
          disabled={mindDumpConfirmed}
        />
        <button type="submit" className="ff-button" disabled={mindDumpConfirmed}>
          Add
        </button>
      </form>

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

              {/* Subtle trash icon */}
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
