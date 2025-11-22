// src/components/plan/WeekPlanner.tsx
"use client";

import { useMemo, useState } from "react";
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
const EXIT_ANIMATION_MS = 1600; // match your .ff-task--leaving animation duration

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
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

  const [leavingTasks, setLeavingTasks] = useState<Set<string>>(new Set());

  const addBlock = useCalendarStore((s) => s.addBlock);
  const updateBlock = useCalendarStore((s) => s.updateBlock);
  const deleteBlock = useCalendarStore((s) => s.deleteBlock);

  console.log(
    "[WeekPlanner] render",
    "tasks:",
    tasks.length,
    "blocks:",
    blocks.length,
    "viewMode:",
    viewMode
  );

  //
  // ---------------------------------------------------------
  // Scheduled vs Unscheduled Task Logic
  // ---------------------------------------------------------
  //

  const scheduleCandidates = useMemo(
    () => tasks.filter((t) => t.eisenhower === "plan"),
    [tasks]
  );

  const blocksByTaskId = useMemo(() => {
    const map = new Map<string, CalendarBlock[]>();
    for (const block of blocks) {
      if (!block.taskId) continue;
      const list = map.get(block.taskId) ?? [];
      list.push(block);
      map.set(block.taskId, list);
    }
    return map;
  }, [blocks]);

  const unscheduledTasks = useMemo(
    () => scheduleCandidates.filter((t) => !blocksByTaskId.has(t.id)),
    [scheduleCandidates, blocksByTaskId]
  );

  const scheduledTasks = useMemo(
    () => scheduleCandidates.filter((t) => blocksByTaskId.has(t.id)),
    [scheduleCandidates, blocksByTaskId]
  );

  //
  // ---------------------------------------------------------
  //

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const blocksByDay = useMemo(() => {
    return weekDays.map((day) =>
      blocks.filter((block) => isSameDay(new Date(block.start), day))
    );
  }, [blocks, weekDays]);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todaysBlocks = useMemo(
    () => blocks.filter((block) => isSameDay(new Date(block.start), todayDate)),
    [blocks, todayDate]
  );

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
    if (viewMode === "today") setViewMode("week");
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
    if (viewMode === "today") setViewMode("week");
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

  const handleDropTaskIntoSlot = (
    taskId: string,
    day: Date,
    startHour: number,
    startMinute: number
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const start = new Date(day);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(start.getTime() + slotMinutes * 60_000);

    // Mark task as "leaving" so CSS can animate it out of the unscheduled list
    setLeavingTasks((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });

    window.setTimeout(async () => {
      try {
        await addBlock({
          taskId,
          title: task.title,
          notes: null,
          start: start.toISOString(),
          end: end.toISOString(),
          recurrence: "none",
          color: "rgba(105,53,244,0.12)",
        });
      } catch (err) {
        console.error("Failed to add calendar block from drop", err);
      } finally {
        setLeavingTasks((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        setDraggingTaskId(null);
      }
    }, EXIT_ANIMATION_MS);
  };

  const handleDropBlockIntoSlot = async (
    blockId: string,
    day: Date,
    startHour: number,
    startMinute: number
  ) => {
    const existing = blocks.find((b) => b.id === blockId);
    if (!existing) return;

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

    await addBlock({
      taskId: null,
      title,
      notes: null,
      start: start.toISOString(),
      end: end.toISOString(),
      recurrence: "none",
      color: "rgba(105,53,244,0.12)",
    });
  };

  const handleEditBlock = async (block: CalendarBlock) => {
    const shouldDelete = window.confirm("Delete this block? OK = delete.");

    if (shouldDelete) {
      await deleteBlock(block.id);
      return;
    }

    const nextNotes =
      window.prompt("Notes (blank to clear):", block.notes ?? "") ??
      block.notes;

    try {
      await updateBlock(block.id, { notes: nextNotes || null });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="ff-plan-layout">
      {/* LEFT SIDEBAR */}
      <aside className="ff-plan-sidebar">
      <ScheduleSidebar
        unscheduled={unscheduledTasks}
        scheduled={scheduledTasks}
        leavingTasks={leavingTasks}    // ← REQUIRED
        onTaskDragStart={handleTaskDragStart}
      />

      </aside>

      {/* RIGHT: Calendar */}
      <section className="ff-plan-main">
        <header className="ff-plan-toolbar">
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

          <div className="ff-plan-toolbar-row">
            <button className="ff-button" onClick={handlePrevWeek}>
              ← Prev
            </button>
            <button className="ff-button" onClick={handleToday}>
              Today
            </button>
            <button className="ff-button" onClick={handleNextWeek}>
              Next →
            </button>
          </div>

          <div className="ff-plan-toolbar-row ff-plan-toolbar-row--controls">
            <label className="ff-plan-control">
              View:
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
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
                onChange={(e) => setSlotMinutes(Number(e.target.value))}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
            </label>
          </div>
        </header>

        {viewMode === "week" && (
          <div className="ff-plan-week-grid">
            <div className="ff-plan-week-header-row">
              <div className="ff-plan-time-gutter" />
              {weekDays.map((day, idx) => (
                <div key={idx} className="ff-plan-day-header">
                  <div className="ff-plan-day-name">
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
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

            <div className="ff-plan-week-body">
              <div className="ff-plan-time-gutter">
                {Array.from(
                  { length: DAY_END_HOUR - DAY_START_HOUR },
                  (_, i) => DAY_START_HOUR + i
                ).map((hour) => (
                  <div key={hour} className="ff-plan-time-label">
                    {new Date(0, 0, 0, hour).toLocaleTimeString([], {
                      hour: "numeric",
                    })}
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
                  { length: DAY_END_HOUR - DAY_START_HOUR },
                  (_, i) => DAY_START_HOUR + i
                ).map((hour) => (
                  <div key={hour} className="ff-plan-time-label">
                    {new Date(0, 0, 0, hour).toLocaleTimeString([], {
                      hour: "numeric",
                    })}
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

        {viewMode === "month" && (
          <div className="ff-plan-month-hint">
            <p className="ff-hint">Month view coming soon.</p>
          </div>
        )}
      </section>
    </div>
  );
}
