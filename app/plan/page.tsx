// app/plan/page.tsx
"use client";

import { useEffect } from "react";
import { useTaskStore } from "../../src/store/taskStore";
import { useCalendarStore } from "../../src/store/calendarStore";
import { DndProvider } from "../../src/components/dnd/DndProvider";
import { WeekPlanner } from "../../src/components/plan/WeekPlanner";

export default function PlanPage() {
  // ---- Tasks ----
  const tasks = useTaskStore((state) => state.tasks);
  const tasksHydrated = useTaskStore((state) => state.hydrated ?? false);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const taskError = useTaskStore((state) => state.error);
  const clearTaskError = useTaskStore((state) => state.clearError);
  const tasksLoading = useTaskStore((state) => state.isLoading);

  // ---- Calendar Blocks ----
  const blocks = useCalendarStore((state) => state.blocks);
  const blocksHydrated = useCalendarStore((state) => state.hydrated ?? false);
  const loadBlocks = useCalendarStore((state) => state.loadBlocks);
  const blocksError = useCalendarStore((state) => state.error);
  const clearBlocksError = useCalendarStore((state) => state.clearError);
  const blocksLoading = useCalendarStore((state) => state.isLoading);

  const hydrated = tasksHydrated && blocksHydrated;

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  useEffect(() => {
    loadTasks();
    loadBlocks();
  }, [loadTasks, loadBlocks]);

  console.log(
    "PlanPage render:",
    "hydrated=",
    hydrated,
    "tasks=",
    safeTasks.length,
    "blocks=",
    safeBlocks.length
  );

  const hasError = taskError || blocksError;

  return (
    <main className="ff-container">
      <h1>Plan</h1>
      <p className="ff-muted">
        Drag tasks into your week to time-block your schedule. Double-click a
        time slot to create a manual block.
      </p>

      {!hydrated && (
        <p className="ff-hint">Loading your tasks and calendar…</p>
      )}

      {hydrated && (tasksLoading || blocksLoading) && (
        <p className="ff-hint">Updating your planner…</p>
      )}

      {hasError && (
        <div className="ff-error-banner">
          <span>{taskError || blocksError}</span>
          <button
            type="button"
            onClick={() => {
              clearTaskError();
              clearBlocksError();
            }}
            className="ff-icon-button"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {hydrated && (
        <DndProvider>
          <WeekPlanner tasks={safeTasks} blocks={safeBlocks} />
        </DndProvider>
      )}
    </main>
  );
}
