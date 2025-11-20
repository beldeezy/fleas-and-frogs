"use client";

import { useEffect } from "react";
import { useTaskStore } from "../../src/store/taskStore"; // <-- adjust if needed
import { usePriorityStore } from "../../src/store/priorityStore"; // <-- adjust
import { DndProvider } from "../../src/components/dnd/DndProvider";
import { EisenhowerMatrix } from "../../src/components/strategize/EisenhowerMatrix";

export default function StrategizePage() {
  // ---- Tasks ----
  const tasks = useTaskStore((state) => state.tasks);
  const tasksHydrated = useTaskStore((state) => state.hydrated ?? false);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const setTaskEisenhower = useTaskStore((state) => state.setTaskEisenhower);
  const isLoading = useTaskStore((state) => state.isLoading);
  const error = useTaskStore((state) => state.error);
  const clearError = useTaskStore((state) => state.clearError);

  // ---- Life Priorities ----
  const priorities = usePriorityStore((state) => state.priorities ?? []);
  const prioritiesHydrated = usePriorityStore(
    (state) => state.hydrated ?? false
  );
  const loadPriorities = usePriorityStore((state) => state.loadPriorities);

  const hydrated = tasksHydrated && prioritiesHydrated;

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safePriorities = Array.isArray(priorities) ? priorities : [];

  useEffect(() => {
    loadTasks();
    loadPriorities();
  }, [loadTasks, loadPriorities]);

  // lightweight breadcrumb for debugging render/hydration behavior
  console.log(
    "StrategizePage render:",
    "hydrated=",
    hydrated,
    "tasks=",
    safeTasks.length,
    "priorities=",
    safePriorities.length
  );

  return (
    <main className="ff-container">
      <h1>Strategize</h1>
      <p className="ff-muted">
        Use the Eisenhower Matrix in each Life Priority to decide what to do
        now, what to plan, what to delegate, and what to drop.
      </p>

      {!hydrated && (
        <p className="ff-hint">Loading your tasks and priorities…</p>
      )}

      {hydrated && isLoading && (
        <p className="ff-hint">Updating tasks…</p>
      )}

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
        <DndProvider>
          {safePriorities.map((priority) => {
            const tasksForPriority = safeTasks.filter(
              (t) => t.priorityId === priority.id
            );

            return (
              <EisenhowerMatrix
                key={priority.id}
                priorityId={priority.id}
                priorityName={priority.name}
                tasksForPriority={tasksForPriority}
                hydrated={hydrated}
                setTaskEisenhower={setTaskEisenhower}
              />
            );
          })}

          {hydrated && !safePriorities.length && (
            <p className="ff-hint">
              You don’t have any Life Priorities yet. Start in the Prioritize
              stage to define them.
            </p>
          )}
        </DndProvider>
      )}
    </main>
  );
}
