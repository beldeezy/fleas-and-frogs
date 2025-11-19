"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/mind-dump", label: "Mind Dump" },
    { href: "/prioritize", label: "Prioritize" },
    { href: "/strategize", label: "Strategize" },
  ];

  return (
    <header className="ff-header">
      <Link href="/" className="ff-logo">
        F&F
      </Link>

      <nav className="ff-nav">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ff-nav-link ${
                isActive ? "ff-nav-link--active" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
