// src/components/plan/DayColumn.tsx
"use client";

import React, { useState } from "react";
import type { CalendarBlock } from "../../lib/schema";

type DayColumnProps = {
  date: Date;
  blocks: CalendarBlock[];
  dayStartHour: number;
  dayEndHour: number;
  slotMinutes: number;
  draggingTaskId: string | null;
  draggingBlockId: string | null;
  onDropTaskIntoSlot: (
    taskId: string,
    day: Date,
    startHour: number,
    startMinute: number
  ) => void;
  onDropBlockIntoSlot: (
    blockId: string,
    day: Date,
    startHour: number,
    startMinute: number
  ) => void;
  onBlockDragStart: (blockId: string) => void;
  onCreateManualBlock: (
    day: Date,
    startHour: number,
    startMinute: number
  ) => void;
  onEditBlock: (block: CalendarBlock) => void;
};

function blockStyle(
  block: CalendarBlock,
  dayStartHour: number,
  dayEndHour: number
) {
  const start = new Date(block.start);
  const end = new Date(block.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error("[blockStyle] Invalid block dates", block);
    // Fallback: stick it at the top with a tiny height instead of crashing layout
    return {
      top: "0%",
      height: "4%",
    };
  }

  const totalMinutes = (dayEndHour - dayStartHour) * 60;
  if (totalMinutes <= 0) {
    console.error("[blockStyle] Invalid day range", {
      dayStartHour,
      dayEndHour,
    });
    return {
      top: "0%",
      height: "4%",
    };
  }

  const startMinutes =
    (start.getHours() - dayStartHour) * 60 + start.getMinutes();
  const endMinutes =
    (end.getHours() - dayStartHour) * 60 + end.getMinutes();

  const topPct = Math.max(0, (startMinutes / totalMinutes) * 100);
  const endPct = (endMinutes / totalMinutes) * 100;

  const bottomPct = Math.max(topPct + 4, endPct);
  const heightPct = bottomPct - topPct;

  return {
    top: `${topPct}%`,
    height: `${heightPct}%`,
  };
}

export function DayColumn({
  date,
  blocks,
  dayStartHour,
  dayEndHour,
  slotMinutes,
  draggingTaskId,
  draggingBlockId,
  onDropTaskIntoSlot,
  onDropBlockIntoSlot,
  onBlockDragStart,
  onCreateManualBlock,
  onEditBlock,
}: DayColumnProps) {
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (dayEndHour - dayStartHour) * slotsPerHour;

  // track which slot is currently being hovered during a drag
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(
    null
  );

  const isDraggingSomething = !!draggingTaskId || !!draggingBlockId;

  const handleSlotDrop = (
    slotIndex: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const hourOffset = Math.floor(slotIndex / slotsPerHour);
    const minuteOffset = (slotIndex % slotsPerHour) * slotMinutes;

    const startHour = dayStartHour + hourOffset;
    const startMinute = minuteOffset;

    if (draggingTaskId) {
      onDropTaskIntoSlot(draggingTaskId, date, startHour, startMinute);
    } else if (draggingBlockId) {
      onDropBlockIntoSlot(draggingBlockId, date, startHour, startMinute);
    }

    // clear hover state after drop
    setHoveredSlotIndex(null);
  };

  const handleSlotDoubleClick = (slotIndex: number) => {
    const hourOffset = Math.floor(slotIndex / slotsPerHour);
    const minuteOffset = (slotIndex % slotsPerHour) * slotMinutes;

    const startHour = dayStartHour + hourOffset;
    const startMinute = minuteOffset;

    onCreateManualBlock(date, startHour, startMinute);
  };

  const handleSlotDragOver = (
    slotIndex: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    if (!isDraggingSomething) return;
    setHoveredSlotIndex(slotIndex);
  };

  return (
    <div className="ff-plan-day-column">
      {/* Underlay: time slots */}
      <div className="ff-plan-day-slots">
        {Array.from({ length: totalSlots }, (_, index) => {
          const isHover =
            isDraggingSomething && hoveredSlotIndex === index;

          return (
            <div
              key={index}
              className={`ff-plan-slot ${
                isHover ? "ff-plan-slot--hover" : ""
              }`}
              onDragOver={(e) => handleSlotDragOver(index, e)}
              onDrop={(e) => handleSlotDrop(index, e)}
              onDoubleClick={() => handleSlotDoubleClick(index)}
            />
          );
        })}
      </div>

      {/* Overlay: blocks */}
      <div className="ff-plan-day-block-layer">
        {blocks.map((block) => {
          const position = blockStyle(block, dayStartHour, dayEndHour);

          return (
            <button
              key={block.id}
              type="button"
              className="ff-plan-block"
              style={position}
              draggable
              onDragStart={() => onBlockDragStart(block.id)}
              onClick={() => onEditBlock(block)}
            >
              <span className="ff-plan-block-title">{block.title}</span>
              {block.recurrence && block.recurrence !== "none" && (
                <span className="ff-plan-block-badge">
                  {block.recurrence}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
