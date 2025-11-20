"use client";

import { useEffect } from "react";
import { useTaskStore } from "../../../src/store/taskStore";
import { MindDumpInput } from "../../../src/components/mind-dump/MindDumpInput";
import { MindDumpTaskList } from "../../../src/components/mind-dump/MindDumpTaskList";

export default function OnboardingMindDumpPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const error = useTaskStore((s) => s.error);
  const clearError = useTaskStore((s) => s.clearError);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  return (
    <section className="onboarding-step">
      <header className="onboarding-step-header">
        <h1>Mind Dump</h1>
        <p>
          Dump every task, idea, and worry into the list below. For now, just
          get it out of your head.
        </p>
      </header>

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

      {!hydrated && <p className="ff-hint">Loading your tasks…</p>}

      <div
        className="onboarding-step-main"
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <section className="ff-section">
          <MindDumpInput />
        </section>

        <MindDumpTaskList />

        {hydrated && !mindDumpTasks.length && (
          <p className="ff-hint">
            Start typing above to dump tasks from your head.
          </p>
        )}
      </div>
    </section>
  );
}
