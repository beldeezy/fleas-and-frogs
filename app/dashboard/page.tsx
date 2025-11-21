"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "../../src/components/dashboard/DashboardShell";
import { useTaskStore } from "../../src/store/taskStore";
import { usePriorityStore } from "../../src/store/priorityStore";

export default function DashboardPage() {
  // We still hydrate data so the dashboard is ready for future stats/widgets.
  const tasksHydrated = useTaskStore((s) => s.hydrated);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  const prioritiesHydrated = usePriorityStore((s) => s.hydrated ?? false);
  const loadPriorities = usePriorityStore((s) => s.loadPriorities);

  const hydrated = tasksHydrated && prioritiesHydrated;

  useEffect(() => {
    loadTasks();
    loadPriorities();
  }, [loadTasks, loadPriorities]);

  return (
    <DashboardShell>
      {/* PREPARE COLUMN */}
      <div className="ff-card">
        <h2>Prepare</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "0.75rem",
          }}
        >
          <Link href="/mind-dump">
            <button className="ff-button" style={{ width: "100%" }}>
              Mind Dump
            </button>
          </Link>

          <Link href="/prioritize">
            <button className="ff-button" style={{ width: "100%" }}>
              Prioritize
            </button>
          </Link>

          <Link href="/strategize">
            <button className="ff-button" style={{ width: "100%" }}>
              Strategize
            </button>
          </Link>
        </div>
      </div>

      {/* Plan column */}
      <div className="ff-dashboard-column">
          <h2>Plan</h2>
          <p className="ff-muted">
            Time-block your week with your key tasks.
          </p>
          <Link href="/plan" className="ff-button">
            Go Plan
          </Link>
        </div>

        {/* Do column */}
        <div className="ff-dashboard-column">
          <h2>Do</h2>
          <p className="ff-muted">
            Focus on one block at a time.
          </p>
          <Link href="/do" className="ff-button">
            Go Do
          </Link>
        </div>
    </DashboardShell>
  );
}
