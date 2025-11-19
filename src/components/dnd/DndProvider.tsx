"use client";

import type { ReactNode } from "react";

type DndProviderProps = {
  children: ReactNode;
};

/**
 * Placeholder DnD provider.
 * Later you can swap this to @dnd-kit or react-beautiful-dnd
 * without changing the rest of the app.
 */
export function DndProvider({ children }: DndProviderProps) {
  return <>{children}</>;
}
