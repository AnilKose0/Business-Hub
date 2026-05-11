import path from "node:path";
import fs from "node:fs/promises";
import type { CalendarEvent } from "../schema/calendar";
import type { Contact } from "../schema/contacts";
import type { Mail } from "../schema/mails";
import type { Note } from "../schema/notes";
import type { Notification } from "../schema/notifications";
import type { Order } from "../schema/orders";
import type { StockItem } from "../schema/stock";
import type { WebhookSettings } from "../schema/webhook";

const VERSION = 1 as const;

export interface DatabaseSnapshot {
  version: typeof VERSION;
  webhookSettings: WebhookSettings | null;
  orders: Order[];
  stockItems: StockItem[];
  contacts: Contact[];
  mails: Mail[];
  notes: Note[];
  notifications: Notification[];
  calendarEvents: CalendarEvent[];
}

let mutexChain: Promise<unknown> = Promise.resolve();

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const task = mutexChain.then(() => fn());
  mutexChain = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

export function getDatabasePath(): string {
  if (process.env.DATA_FILE) {
    return path.resolve(process.env.DATA_FILE);
  }
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  return path.join(dir, "database.json");
}

function defaultSnapshot(): DatabaseSnapshot {
  return {
    version: VERSION,
    webhookSettings: null,
    orders: [],
    stockItems: [],
    contacts: [],
    mails: [],
    notes: [],
    notifications: [],
    calendarEvents: [],
  };
}

function reviveDate(value: unknown): Date {
  return typeof value === "string" ? new Date(value) : (value as Date);
}

export function reviveSnapshot(raw: unknown): DatabaseSnapshot {
  const s = raw as Record<string, unknown>;
  const d = defaultSnapshot();
  if (!s || typeof s !== "object") return d;

  const wh = s.webhookSettings as WebhookSettings | null | undefined;
  return {
    version: VERSION,
    webhookSettings: wh
      ? {
          ...wh,
          lastTriggeredAt: wh.lastTriggeredAt
            ? reviveDate(wh.lastTriggeredAt as unknown)
            : null,
        }
      : null,
    orders: ((s.orders as Order[]) ?? []).map((o) => ({
      ...o,
      createdAt: reviveDate((o as Order).createdAt as unknown),
    })),
    stockItems: (s.stockItems as StockItem[]) ?? [],
    contacts: (s.contacts as Contact[]) ?? [],
    mails: ((s.mails as Mail[]) ?? []).map((m) => ({
      ...m,
      receivedAt: reviveDate((m as Mail).receivedAt as unknown),
    })),
    notes: ((s.notes as Note[]) ?? []).map((n) => ({
      ...n,
      createdAt: reviveDate((n as Note).createdAt as unknown),
      updatedAt: reviveDate((n as Note).updatedAt as unknown),
    })),
    notifications: ((s.notifications as Notification[]) ?? []).map((n) => ({
      ...n,
      createdAt: reviveDate((n as Notification).createdAt as unknown),
    })),
    calendarEvents: ((s.calendarEvents as CalendarEvent[]) ?? []).map((e) => ({
      ...e,
      createdAt: reviveDate((e as CalendarEvent).createdAt as unknown),
    })),
  };
}

export async function readSnapshot(): Promise<DatabaseSnapshot> {
  const file = getDatabasePath();
  try {
    const text = await fs.readFile(file, "utf8");
    return reviveSnapshot(JSON.parse(text));
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return defaultSnapshot();
    throw e;
  }
}

export async function writeSnapshot(snapshot: DatabaseSnapshot): Promise<void> {
  const file = getDatabasePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const text = JSON.stringify(snapshot, (_key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  }, 2);
  await fs.writeFile(file, text, "utf8");
}

export function nextId<T extends { id: number }>(rows: T[]): number {
  if (rows.length === 0) return 1;
  return Math.max(...rows.map((r) => r.id)) + 1;
}

/** Read-only access; do not mutate the snapshot (pass a copy if needed). */
export async function readDb<T>(fn: (db: DatabaseSnapshot) => T | Promise<T>): Promise<T> {
  return runExclusive(async () => fn(await readSnapshot()));
}

/** Read, allow mutation of snapshot, then persist. */
export async function mutateDb<T>(fn: (db: DatabaseSnapshot) => T | Promise<T>): Promise<T> {
  return runExclusive(async () => {
    const snapshot = await readSnapshot();
    const result = await fn(snapshot);
    await writeSnapshot(snapshot);
    return result;
  });
}
