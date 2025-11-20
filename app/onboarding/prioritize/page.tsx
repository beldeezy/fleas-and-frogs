import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleas & Frogs – Prioritize (Onboarding)",
};

export default function OnboardingPrioritizePage() {
  return (
    <section className="onboarding-step">
      <header className="onboarding-step-header">
        <h1>Prioritize what matters most</h1>
        <p>
          This is a stub for now. Later, this will guide the user to rank tasks
          and focus on what actually moves the needle.
        </p>
      </header>

      <div className="onboarding-step-main">
        <p style={{ opacity: 0.8 }}>
          Placeholder content – you can wire in the real Prioritize UI here
          when it&apos;s ready.
        </p>
      </div>
    </section>
  );
}
