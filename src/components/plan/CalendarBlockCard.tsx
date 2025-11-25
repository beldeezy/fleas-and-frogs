"use client";

import type { CalendarBlock } from "../../lib/schema";

type CalendarBlockCardProps = {
  block: CalendarBlock;
  onDragStart?: (id: string) => void;
  onResize?: (id: string, newStart: string, newEnd: string) => void;
  isSelected?: boolean;
};

export function CalendarBlockCard({
  block,
  onDragStart,
  onResize,
  isSelected = false,
}: CalendarBlockCardProps) {
  const handleDragStart = () => {
    if (!onDragStart) return;
    onDragStart(block.id);
  };

  // naive example for resize hooks – you’ll wire real UI later
  const handleExtendDown = () => {
    if (!onResize) return;

    const currentEnd = new Date(block.end);
    const newEnd = new Date(currentEnd.getTime() + 30 * 60 * 1000); // +30min

    onResize(block.id, block.start, newEnd.toISOString());
  };

  return (
    <div
      className={`ff-calendar-block ${isSelected ? "ff-calendar-block--selected" : ""}`}
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
    >
      <div className="ff-calendar-block-main">
        <div className="ff-calendar-block-title">{block.title}</div>
        {block.notes && (
          <div className="ff-calendar-block-notes">{block.notes}</div>
        )}
      </div>

      {onResize && (
        <button
          type="button"
          className="ff-calendar-block-resize-handle"
          onClick={handleExtendDown}
          aria-label="Extend block"
        >
          ▾
        </button>
      )}
    </div>
  );
}
