import { int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  room: mysqlEnum("room", ["vip", "vvip"]).notNull(),
  guestName: varchar("guestName", { length: 120 }).notNull(),
  bookingDate: varchar("bookingDate", { length: 10 }).notNull(),
  startHour: int("startHour").notNull(),
  endHour: int("endHour").notNull(),
  guests: int("guests").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const roomPrices = mysqlTable("roomPrices", {
  id: int("id").autoincrement().primaryKey(),
  room: mysqlEnum("room", ["vip", "vvip"]).notNull().unique(),
  pricePerHour: int("pricePerHour").default(0).notNull(),
  currency: varchar("currency", { length: 8 }).default("IQD").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type RoomPrice = typeof roomPrices.$inferSelect;
export type InsertRoomPrice = typeof roomPrices.$inferInsert;
