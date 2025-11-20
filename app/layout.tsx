import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "../src/components/layout/AppShell";

export const metadata = {
  title: "Fleas & Frogs",
  description: "Plan your fleas and frogs with calm, focused workflows.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
