import Dexie, { Table } from "dexie";
import { Task, Area, Priority } from "../schema";

export class FNFDatabase extends Dexie {
  tasks!: Table<Task, string>;
  areas!: Table<Area, string>;
  priorities!: Table<Priority, string>;

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
  }
}

export const db = new FNFDatabase();
