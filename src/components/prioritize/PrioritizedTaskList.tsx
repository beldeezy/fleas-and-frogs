"use client";

import { useTaskStore } from "../../store/taskStore";
import { TaskCard } from "../tasks/TaskCard";

export function PrioritizedTaskList() {
  const prioritizedTasks = useTaskStore((s) => s.prioritizedTasks);
  const setTaskPriority = useTaskStore((s) => s.setTaskPriority);

  const tasks = prioritizedTasks();

  return (
    <section className="ff-section">
      <h2>Prioritized Tasks</h2>

      <ul className="ff-task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPriorityChange={setTaskPriority}
          />
        ))}

        {!tasks.length && (
          <li className="ff-task ff-task-empty">
            <span className="ff-hint">
              No prioritized tasks yet. Capture tasks first, then assign Life Priorities.
            </span>
          </li>
        )}
      </ul>
    </section>
  );
}
