"use client";

import { useEffect } from "react";
import { useTaskStore } from "../src/store/taskStore"; 
export default function DevTaskTest() {
  const { tasks, hydrated, loadTasks, createTask } = useTaskStore();

  useEffect(() => {
    // hydrate once on mount
    loadTasks();
  }, [loadTasks]);

  const handleAdd = async () => {
    await createTask({
      title: "Test task " + (tasks.length + 1),
      areaId: "inbox",   // adjust if your schema expects something else
      status: "todo",
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Dev Task Test</h2>
      <button onClick={handleAdd}>Add Test Task</button>

      <p>Hydrated: {hydrated ? "yes" : "no"}</p>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} — {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
