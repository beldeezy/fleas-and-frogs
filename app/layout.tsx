import type { Metadata } from "next";
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
            <a href="#" className="ff-nav-link ff-nav-link--active">
              Today
            </a>
            <a href="#" className="ff-nav-link">
              Week
            </a>
            <a href="#" className="ff-nav-link">
              Projects
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
