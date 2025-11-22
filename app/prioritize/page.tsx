"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "../../src/store/taskStore";
import { usePriorityStore } from "../../src/store/priorityStore";
import { LifePriorityList } from "../../src/components/prioritize/LifePriorityList";

export default function PrioritizePage() {
  const router = useRouter();

  // ---- Tasks ----
  const tasks = useTaskStore((state) => state.tasks);
  const tasksHydrated = useTaskStore((state) => state.hydrated);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const setTaskPriority = useTaskStore((state) => state.setTaskPriority);
  const isLoading = useTaskStore((state) => state.isLoading);
  const error = useTaskStore((state) => state.error);
  const clearError = useTaskStore((state) => state.clearError);

  // ---- Life Priorities ----
  const priorities = usePriorityStore((state) => state.priorities);
  const prioritiesHydrated = usePriorityStore((state) => state.hydrated);
  const loadPriorities = usePriorityStore((state) => state.loadPriorities);

  const hydrated = tasksHydrated && prioritiesHydrated;

  // ---- Local UI state ----
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [prioritiesConfirmed, setPrioritiesConfirmed] = useState(false);

  useEffect(() => {
    loadTasks();
    loadPriorities();
  }, [loadTasks, loadPriorities]);

  // ---- Derived lists ----
  const unprioritizedTasks = tasks.filter((t) => !t.priorityId);
  const prioritizedTasksRaw = tasks.filter((t) => t.priorityId);

  const prioritizedTasks = prioritizedTasksRaw
    .map((task) => {
      const priority = priorities.find((p) => p.id === task.priorityId);
      return { task, priority };
    })
    .sort((a, b) => {
      const ao = a.priority?.order ?? 0;
      const bo = b.priority?.order ?? 0;
      return ao - bo;
    });

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleChangeTaskPriority = async (taskId: string, value: string) => {
    const priorityId = value === "" ? null : value;
    await setTaskPriority(taskId, priorityId);

    if (priorityId) {
      setSelectedTaskId(null);
    }
  };

  const handleConfirmPriorities = () => {
    if (!tasks.length || !priorities.length || unprioritizedTasks.length > 0) {
      return;
    }

    setPrioritiesConfirmed(true);
    router.push("/strategize");
  };

  const canConfirm =
    hydrated &&
    !prioritiesConfirmed &&
    tasks.length > 0 &&
    priorities.length > 0 &&
    unprioritizedTasks.length === 0;

  return (
    <main className="ff-container">
      <h1>Prioritize</h1>
      <p className="ff-muted">
        Shape your Life Priorities, then assign each task so you&apos;re
        spending effort where it matters most.
      </p>

      {!hydrated && (
        <p className="ff-hint">Loading your tasks and priorities…</p>
      )}

      {hydrated && isLoading && <p className="ff-hint">Updating tasks…</p>}

      {error && (
        <div className="ff-error-banner">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="ff-icon-button"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {hydrated && (
        <>
          {/* Life Priorities */}
          <section className="ff-section">
            <h2>Life Priorities</h2>
            <p className="ff-hint">
              Create your core priorities, then drag to rank them. Higher on the
              list = more important.
            </p>

            <LifePriorityList priorities={priorities} />
          </section>

          {/* Unprioritized tasks */}
          <section className="ff-section">
            <h2>Unprioritized tasks</h2>
            <p className="ff-hint">
              Choose which Life Priority each task belongs to. Tasks with a
              priority will move to the section below.
            </p>

            <ul className="ff-task-list">
              {unprioritizedTasks.map((task) => (
                <li
                  key={task.id}
                  className={`ff-task ${
                    selectedTaskId === task.id ? "ff-task--selected" : ""
                  }`}
                  onClick={() => handleSelectTask(task.id)}
                >
                  <div className="ff-task-main">
                    <span className="ff-task-title">{task.title}</span>
                  </div>

                  <div className="ff-task-controls">
                    <select
                      className="ff-select"
                      value={task.priorityId ?? ""}
                      onChange={(e) =>
                        handleChangeTaskPriority(task.id, e.target.value)
                      }
                    >
                      <option value="">Unassigned</option>
                      {priorities.map((priority, index) => (
                        <option key={priority.id} value={priority.id}>
                          {index + 1}. {priority.name}
                        </option>
                      ))}
                    </select>

                    {task.priorityId && (
                      <span className="ff-check" aria-label="Prioritized">
                        ✓
                      </span>
                    )}
                  </div>
                </li>
              ))}

              {unprioritizedTasks.length === 0 && tasks.length > 0 && (
                <li className="ff-task ff-empty">
                  <span className="ff-hint">
                    You&apos;ve already assigned all tasks to Life Priorities.
                  </span>
                </li>
              )}

              {tasks.length === 0 && (
                <li className="ff-task ff-empty">
                  <span className="ff-hint">
                    No tasks yet. Capture a few in the Mind Dump first.
                  </span>
                </li>
              )}
            </ul>
          </section>

          {/* Prioritized tasks */}
          <section className="ff-section">
            <h2>Prioritized tasks</h2>
            <p className="ff-hint">
              These tasks already belong to a Life Priority. Use this list as a
              quick overview of where your energy is going.
            </p>

            <ul className="ff-task-list">
              {prioritizedTasks.map(({ task }) => (
                <li key={task.id} className="ff-task">
                  <div className="ff-task-main">
                    <span className="ff-task-title">{task.title}</span>
                  </div>

                  <div className="ff-task-controls">
                    <select
                      className="ff-select"
                      value={task.priorityId ?? ""}
                      onChange={(e) =>
                        handleChangeTaskPriority(task.id, e.target.value)
                      }
                    >
                      <option value="">Unassigned</option>
                      {priorities.map((p, index) => (
                        <option key={p.id} value={p.id}>
                          {index + 1}. {p.name}
                        </option>
                      ))}
                    </select>

                    {task.priorityId && (
                      <span className="ff-check" aria-label="Prioritized">
                        ✓
                      </span>
                    )}
                  </div>
                </li>
              ))}

              {prioritizedTasks.length === 0 && (
                <li className="ff-task ff-empty">
                  <span className="ff-hint">
                    Once you assign priorities to tasks above, they&apos;ll show
                    up here.
                  </span>
                </li>
              )}
            </ul>
          </section>

          {/* Confirm */}
          <section className="ff-section">
            <button
              type="button"
              className="ff-button"
              onClick={handleConfirmPriorities}
              disabled={!canConfirm}
            >
              {prioritiesConfirmed
                ? "Priorities confirmed"
                : "I’ve assigned every task to a Life Priority"}
            </button>
            <p className="ff-hint">
              When every task has a Life Priority, you&apos;re ready to move
              into the Strategize stage and place them in the Eisenhower Matrix.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
