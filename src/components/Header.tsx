// src/components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide header during onboarding
  if (pathname.startsWith("/onboarding")) {
    return null;
  }

  // Drawer items only
  const navItems = [
    { href: "/mind-dump", label: "Mind Dump" },
    { href: "/prioritize", label: "Prioritize" },
    { href: "/strategize", label: "Strategize" },
    { href: "/plan", label: "Plan" },
    { href: "/do", label: "Do" },
  ];

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <header className="ff-header">
      {/* Left: Logo only */}
      <div className="ff-header-left">
        <Link href="/" className="ff-header-logo">
          F&F
        </Link>
      </div>

      {/* Right: Hamburger only */}
      <button
        type="button"
        className={`ff-menu-button ${isOpen ? "ff-menu-button--open" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <span className="ff-menu-line" />
        <span className="ff-menu-line" />
        <span className="ff-menu-line" />
      </button>

      {/* Backdrop */}
      <div
        className={`ff-nav-backdrop ${isOpen ? "ff-nav-backdrop--visible" : ""}`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`ff-nav-drawer ${isOpen ? "ff-nav-drawer--open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="ff-nav-drawer-header">
          <span className="ff-nav-drawer-title">Navigate</span>

          <button
            type="button"
            className="ff-nav-drawer-close"
            aria-label="Close menu"
            onClick={close}
          >
            ×
          </button>
        </div>

        <nav className="ff-nav-drawer-list" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ff-nav-drawer-link ${
                  isActive ? "ff-nav-drawer-link--active" : ""
                }`}
                onClick={close}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </header>
  );
}
