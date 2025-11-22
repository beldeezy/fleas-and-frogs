// src/components/plan/DayColumn.tsx
"use client";

import React from "react";
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

  const startMinutes =
    (start.getHours() - dayStartHour) * 60 + start.getMinutes();
  const endMinutes =
    (end.getHours() - dayStartHour) * 60 + end.getMinutes();

  const totalMinutes = (dayEndHour - dayStartHour) * 60;

  const top = Math.max(0, (startMinutes / totalMinutes) * 100);
  const bottom = Math.max(
    top + 4, // minimum height
    (endMinutes / totalMinutes) * 100
  );

  const height = bottom - top;

  return {
    top: `${top}%`,
    height: `${height}%`,
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
      return;
    }

    if (draggingBlockId) {
      onDropBlockIntoSlot(draggingBlockId, date, startHour, startMinute);
    }
  };

  const handleSlotDoubleClick = (slotIndex: number) => {
    const hourOffset = Math.floor(slotIndex / slotsPerHour);
    const minuteOffset = (slotIndex % slotsPerHour) * slotMinutes;

    const startHour = dayStartHour + hourOffset;
    const startMinute = minuteOffset;

    onCreateManualBlock(date, startHour, startMinute);
  };

  return (
    <div className="ff-plan-day-column">
      {/* Underlay: time slots */}
      <div className="ff-plan-day-slots">
        {Array.from({ length: totalSlots }, (_, index) => (
          <div
            key={index}
            className="ff-plan-slot"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleSlotDrop(index, e)}
            onDoubleClick={() => handleSlotDoubleClick(index)}
          />
        ))}
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
