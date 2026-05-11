import type { CalendarEvent, InsertCalendarEvent } from "../schema/calendar";
import type { Contact, InsertContact } from "../schema/contacts";
import type { InsertMail, Mail } from "../schema/mails";
import type { InsertNote, Note } from "../schema/notes";
import type { InsertNotification, Notification } from "../schema/notifications";
import type { Order } from "../schema/orders";
import type { InsertStockItem, StockItem } from "../schema/stock";
import type { InsertWebhookSettings, WebhookSettings } from "../schema/webhook";
import { mutateDb, readDb, nextId, type DatabaseSnapshot } from "./database";

function sortOrdersByCreatedAtDesc(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function sortNotesByCreatedAtDesc(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function sortNotificationsByCreatedAtDesc(
  notifications: Notification[],
): Notification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function sortMailsByReceivedAtDesc(mails: Mail[]): Mail[] {
  return [...mails].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
}

function sortContactsByName(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function sortStockByName(items: StockItem[]): StockItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function sortEventsByDate(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

// --- Webhook settings (single row) ---

export async function getWebhookSettingsRow(): Promise<WebhookSettings | null> {
  return readDb((db) => db.webhookSettings);
}

export async function createWebhookSettingsRow(
  values: InsertWebhookSettings,
): Promise<WebhookSettings> {
  return mutateDb((db) => {
    const row: WebhookSettings = {
      id: 1,
      webhookUrl: values.webhookUrl,
      secretToken: values.secretToken ?? null,
      isActive: values.isActive ?? true,
      lastTriggeredAt: values.lastTriggeredAt ?? null,
    };
    db.webhookSettings = row;
    return row;
  });
}

export async function updateWebhookSettingsRow(
  id: number,
  patch: Partial<Pick<WebhookSettings, "webhookUrl" | "secretToken" | "isActive" | "lastTriggeredAt">>,
): Promise<WebhookSettings | undefined> {
  return mutateDb((db) => {
    if (!db.webhookSettings || db.webhookSettings.id !== id) return undefined;
    const cur = db.webhookSettings;
    db.webhookSettings = {
      ...cur,
      ...(patch.webhookUrl !== undefined && { webhookUrl: patch.webhookUrl }),
      ...(patch.secretToken !== undefined && { secretToken: patch.secretToken }),
      ...(patch.isActive !== undefined && { isActive: patch.isActive }),
      ...(patch.lastTriggeredAt !== undefined && { lastTriggeredAt: patch.lastTriggeredAt }),
    };
    return db.webhookSettings;
  });
}

// --- Orders ---

export async function listAllOrders(): Promise<Order[]> {
  return readDb((db) => [...db.orders]);
}

export async function listOrdersByCreatedDesc(): Promise<Order[]> {
  return readDb((db) => sortOrdersByCreatedAtDesc(db.orders));
}

export async function insertOrder(values: {
  customerName: string;
  channel: string;
  items: string;
  total: string | number;
  status?: Order["status"];
}): Promise<Order> {
  return mutateDb((db) => {
    const total =
      typeof values.total === "number" ? String(values.total) : values.total;
    const row: Order = {
      id: nextId(db.orders),
      customerName: values.customerName,
      channel: values.channel,
      status: values.status ?? "pending",
      items: values.items,
      total,
      createdAt: new Date(),
    };
    db.orders.push(row);
    return row;
  });
}

export async function updateOrderStatus(
  id: number,
  status: Order["status"],
): Promise<Order | undefined> {
  return mutateDb((db) => {
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx < 0) return undefined;
    db.orders[idx] = { ...db.orders[idx], status };
    return db.orders[idx];
  });
}

// --- Stock ---

export async function listAllStockItems(): Promise<StockItem[]> {
  return readDb((db) => sortStockByName([...db.stockItems]));
}

export async function listCriticalStockItems(): Promise<StockItem[]> {
  return readDb((db) => db.stockItems.filter((s) => s.isCritical));
}

// --- Contacts ---

export async function listAllContacts(): Promise<Contact[]> {
  return readDb((db) => sortContactsByName([...db.contacts]));
}

export async function insertContact(values: InsertContact): Promise<Contact> {
  return mutateDb((db) => {
    const row: Contact = {
      id: nextId(db.contacts),
      name: values.name,
      role: values.role,
      phone: values.phone,
      email: values.email ?? null,
      address: values.address ?? null,
      type: values.type ?? "employee",
      notes: values.notes ?? null,
    };
    db.contacts.push(row);
    return row;
  });
}

// --- Mails ---

export async function listAllMails(): Promise<Mail[]> {
  return readDb((db) => sortMailsByReceivedAtDesc([...db.mails]));
}

export async function markMailRead(id: number): Promise<Mail | undefined> {
  return mutateDb((db) => {
    const idx = db.mails.findIndex((m) => m.id === id);
    if (idx < 0) return undefined;
    db.mails[idx] = { ...db.mails[idx], isRead: true };
    return db.mails[idx];
  });
}

// --- Notes ---

export async function listAllNotes(): Promise<Note[]> {
  return readDb((db) => sortNotesByCreatedAtDesc([...db.notes]));
}

export async function insertNote(values: InsertNote): Promise<Note> {
  return mutateDb((db) => {
    const now = new Date();
    const row: Note = {
      id: nextId(db.notes),
      content: values.content,
      tag: values.tag ?? null,
      isPinned: values.isPinned ?? false,
      createdAt: now,
      updatedAt: now,
    };
    db.notes.push(row);
    return row;
  });
}

export async function updateNote(
  id: number,
  patch: Partial<Pick<Note, "content" | "tag" | "isPinned">>,
): Promise<Note | undefined> {
  return mutateDb((db) => {
    const idx = db.notes.findIndex((n) => n.id === id);
    if (idx < 0) return undefined;
    const next: Note = {
      ...db.notes[idx],
      ...patch,
      tag: patch.tag !== undefined ? patch.tag : db.notes[idx].tag,
      updatedAt: new Date(),
    };
    db.notes[idx] = next;
    return next;
  });
}

export async function deleteNote(id: number): Promise<void> {
  await mutateDb((db) => {
    db.notes = db.notes.filter((n) => n.id !== id);
  });
}

// --- Notifications ---

export async function listAllNotifications(): Promise<Notification[]> {
  return readDb((db) => sortNotificationsByCreatedAtDesc([...db.notifications]));
}

export async function insertNotification(
  values: InsertNotification,
): Promise<Notification> {
  return mutateDb((db) => {
    const row: Notification = {
      id: nextId(db.notifications),
      title: values.title,
      message: values.message,
      severity: values.severity ?? "info",
      isRead: values.isRead ?? false,
      source: values.source ?? null,
      createdAt: new Date(),
    };
    db.notifications.push(row);
    return row;
  });
}

export async function markNotificationRead(
  id: number,
): Promise<Notification | undefined> {
  return mutateDb((db) => {
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx < 0) return undefined;
    db.notifications[idx] = { ...db.notifications[idx], isRead: true };
    return db.notifications[idx];
  });
}

// --- Calendar ---

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  return readDb((db) => sortEventsByDate([...db.calendarEvents]));
}

export async function insertCalendarEvent(
  values: InsertCalendarEvent,
): Promise<CalendarEvent> {
  return mutateDb((db) => {
    const row: CalendarEvent = {
      id: nextId(db.calendarEvents),
      title: values.title,
      date: values.date,
      time: values.time ?? null,
      type: values.type ?? "other",
      description: values.description ?? null,
      createdAt: new Date(),
    };
    db.calendarEvents.push(row);
    return row;
  });
}

export async function deleteCalendarEvent(id: number): Promise<void> {
  await mutateDb((db) => {
    db.calendarEvents = db.calendarEvents.filter((e) => e.id !== id);
  });
}

// --- Dashboard aggregates ---

export async function getDashboardSummaryData(): Promise<{
  orders: Order[];
  criticalStock: StockItem[];
  unreadNotifications: Notification[];
  unreadMails: Mail[];
}> {
  return readDb((db) => ({
    orders: [...db.orders],
    criticalStock: db.stockItems.filter((s) => s.isCritical),
    unreadNotifications: db.notifications.filter((n) => !n.isRead),
    unreadMails: db.mails.filter((m) => !m.isRead),
  }));
}
