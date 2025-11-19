import Link from "next/link";
import DevTaskTest from "../app/dev-task-test";

export default function HomePage() {
  return (
    <main className="ff-container">
      <h1>Fleas & Frogs 🐸</h1>
      <p>Your local-first planner for clearing fleas and tackling frogs.</p>
      <p>
        Start in your <Link href="/inbox">Inbox</Link> to triage tasks.
      </p>

      {/* Temporary dev block for testing Dexie/Zustand */}
      <section className="mt-8">
        <DevTaskTest />
      </section>
    </main>
  );
}
