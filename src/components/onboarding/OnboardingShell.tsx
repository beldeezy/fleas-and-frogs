"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

const ONBOARDING_STEPS = [
  { path: "/onboarding/mind-dump", label: "Mind Dump" },
  { path: "/onboarding/prioritize", label: "Prioritize" },
  { path: "/onboarding/strategize", label: "Strategize" },
];

type OnboardingShellProps = {
  children: ReactNode;
};

type OnboardingStepControlContextValue = {
  canProceed: boolean;
  setCanProceed: (value: boolean) => void;
};

const OnboardingStepControlContext =
  createContext<OnboardingStepControlContextValue | null>(null);

const defaultStepControl: OnboardingStepControlContextValue = {
  canProceed: false,
  setCanProceed: () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Fleas&Frogs] useOnboardingStepControl used outside OnboardingShell; Next will stay disabled."
      );
    }
  },
};

// Hook for child pages to control whether Next is enabled
export function useOnboardingStepControl() {
  const ctx = useContext(OnboardingStepControlContext);
  return ctx ?? defaultStepControl;
}

export function OnboardingShell({ children }: OnboardingShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [canProceed, setCanProceed] = useState(false);

  const currentIndex = ONBOARDING_STEPS.findIndex((step) =>
    pathname.startsWith(step.path)
  );

  const safeIndex =
    currentIndex < 0 || currentIndex >= ONBOARDING_STEPS.length
      ? 0
      : currentIndex;

  const totalSteps = ONBOARDING_STEPS.length;
  const stepNumber = safeIndex + 1;

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === totalSteps - 1;

  const handleNext = () => {
    if (!canProceed) return;

    if (safeIndex < totalSteps - 1) {
      const nextStep = ONBOARDING_STEPS[safeIndex + 1];
      router.push(nextStep.path);
    } else {
      // After onboarding, go to Plan
      router.push("/plan");
    }
  };

  const handleBack = () => {
    if (safeIndex > 0) {
      const prevStep = ONBOARDING_STEPS[safeIndex - 1];
      router.push(prevStep.path);
    }
  };

  const handleExit = () => {
    router.push("/dashboard");
  };

  const progressPercent = (stepNumber / totalSteps) * 100;

  return (
    <OnboardingStepControlContext.Provider
      value={{ canProceed, setCanProceed }}
    >
      <div className="onboarding-shell">
        {/* HEADER */}
        <header className="onboarding-shell-header">
          <div className="ff-container">
            {/* Top row: step text + Exit */}
            <div className="onboarding-shell-top-row">
              <div className="onboarding-shell-step-meta">
                <span className="onboarding-shell-step-count">
                  Step {stepNumber} of {totalSteps}
                </span>
                <span className="onboarding-shell-step-label">
                  {ONBOARDING_STEPS[safeIndex]?.label}
                </span>
              </div>

              <button
                type="button"
                onClick={handleExit}
                className="onboarding-exit-button"
                aria-label="Exit onboarding and return to dashboard"
              >
                Exit
              </button>
            </div>

            {/* Progress bar under the row, full width */}
            <div className="onboarding-shell-progress-bar">
              <div
                className="onboarding-shell-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="onboarding-shell-body">
          <div className="ff-container">{children}</div>
        </main>

        {/* FOOTER */}
        <footer className="onboarding-shell-footer">
          <div className="ff-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
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
                disabled={!canProceed}
              >
                {isLast ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </OnboardingStepControlContext.Provider>
  );
}
