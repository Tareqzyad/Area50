import { mysqlTable, int, varchar, timestamp, mysqlEnum, text, tinyint } from "drizzle-orm/mysql-core";

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

export const storeCategories = mysqlTable("storeCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  detail: text("detail"),
  tone: varchar("tone", { length: 32 }).default("cyan").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const storeProducts = mysqlTable("storeProducts", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  currency: varchar("currency", { length: 8 }).default("IQD").notNull(),
  imageUrl: text("imageUrl").notNull(),
  isAvailable: tinyint("isAvailable").default(1).notNull(),
  stock: int("stock").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const storeOrders = mysqlTable("storeOrders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 180 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  customerAddress: text("customerAddress").notNull(),
  notes: text("notes"),
  totalAmount: int("totalAmount").notNull(),
  currency: varchar("currency", { length: 8 }).default("IQD").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const storeOrderItems = mysqlTable("storeOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 180 }).notNull(),
  price: int("price").notNull(),
  quantity: int("quantity").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type RoomPrice = typeof roomPrices.$inferSelect;
export type InsertRoomPrice = typeof roomPrices.$inferInsert;
export type StoreCategory = typeof storeCategories.$inferSelect;
export type InsertStoreCategory = typeof storeCategories.$inferInsert;
export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = typeof storeProducts.$inferInsert;
export type StoreOrder = typeof storeOrders.$inferSelect;
export type InsertStoreOrder = typeof storeOrders.$inferInsert;
export type StoreOrderItem = typeof storeOrderItems.$inferSelect;
export type InsertStoreOrderItem = typeof storeOrderItems.$inferInsert;
