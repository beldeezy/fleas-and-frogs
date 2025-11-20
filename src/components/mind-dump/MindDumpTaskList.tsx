"use client";

import { useTaskStore } from "../../store/taskStore";

export function MindDumpTaskList() {
  const { tasks, hydrated, deleteTask } = useTaskStore((s) => ({
    tasks: s.tasks,
    hydrated: s.hydrated,
    deleteTask: s.deleteTask,
  }));

  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      // store handles error state; page shows banner
    }
  };

  return (
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
  );
}
