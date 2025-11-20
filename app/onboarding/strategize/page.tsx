import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleas & Frogs – Strategize (Onboarding)",
};

export default function OnboardingStrategizePage() {
  return (
    <section className="onboarding-step">
      <header className="onboarding-step-header">
        <h1>Turn priorities into a simple plan</h1>
        <p>
          This stub will eventually walk the user through scheduling and
          structuring their day using the prioritized tasks.
        </p>
      </header>

      <div className="onboarding-step-main">
        <p style={{ opacity: 0.8 }}>
          Placeholder content – hook up the real Strategize flow here later.
        </p>
      </div>
    </section>
  );
}
