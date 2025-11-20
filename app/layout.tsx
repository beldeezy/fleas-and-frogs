// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "../src/components/layout/AppShell";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
