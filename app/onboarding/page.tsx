// app/onboarding/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "../../src/store/taskStore";
import { usePriorityStore } from "../../src/store/priorityStore";
import { useOnboardingProgress } from "../../src/hooks/useOnboardingProgress";

export default function OnboardingEntryPage() {
  const router = useRouter();

  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadPriorities = usePriorityStore((s) => s.loadPriorities);

  const { hydrated, recommendedStep } = useOnboardingProgress();

  // Kick off hydration for both stores
  useEffect(() => {
    loadTasks();
    loadPriorities();
  }, [loadTasks, loadPriorities]);

  // Once hydrated, redirect to the right step
  useEffect(() => {
    if (!hydrated) return;
    router.replace(recommendedStep);
  }, [hydrated, recommendedStep, router]);

  return (
    <main className="ff-container">
      <p className="ff-hint">Checking where to pick up your onboarding…</p>
    </main>
  );
}
