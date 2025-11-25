// src/components/plan/DayColumn.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  onDeleteBlock: (blockId: string) => void;

  // called when a resize finishes
  onResizeBlock: (
    blockId: string,
    nextStartIso: string,
    nextEndIso: string
  ) => void;
};

type ResizeState =
  | {
      blockId: string;
      mode: "start" | "end";
      startY: number;
      initialStart: string;
      initialEnd: string;
      previewStart?: string;
      previewEnd?: string;
    }
  | null;

function blockStyle(
  block: CalendarBlock,
  dayStartHour: number,
  dayEndHour: number
) {
  const start = new Date(block.start);
  const end = new Date(block.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error("[blockStyle] Invalid block dates", block);
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
  onDeleteBlock,
  onResizeBlock,
}: DayColumnProps) {
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (dayEndHour - dayStartHour) * slotsPerHour;

  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(
    null
  );
  const isDraggingSomething = !!draggingTaskId || !!draggingBlockId;

  // resize state for top/bottom handles
  const [resizeState, setResizeState] = useState<ResizeState>(null);

  // which block's popover is open in this column
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

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

  const handleResizeStart = (
    e: React.MouseEvent<HTMLDivElement>,
    block: CalendarBlock,
    mode: "start" | "end"
  ) => {
    e.preventDefault();
    e.stopPropagation(); // don't trigger block click

    // close any open popover when resizing
    setActiveBlockId(null);

    setResizeState({
      blockId: block.id,
      mode,
      startY: e.clientY,
      initialStart: block.start,
      initialEnd: block.end,
    });
  };

  // Global mouse move/up for resizing
  useEffect(() => {
    if (!resizeState) return;

    const handleMove = (e: MouseEvent) => {
      const deltaPx = e.clientY - resizeState.startY;
      const SLOT_HEIGHT_PX = 24; // matches .ff-plan-slot height
      const deltaSlots = Math.round(deltaPx / SLOT_HEIGHT_PX);
      const deltaMinutes = deltaSlots * slotMinutes;

      const initialStartDate = new Date(resizeState.initialStart);
      const initialEndDate = new Date(resizeState.initialEnd);

      let nextStart = new Date(initialStartDate);
      let nextEnd = new Date(initialEndDate);

      const minMinutes = slotMinutes;

      const dayStart = new Date(date);
      dayStart.setHours(dayStartHour, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(dayEndHour, 0, 0, 0);

      if (resizeState.mode === "start") {
        nextStart = new Date(
          initialStartDate.getTime() + deltaMinutes * 60_000
        );

        const latestStart = new Date(
          initialEndDate.getTime() - minMinutes * 60_000
        );
        if (nextStart > latestStart) nextStart = latestStart;
        if (nextStart < dayStart) nextStart = dayStart;
      } else {
        nextEnd = new Date(
          initialEndDate.getTime() + deltaMinutes * 60_000
        );

        const earliestEnd = new Date(
          initialStartDate.getTime() + minMinutes * 60_000
        );
        if (nextEnd < earliestEnd) nextEnd = earliestEnd;
        if (nextEnd > dayEnd) nextEnd = dayEnd;
      }

      setResizeState((prev) =>
        prev && prev.blockId === resizeState.blockId
          ? {
              ...prev,
              previewStart: nextStart.toISOString(),
              previewEnd: nextEnd.toISOString(),
            }
          : prev
      );
    };

    const handleUp = () => {
      if (!resizeState) return;

      const finalStart = resizeState.previewStart ?? resizeState.initialStart;
      const finalEnd = resizeState.previewEnd ?? resizeState.initialEnd;

      onResizeBlock(resizeState.blockId, finalStart, finalEnd);
      setResizeState(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [
    resizeState,
    slotMinutes,
    date,
    dayStartHour,
    dayEndHour,
    onResizeBlock,
  ]);

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
          let effectiveBlock: CalendarBlock = block;

          if (resizeState && resizeState.blockId === block.id) {
            effectiveBlock = {
              ...block,
              start: resizeState.previewStart ?? resizeState.initialStart,
              end: resizeState.previewEnd ?? resizeState.initialEnd,
            };
          }

          const position = blockStyle(
            effectiveBlock,
            dayStartHour,
            dayEndHour
          );

          const isActive = activeBlockId === block.id;

          return (
            <div
              key={block.id}
              className="ff-plan-block"
              style={position}
              draggable
              onDragStart={() => onBlockDragStart(block.id)}
              onClick={() =>
                setActiveBlockId((prev) =>
                  prev === block.id ? null : block.id
                )
              }
              role="button"
              tabIndex={0}
            >
              {/* TOP resize handle */}
              <div
                className="ff-plan-block-resize ff-plan-block-resize--top"
                onMouseDown={(e) => handleResizeStart(e, block, "start")}
              />

              <span className="ff-plan-block-title">{block.title}</span>

              {block.recurrence && block.recurrence !== "none" && (
                <span className="ff-plan-block-badge">
                  {block.recurrence}
                </span>
              )}

              {/* BOTTOM resize handle */}
              <div
                className="ff-plan-block-resize ff-plan-block-resize--bottom"
                onMouseDown={(e) => handleResizeStart(e, block, "end")}
              />

              {/* Block property popover */}
              {isActive && (
                <div
                  className="ff-plan-block-popover"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="ff-plan-block-popover-edit"
                    onClick={() => onEditBlock(block)}
                    aria-label="Edit block"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="ff-plan-block-popover-close"
                    onClick={() => {
                      onDeleteBlock(block.id);
                      setActiveBlockId(null);
                    }}
                    aria-label="Delete block"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
