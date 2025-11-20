"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "../Header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/onboarding");

  return (
    <>
      {/* Header hidden during onboarding */}
      {!isOnboarding && <Header />}

      <main>
        {/* 
          Normal pages get the centered container 
          Onboarding pages take full width 
        */}
        {isOnboarding ? (
          children
        ) : (
          <div className="ff-container">{children}</div>
        )}
      </main>
    </>
  );
}
