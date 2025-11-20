"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
// Adjust import to your actual header component
import Header from "../Header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/onboarding");

  return (
    <>
      {!isOnboarding && <Header />}
      <main>{children}</main>
    </>
  );
}
