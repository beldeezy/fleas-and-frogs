"use client";

import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="ff-container ff-dashboard">
      <header
        className="ff-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "1rem",
        }}
      >
        <div>
          <h1>Dashboard</h1>
          <p className="ff-muted">
            See where your fleas and frogs are, then jump into the right stage.
          </p>
        </div>

        {/* Simple placeholder for future filters / user menu */}
        <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
          <span>v0.1 • Fleas &amp; Frogs</span>
        </div>
      </header>

      <section
        className="ff-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {children}
      </section>
    </main>
  );
}
