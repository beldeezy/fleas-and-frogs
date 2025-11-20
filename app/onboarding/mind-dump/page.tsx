import type { Metadata } from "next";
// Adjust path if needed
import { MindDumpTaskList } from "../../../src/components/mind-dump/MindDumpTaskList";

export const metadata: Metadata = {
  title: "Fleas & Frogs – Mind Dump (Onboarding)",
};

export default function OnboardingMindDumpPage() {
  return (
    <section className="onboarding-step">
      <header className="onboarding-step-header">
        <h1>Capture everything on your mind</h1>
        <p>
          Dump every task, idea, and worry into the list below. For now, just get it out of your head.
        </p>
      </header>

      <div className="onboarding-step-main">
        <MindDumpTaskList />
      </div>
    </section>
  );
}
