import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  bookings,
  InsertBooking,
  InsertRoomPrice,
  InsertUser,
  roomPrices,
  RoomPrice,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export type RoomKey = "vip" | "vvip";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

const DEFAULT_ROOM_PRICES: Record<RoomKey, InsertRoomPrice> = {
  vip: { room: "vip", pricePerHour: 0, currency: "IQD" },
  vvip: { room: "vvip", pricePerHour: 0, currency: "IQD" },
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    if (user[field] !== undefined) {
      const normalized = user[field] ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createBooking(input: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(bookings).values(input);
  const result = await db.select().from(bookings).orderBy(desc(bookings.id)).limit(1);
  return result[0];
}

export async function listBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(id: number, status: BookingStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0];
}

export async function listRoomPrices(): Promise<RoomPrice[]> {
  const db = await getDb();
  if (!db) return [];
  const current = await db.select().from(roomPrices);
  const missing = (Object.keys(DEFAULT_ROOM_PRICES) as RoomKey[]).filter(
    room => !current.some(price => price.room === room),
  );
  if (missing.length > 0) {
    await db.insert(roomPrices).values(missing.map(room => DEFAULT_ROOM_PRICES[room]));
    return db.select().from(roomPrices);
  }
  return current;
}

export async function updateRoomPrice(room: RoomKey, pricePerHour: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(roomPrices).values({
    ...DEFAULT_ROOM_PRICES[room],
    room,
    pricePerHour,
  }).onDuplicateKeyUpdate({ set: { pricePerHour } });
  const result = await db.select().from(roomPrices).where(eq(roomPrices.room, room)).limit(1);
  return result[0];
}
