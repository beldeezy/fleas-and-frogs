// src/lib/db/fnf-db.ts
import Dexie, { Table } from "dexie";
import { Task, Area, Priority, CalendarBlock } from "../schema";

export class FNFDatabase extends Dexie {
  tasks!: Table<Task, string>;
  areas!: Table<Area, string>;
  priorities!: Table<Priority, string>;
  calendar_blocks!: Table<CalendarBlock, string>;

  constructor() {
    super("fleas_frogs_db");

    // v1: original
    this.version(1).stores({
      tasks: "id, areaId, status, createdAt",
      areas: "id",
    });

    // v2: add priorities
    this.version(2).stores({
      tasks: "id, areaId, status, createdAt",
      areas: "id",
      priorities: "id, createdAt",
    });

    // v3: add order to priorities
    this.version(3).stores({
      tasks: "id, areaId, status, createdAt",
      areas: "id",
      priorities: "id, createdAt, order",
    });

    // v4: add priorityId + eisenhower indexes
    this.version(4).stores({
      tasks: "id, areaId, status, priorityId, eisenhower, createdAt",
      areas: "id",
      priorities: "id, createdAt, order",
    });

    // v5: add calendar_blocks table
    this.version(5).stores({
      tasks: "id, areaId, status, priorityId, eisenhower, createdAt",
      areas: "id",
      priorities: "id, createdAt, order",
      calendar_blocks: "id, start, end, taskId",
    });
  }
}

export const db = new FNFDatabase();
