"use client";

import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useTaskStore } from "../../store/taskStore";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type MindDumpInputProps = {
  disabled?: boolean;
};

export function MindDumpInput({ disabled = false }: MindDumpInputProps) {
  const [value, setValue] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 🔑 Use simple selectors to avoid the external store warning
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const clearError = useTaskStore((s) => s.clearError);

  // helper: normalized string
  const normalize = (s: string) => s.trim().toLowerCase();

  // only compare against mind-dump tasks
  const mindDumpTasks = tasks.filter((t) => t.areaId === "mind-dump");

  // Focus on mount (and when re-enabled)
  useEffect(() => {
    if (disabled) return;
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Debounced value for duplicate warning
  const debouncedValue = useDebouncedValue(value, 250);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    setValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (disabled) return;

    const trimmed = value.trim();
    if (!trimmed) return;

    // Check duplicates (case-insensitive) within mind-dump
    const exists = mindDumpTasks.some(
      (t) => normalize(t.title ?? "") === normalize(trimmed)
    );

    if (exists) {
      setDuplicateWarning("You’ve already captured this task.");
      return;
    }

    try {
      await addTask({
        title: trimmed,
        areaId: "mind-dump",
        status: "todo",
      });

      setValue("");
      setDuplicateWarning(null);
      clearError(); // clear any previous error on success

      // re-focus after add
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Failed to add task:", err);
      // store will handle the user-facing error message
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent new line
      await handleSubmit();
    }
  };

  // Debounced duplicate warning as you type (using debouncedValue)
  useEffect(() => {
    if (!debouncedValue.trim() || disabled) {
      setDuplicateWarning(null);
      return;
    }

    const trimmed = debouncedValue.trim();
    const exists = mindDumpTasks.some(
      (t) => normalize(t.title ?? "") === normalize(trimmed)
    );
    setDuplicateWarning(
      exists ? "You’ve already captured this task." : null
    );
  }, [debouncedValue, mindDumpTasks, disabled]);

  return (
    <div
      className="minddump-input"
      style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={
          "Type a thought and press Enter.\n\nFor a new line press Shift+Enter."
        }
        rows={3}
        disabled={disabled}
        className="ff-input"
        style={{ resize: "vertical" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {duplicateWarning && (
          <p className="minddump-duplicate-warning ff-hint">
            {duplicateWarning} Try rephrasing or adding more detail.
          </p>
        )}

        <button
          type="button"
          className="ff-button"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Add
        </button>
      </div>
    </div>
  );
}
