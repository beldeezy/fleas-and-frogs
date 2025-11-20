"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const ONBOARDING_STEPS = [
  { path: "/onboarding/mind-dump", label: "Mind Dump" },
  { path: "/onboarding/prioritize", label: "Prioritize" },
  { path: "/onboarding/strategize", label: "Strategize" },
];

type OnboardingShellProps = {
  children: ReactNode;
};

export function OnboardingShell({ children }: OnboardingShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = ONBOARDING_STEPS.findIndex((step) =>
    pathname.startsWith(step.path)
  );

  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const totalSteps = ONBOARDING_STEPS.length;
  const stepNumber = safeIndex + 1;

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === totalSteps - 1;

  const handleNext = () => {
    if (safeIndex < totalSteps - 1) {
      const nextStep = ONBOARDING_STEPS[safeIndex + 1];
      router.push(nextStep.path);
    } else {
      router.push("/prioritize"); // temp finish target
    }
  };

  const handleBack = () => {
    if (safeIndex > 0) {
      const prevStep = ONBOARDING_STEPS[safeIndex - 1];
      router.push(prevStep.path);
    }
  };

  const progressPercent = (stepNumber / totalSteps) * 100;

  return (
    <div className="onboarding-shell">
      <header className="onboarding-shell-header">
        <div className="onboarding-shell-step-meta">
          <span className="onboarding-shell-step-count">
            Step {stepNumber} of {totalSteps}
          </span>
          <span className="onboarding-shell-step-label">
            {ONBOARDING_STEPS[safeIndex]?.label}
          </span>
        </div>

        <div className="onboarding-shell-progress-bar">
          <div
            className="onboarding-shell-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <main className="onboarding-shell-body">{children}</main>

      <footer className="onboarding-shell-footer">
        <button
          type="button"
          className="ff-button onboarding-shell-back"
          onClick={handleBack}
          disabled={isFirst}
        >
          Back
        </button>

        <button
          type="button"
          className="ff-button onboarding-shell-next"
          onClick={handleNext}
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </footer>
    </div>
  );
}
