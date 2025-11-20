import type { ReactNode } from "react";
import { OnboardingShell } from "../../src/components/onboarding/OnboardingShell";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OnboardingShell>{children}</OnboardingShell>;
}
