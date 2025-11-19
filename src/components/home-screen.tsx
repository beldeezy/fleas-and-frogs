// src/components/home-screen.tsx
import Link from "next/link";

export default function HomeScreen() {
  return (
    <main className="ff-container">
      <h1>Fleas & Frogs</h1>

      <p>Your local-first planner for removing “fleas” and tackling “frogs.”</p>

      <ul className="mt-4 list-disc list-inside space-y-2">
        <li>
          <strong>"Fleas"</strong> are small, repetitive, annoying tasks you just
          can’t seem to get rid of … yet.
        </li>
        <li>
          <strong>"Frogs"</strong> are the big things you’ve been putting off
          recently … or for a while.
        </li>
      </ul>

      <p className="mt-4">
        Fleas & Frogs helps you clear the small stuff, confront the big stuff,
        and sort everything in between.
      </p>

      {/* CTA */}
      <div className="mt-8">
        <Link href="/mind-dump" className="ff-btn-primary">
          Get Started
        </Link>
      </div>
    </main>
  );
}
