"use client";

import { useTaskStore } from "../../store/taskStore";
import { TaskCard } from "../tasks/TaskCard";

export function MindDumpTaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  const handleDelete = async (taskId: string) => {
    if (!deleteTask) return;

    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      // store handles error state; page shows banner if needed
    }
  };

  return (
    <section className="ff-section">
      <h2>Captured tasks</h2>

      <ul className="ff-task-list">
        {mindDumpTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={handleDelete}
          />
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
