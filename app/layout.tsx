import type { Metadata } from "next";
import "./globals.css";

import Header from "../src/components/Header"; 

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
        <Header />
        {children}
      </body>
    </html>
  );
}
