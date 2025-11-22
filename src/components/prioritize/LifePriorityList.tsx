"use client";

import { useState, MouseEvent, DragEvent } from "react";
import { usePriorityStore } from "../../store/priorityStore";
import type { Priority } from "../../lib/schema/index";

type LifePriorityListProps = {
  priorities: Priority[];
};

export function LifePriorityList({ priorities }: LifePriorityListProps) {
  const addPriority = usePriorityStore((state) => state.addPriority);
  const deletePriority = usePriorityStore((state) => state.deletePriority);
  const reorderPriorities = usePriorityStore(
    (state) => state.reorderPriorities
  );

  const [newPriorityName, setNewPriorityName] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleAddPriority = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    const name = newPriorityName.trim();
    if (!name) return;

    await addPriority(name);
    setNewPriorityName("");
  };

  const handleDeletePriorityClick = async (id: string) => {
    await deletePriority(id);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...priorities];
    const withOrder = updated.map((p, idx) => ({
      ...p,
      order: idx,
    })) as Priority[];

    reorderPriorities(withOrder);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <>
      {/* Input row */}
      <div className="ff-task ff-task-input-row">
        <div className="ff-task-main">
          <input
            type="text"
            className="ff-input ff-input-grow"
            placeholder="Add a Life Priority (e.g., Faith, Family, Craft)"
            value={newPriorityName}
            onChange={(e) => setNewPriorityName(e.target.value)}
          />
        </div>
        <div className="ff-task-controls">
          <button
            type="button"
            className="ff-button ff-button-sm"
            onClick={handleAddPriority}
          >
            Add
          </button>
        </div>
      </div>

      {/* Draggable priority list */}
      <ul className="ff-life-priority-list">
        {priorities.map((priority, index) => (
          <li
            key={priority.id}
            className={`ff-life-priority-item ${
              dragIndex === index ? "ff-priority--dragging" : ""
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="ff-life-priority-main">
              <span className="ff-drag-handle" aria-hidden="true">
                ⋮⋮
              </span>
              <span className="ff-life-priority-rank">{index + 1}.</span>
              <span className="ff-life-priority-name">{priority.name}</span>
            </div>

            <div className="ff-life-priority-controls">
              <button
                type="button"
                className="ff-icon-button"
                aria-label={`Delete priority ${priority.name}`}
                onClick={() => handleDeletePriorityClick(priority.id)}
              >
                🗑
              </button>
            </div>
          </li>
        ))}

        {priorities.length === 0 && (
          <li className="ff-life-priority-item ff-empty">
            <span className="ff-hint">
              No Life Priorities yet. Add at least one to start shaping where
              you want your time to go.
            </span>
          </li>
        )}
      </ul>
    </>
  );
}
