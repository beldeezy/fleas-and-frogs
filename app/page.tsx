import Link from "next/link";

export default function Home() {
  return (
    <main className="ff-container">
      <h1>Fleas & Frogs 🐸</h1>
      <p>Your local-first planner for clearing fleas and tackling frogs.</p>
      <p>
        Start in your <Link href="/inbox">Inbox</Link> to triage tasks.
      </p>
    </main>
  );
}
