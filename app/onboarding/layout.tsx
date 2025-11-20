// app/onboarding/layout.tsx
import type { ReactNode } from "react";
import { OnboardingShell } from "../../src/components/onboarding/OnboardingShell";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return <OnboardingShell>{children}</OnboardingShell>;
}
