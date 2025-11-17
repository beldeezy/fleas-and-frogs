"use client";

import { FormEvent, useState } from "react";
import { useTaskStore } from "@/lib/tasks";

export default function MindDumpPage() {
  const [input, setInput] = useState("");
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const mindDumpConfirmed = useTaskStore((state) => state.mindDumpConfirmed);
  const confirmMindDump = useTaskStore((state) => state.confirmMindDump);

  const mindDumpTasks = tasks.filter((t) => t.stage === "mindDump");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTask(input.trim());
    setInput("");
  };

  return (
    <main className="ff-container">
      <h1>Mind Dump</h1>
      <p className="ff-muted">
        Get everything out of your head.
      </p>

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

      <section className="ff-section">
        <h2>Captured tasks</h2>
        <ul className="ff-task-list">
          {mindDumpTasks.map((task) => (
            <li key={task.id} className="ff-task">
              <span>{task.label}</span>
            </li>
          ))}
        </ul>
        {!mindDumpTasks.length && (
          <p className="ff-hint">Start typing above to dump tasks from your head.</p>
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
