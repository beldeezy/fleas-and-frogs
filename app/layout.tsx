import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleas & Frogs",
  description: "Local-first planner for clearing fleas and tackling frogs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="ff-header">
          <div className="ff-logo">F&F</div>
          <nav className="ff-nav">
            <Link href="/mind-dump" className="ff-nav-link ff-nav-link--active">
              Mind Dump
            </Link>
            <Link href="/prioritize" className="ff-nav-link">
              Prioritize
            </Link>
            <Link href="/strategize" className="ff-nav-link">
              Strategize
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
