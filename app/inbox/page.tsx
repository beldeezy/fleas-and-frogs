"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "../../src/store/taskStore"; // adjust path

export default function InboxPage() {
  const { tasks, hydrated, loadTasks, createTask } = useTaskStore();
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title,
      areaId: "inbox",      // temporary default
      status: "todo",
    });

    setTitle("");
  };

  return (
    <main className="ff-container">
      <h1>Inbox</h1>

      {!hydrated && <p>Loading tasks…</p>}

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} – {t.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
