"use client";

import { useEffect } from "react";
import { useTaskStore } from "../../../src/store/taskStore";
import { MindDumpInput } from "../../../src/components/mind-dump/MindDumpInput";
import { MindDumpTaskList } from "../../../src/components/mind-dump/MindDumpTaskList";
import { useOnboardingStepControl } from "../../../src/components/onboarding/OnboardingShell";

export default function OnboardingMindDumpPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const error = useTaskStore((s) => s.error);
  const clearError = useTaskStore((s) => s.clearError);

  const { setCanProceed } = useOnboardingStepControl();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  // Guardrail: enable Next only when at least one mind-dump task exists
  useEffect(() => {
    const ok = hydrated && mindDumpTasks.length > 0;
    setCanProceed(ok);
  }, [hydrated, mindDumpTasks.length, setCanProceed]);

  return (
    <section className="onboarding-step">
      <header className="onboarding-step-header">
        <h1>Capture everything on your mind</h1>
        <p>
          Dump every task, idea, and worry into the list below. Don&apos;t sort
          or judge anything yet—just get it out of your head.
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
