// src/components/plan/WeekPlanner.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Task, CalendarBlock } from "../../lib/schema";
import { useCalendarStore } from "../../store/calendarStore";
import { ScheduleSidebar } from "../plan/ScheduleSidebar";
import { DayColumn } from "../plan/DayColumn";

type WeekPlannerProps = {
  tasks: Task[];
  blocks: CalendarBlock[];
};

type ViewMode = "week" | "today" | "month";

const DAY_START_HOUR = 5;
const DAY_END_HOUR = 12; // noon

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // make Monday=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function WeekPlanner({ tasks, blocks }: WeekPlannerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date())
  );
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [slotMinutes, setSlotMinutes] = useState<number>(30);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

  const addBlock = useCalendarStore((state) => state.addBlock);
  const updateBlock = useCalendarStore((state) => state.updateBlock);
  const deleteBlock = useCalendarStore((state) => state.deleteBlock);

  // Tasks that are in the "plan" Eisenhower quadrant become schedule candidates
  const scheduledTasks = useMemo(
    () => tasks.filter((t) => t.eisenhower === "plan"),
    [tasks]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const blocksByDay = useMemo(() => {
    return weekDays.map((day) => {
      const dayBlocks = blocks.filter((block) => {
        const start = new Date(block.start);
        return isSameDay(start, day);
      });
      return dayBlocks;
    });
  }, [blocks, weekDays]);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todaysBlocks = useMemo(
    () =>
      blocks.filter((block) =>
        isSameDay(new Date(block.start), todayDate)
      ),
    [blocks, todayDate]
  );

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
    if (viewMode === "today") {
      setViewMode("week");
    }
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
    if (viewMode === "today") {
      setViewMode("week");
    }
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date()));
    setViewMode("today");
  };

  const handleTaskDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
    setDraggingBlockId(null);
  };

  const handleBlockDragStart = (blockId: string) => {
    setDraggingBlockId(blockId);
    setDraggingTaskId(null);
  };

  const handleDropTaskIntoSlot = async (
    taskId: string,
    day: Date,
    startHour: number,
    startMinute: number
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.warn("Dropped task not found", taskId);
      setDraggingTaskId(null);
      return;
    }

    const start = new Date(day);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(start.getTime() + slotMinutes * 60_000);

    try {
      await addBlock({
        taskId,
        title: task.title,
        notes: null,
        start: start.toISOString(),
        end: end.toISOString(),
        recurrence: "none",
        color: "rgba(105, 53, 244, 0.12)", // subtle transparent purple
      });
    } catch (err) {
      console.error("Failed to add calendar block from drop", err);
    } finally {
      setDraggingTaskId(null);
    }
  };

  const handleDropBlockIntoSlot = async (
    blockId: string,
    day: Date,
    startHour: number,
    startMinute: number
  ) => {
    const existing = blocks.find((b) => b.id === blockId);
    if (!existing) {
      console.warn("Dropped block not found", blockId);
      setDraggingBlockId(null);
      return;
    }

    const startOld = new Date(existing.start);
    const endOld = new Date(existing.end);
    const durationMs = endOld.getTime() - startOld.getTime();

    const start = new Date(day);
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date(start.getTime() + durationMs);

    try {
      await updateBlock(blockId, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
    } catch (err) {
      console.error("Failed to move calendar block", err);
    } finally {
      setDraggingBlockId(null);
    }
  };

  const handleCreateManualBlock = async (
    day: Date,
    startHour: number,
    startMinute: number
  ) => {
    const title = window.prompt("Block title?", "Focus block");
    if (!title) return;

    const start = new Date(day);
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date(start.getTime() + slotMinutes * 60_000);

    try {
      await addBlock({
        taskId: null,
        title,
        notes: null,
        start: start.toISOString(),
        end: end.toISOString(),
        recurrence: "none",
        color: "rgba(105, 53, 244, 0.12)",
      });
    } catch (err) {
      console.error("Failed to add manual calendar block", err);
    }
  };

  const handleEditBlock = async (block: CalendarBlock) => {
    const shouldDelete = window.confirm(
      "Do you want to delete this block?\n\nPress OK to delete, or Cancel to edit it instead."
    );

    if (shouldDelete) {
      try {
        await deleteBlock(block.id);
      } catch (err) {
        console.error("Failed to delete block", err);
      }
      return;
    }

    const nextNotes =
      window.prompt(
        "Notes / description (leave blank to clear):",
        block.notes ?? ""
      ) ?? block.notes;

    const currentRecurrence = block.recurrence ?? "none";
    const recurrenceInput =
      window.prompt(
        'Recurrence? Type "none", "daily", or "weekly":',
        currentRecurrence
      ) ?? currentRecurrence;

    const normalizedRecurrence = ["none", "daily", "weekly"].includes(
      recurrenceInput
    )
      ? (recurrenceInput as CalendarBlock["recurrence"])
      : currentRecurrence;

    try {
      await updateBlock(block.id, {
        notes: nextNotes || null,
        recurrence: normalizedRecurrence,
      });
    } catch (err) {
      console.error("Failed to update block", err);
    }
  };

  useEffect(() => {
    console.log(
      "WeekPlanner:",
      "viewMode=",
      viewMode,
      "slotMinutes=",
      slotMinutes,
      "draggingTaskId=",
      draggingTaskId,
      "draggingBlockId=",
      draggingBlockId
    );
  }, [viewMode, slotMinutes, draggingTaskId, draggingBlockId]);

  return (
    <div className="ff-plan-layout">
      {/* Left: Schedule sidebar */}
      <aside className="ff-plan-sidebar">
        <ScheduleSidebar
          tasks={scheduledTasks}
          onTaskDragStart={handleTaskDragStart}
        />
      </aside>

      {/* Right: Planner */}
      <section className="ff-plan-main">
      <header className="ff-plan-toolbar">
          {/* Row 1: Week label */}
          <div className="ff-plan-week-label-row">
            <span className="ff-plan-week-label">
              Week of{" "}
              {currentWeekStart.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Row 2: Prev / Today / Next */}
          <div className="ff-plan-toolbar-row">
            <button
              type="button"
              className="ff-button"
              onClick={handlePrevWeek}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="ff-button"
              onClick={handleToday}
            >
              Today
            </button>
            <button
              type="button"
              className="ff-button"
              onClick={handleNextWeek}
            >
              Next →
            </button>
          </div>

          {/* Row 3: View + Slot controls */}
          <div className="ff-plan-toolbar-row ff-plan-toolbar-row--controls">
            <label className="ff-plan-control">
              View:
              <select
                value={viewMode}
                onChange={(e) =>
                  setViewMode(e.target.value as ViewMode)
                }
              >
                <option value="week">Week</option>
                <option value="today">Today</option>
                <option value="month">Month</option>
              </select>
            </label>

            <label className="ff-plan-control">
              Slot:
              <select
                value={slotMinutes}
                onChange={(e) =>
                  setSlotMinutes(Number(e.target.value))
                }
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
            </label>
          </div>
        </header>


        {/* Week view */}
        {viewMode === "week" && (
          <div className="ff-plan-week-grid">
            {/* Column headers */}
            <div className="ff-plan-week-header-row">
              <div className="ff-plan-time-gutter" />
              {weekDays.map((day, idx) => (
                <div key={idx} className="ff-plan-day-header">
                  <div className="ff-plan-day-name">
                    {day.toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </div>
                  <div className="ff-plan-day-date">
                    {day.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="ff-plan-week-body">
              <div className="ff-plan-time-gutter">
                {Array.from(
                  {
                    length: DAY_END_HOUR - DAY_START_HOUR,
                  },
                  (_, i) => DAY_START_HOUR + i
                ).map((hour) => (
                  <div
                    key={hour}
                    className="ff-plan-time-label"
                  >
                    {new Date(0, 0, 0, hour).toLocaleTimeString(
                      [],
                      { hour: "numeric" }
                    )}
                  </div>
                ))}
              </div>

              {weekDays.map((day, index) => (
                <DayColumn
                  key={index}
                  date={day}
                  blocks={blocksByDay[index] ?? []}
                  dayStartHour={DAY_START_HOUR}
                  dayEndHour={DAY_END_HOUR}
                  slotMinutes={slotMinutes}
                  draggingTaskId={draggingTaskId}
                  draggingBlockId={draggingBlockId}
                  onDropTaskIntoSlot={handleDropTaskIntoSlot}
                  onDropBlockIntoSlot={handleDropBlockIntoSlot}
                  onBlockDragStart={handleBlockDragStart}
                  onCreateManualBlock={handleCreateManualBlock}
                  onEditBlock={handleEditBlock}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today view */}
        {viewMode === "today" && (
          <div className="ff-plan-week-grid ff-plan-today-grid">
            <div className="ff-plan-week-header-row">
              <div className="ff-plan-time-gutter" />
              <div className="ff-plan-day-header">
                <div className="ff-plan-day-name">
                  {todayDate.toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </div>
                <div className="ff-plan-day-date">
                  {todayDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="ff-plan-week-body ff-plan-week-body--today">
              <div className="ff-plan-time-gutter">
                {Array.from(
                  {
                    length: DAY_END_HOUR - DAY_START_HOUR,
                  },
                  (_, i) => DAY_START_HOUR + i
                ).map((hour) => (
                  <div
                    key={hour}
                    className="ff-plan-time-label"
                  >
                    {new Date(0, 0, 0, hour).toLocaleTimeString(
                      [],
                      { hour: "numeric" }
                    )}
                  </div>
                ))}
              </div>

              <DayColumn
                date={todayDate}
                blocks={todaysBlocks}
                dayStartHour={DAY_START_HOUR}
                dayEndHour={DAY_END_HOUR}
                slotMinutes={slotMinutes}
                draggingTaskId={draggingTaskId}
                draggingBlockId={draggingBlockId}
                onDropTaskIntoSlot={handleDropTaskIntoSlot}
                onDropBlockIntoSlot={handleDropBlockIntoSlot}
                onBlockDragStart={handleBlockDragStart}
                onCreateManualBlock={handleCreateManualBlock}
                onEditBlock={handleEditBlock}
              />
            </div>
          </div>
        )}

        {/* Month view (unchanged logic) */}
        {viewMode === "month" && (
          <div className="ff-plan-month-hint">
            <p className="ff-hint">
              Month view v1: showing which days have scheduled blocks.
              (We can expand this into a full calendar later.)
            </p>
            <div className="ff-plan-month-grid">
              {weekDays.map((day, idx) => {
                const count = blocksByDay[idx]?.length ?? 0;
                return (
                  <div
                    key={idx}
                    className="ff-plan-month-day-cell"
                  >
                    <div className="ff-plan-month-day-label">
                      {day.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="ff-plan-month-day-count">
                      {count > 0
                        ? `${count} block${count > 1 ? "s" : ""}`
                        : "No blocks"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
