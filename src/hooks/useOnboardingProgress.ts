// src/hooks/useOnboardingProgress.ts
"use client";

import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";
import { usePriorityStore } from "../store/priorityStore";

type OnboardingRecommendedStep =
  | "/onboarding/mind-dump"
  | "/onboarding/prioritize"
  | "/onboarding/strategize";

export function useOnboardingProgress() {
  const tasks = useTaskStore((s) => s.tasks);
  const tasksHydrated = useTaskStore((s) => s.hydrated);

  const priorities = usePriorityStore((s) => s.priorities ?? []);
  const prioritiesHydrated = usePriorityStore((s) => s.hydrated ?? false);

  const hydrated = tasksHydrated && prioritiesHydrated;

  return useMemo(() => {
    // Until both stores are hydrated, default to step 1
    if (!hydrated) {
      return {
        hydrated,
        hasMindDump: false,
        hasPriorities: false,
        prioritiesAssigned: false,
        recommendedStep: "/onboarding/mind-dump" as OnboardingRecommendedStep,
      };
    }

    const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");
    const hasMindDump = mindDumpTasks.length > 0;

    const hasPriorities = priorities.length > 0;

    const unprioritizedCount = tasks.filter((t) => !t.priorityId).length;
    const prioritiesAssigned =
      hasPriorities && tasks.length > 0 && unprioritizedCount === 0;

    let recommendedStep: OnboardingRecommendedStep;

    if (!hasMindDump) {
      // No mind dump yet → start at step 1
      recommendedStep = "/onboarding/mind-dump";
    } else if (!hasPriorities || !prioritiesAssigned) {
      // Has mind dump but priorities aren’t fully set → step 2
      recommendedStep = "/onboarding/prioritize";
    } else {
      // Mind dump + priorities fully assigned → step 3
      recommendedStep = "/onboarding/strategize";
    }

    return {
      hydrated,
      hasMindDump,
      hasPriorities,
      prioritiesAssigned,
      recommendedStep,
    };
  }, [hydrated, tasks, priorities]);
}
