import { drizzle } from "drizzle-orm/mysql2";
import {
  bookings,
  InsertBooking,
  InsertRoomPrice,
  InsertUser,
  roomPrices,
  RoomPrice,
  users,
  User,
  storeCategories,
  storeProducts,
  StoreCategory,
  StoreProduct,
  storeOrders,
  storeOrderItems,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { and, desc, eq, gte, sql } from "drizzle-orm";

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
  await db.insert(users).values(user).onDuplicateKeyUpdate({
    set: {
      name: user.name,
      email: user.email,
      lastSignedIn: new Date(),
    },
  });
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] || null;
}

export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const roomNum = data.roomNumber || 1;
  if (roomNum < 1 || roomNum > 4) {
    throw new Error("رقم الغرفة يجب أن يكون بين 1 و 4");
  }

  // Check for time overlap on the same room and date
  const existing = await db.select().from(bookings).where(
    and(
      eq(bookings.room, data.room),
      eq(bookings.roomNumber, roomNum),
      eq(bookings.bookingDate, data.bookingDate),
      sql`status != 'cancelled'`
    )
  );

  for (const b of existing) {
    // Overlap condition: startA < endB && endA > startB
    if (data.startHour < b.endHour && data.endHour > b.startHour) {
      throw new Error(`الغرفة رقم ${roomNum} محجوزة بالفعل في هذا الوقت (${b.startHour}:00 - ${b.endHour}:00). ياختر وقتاً أو غرفة أخرى.`);
    }
  }

  await db.insert(bookings).values({ ...data, roomNumber: roomNum });
  const result = await db.select().from(bookings).orderBy(desc(bookings.id)).limit(1);
  return result[0];
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bookings).where(eq(bookings.id, id));
  return { success: true };
}

export async function deleteStoreOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.transaction(async tx => {
    await tx.delete(storeOrderItems).where(eq(storeOrderItems.orderId, id));
    await tx.delete(storeOrders).where(eq(storeOrders.id, id));
  });
  return { success: true };
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

export async function listStoreCategories() {
  const db = await getDb();
  if (!db) return [];
  const list = await db.select().from(storeCategories);
  if (list.length === 0) {
    const defaults = [
      { slug: "3d-models", title: "مجسمات 3D", detail: "قطع تنطبع حسب الطلب وتضيف شخصية لمكانك.", tone: "cyan" },
      { slug: "accessories", title: "إكسسوارات اللاعب", detail: "أشياء صغيرة، فرقها كبير في جوّ اللعب.", tone: "lime" },
      { slug: "area-picks", title: "اختيارات Area", detail: "منتجات مختارة من عالم الألعاب والـ setup.", tone: "violet" },
    ];
    await db.insert(storeCategories).values(defaults);
    return db.select().from(storeCategories);
  }
  return list;
}

export async function createStoreCategory(data: { slug: string; title: string; detail?: string; tone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(storeCategories).values({
    slug: data.slug,
    title: data.title,
    detail: data.detail || "",
    tone: data.tone || "cyan",
  });
  const res = await db.select().from(storeCategories).where(eq(storeCategories.slug, data.slug)).limit(1);
  return res[0];
}

export async function updateStoreCategory(id: number, data: { title: string; detail?: string; tone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(storeCategories).set({
    title: data.title,
    detail: data.detail || "",
    tone: data.tone || "cyan",
  }).where(eq(storeCategories.id, id));
  const res = await db.select().from(storeCategories).where(eq(storeCategories.id, id)).limit(1);
  return res[0];
}

export async function deleteStoreCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(storeCategories).where(eq(storeCategories.id, id));
  return { success: true };
}

export async function listStoreProducts() {
  const db = await getDb();
  if (!db) return [];
  const list = await db.select().from(storeProducts);
  if (list.length === 0) {
    const defaults = [
      {
        categoryId: 1,
        name: "حامل سماعة نيون RGB",
        description: "حامل سماعة ألعاب عصري بإضاءة RGB متغيرة وتصميم فخم للمكتب.",
        price: 25000,
        currency: "IQD",
        imageUrl: "/manus-storage/area50-center-hero_de9fad3b.jpg",
        isAvailable: 1,
        stock: 15,
      },
      {
        categoryId: 1,
        name: "مجسم شخصية Dark Knight 3D",
        description: "مجسم مطبوع بدقة عالية بتقنية الطباعة ثلاثية الأبعاد لشخصية أسطورية.",
        price: 18000,
        currency: "IQD",
        imageUrl: "/manus-storage/area50-store-hero_cfa38d93.jpg",
        isAvailable: 1,
        stock: 8,
      },
      {
        categoryId: 2,
        name: "ماوس باد احترافي Area Edition",
        description: "سطح قماشي ناعم ومانع للانزلاق بحجم كبير يلبي احتياجات المحترفين.",
        price: 15000,
        currency: "IQD",
        imageUrl: "/manus-storage/area50-mark_6c38c50c.png",
        isAvailable: 1,
        stock: 25,
      },
    ];
    await db.insert(storeProducts).values(defaults);
    return db.select().from(storeProducts);
  }
  return list;
}

export async function createStoreProduct(data: {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  isAvailable?: number;
  stock?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(storeProducts).values({
    categoryId: data.categoryId,
    name: data.name,
    description: data.description || "",
    price: data.price,
    currency: "IQD",
    imageUrl: data.imageUrl,
    isAvailable: data.isAvailable ?? 1,
    stock: data.stock ?? 10,
  });
  const res = await db.select().from(storeProducts).orderBy(desc(storeProducts.id)).limit(1);
  return res[0];
}

export async function updateStoreProduct(id: number, data: {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  isAvailable: number;
  stock: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(storeProducts).set({
    categoryId: data.categoryId,
    name: data.name,
    description: data.description || "",
    price: data.price,
    imageUrl: data.imageUrl,
    isAvailable: data.isAvailable,
    stock: data.stock,
  }).where(eq(storeProducts.id, id));
  const res = await db.select().from(storeProducts).where(eq(storeProducts.id, id)).limit(1);
  return res[0];
}

export async function deleteStoreProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(storeProducts).where(eq(storeProducts.id, id));
  return { success: true };
}


export async function createStoreOrder(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: Array<{ productId: number; quantity: number }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.items.length === 0) throw new Error("Cart is empty");

  return db.transaction(async tx => {
    const trustedItems: Array<{ productId: number; productName: string; price: number; quantity: number }> = [];
    for (const item of data.items) {
      const [product] = await tx.select().from(storeProducts).where(eq(storeProducts.id, item.productId)).limit(1);
      if (!product || !product.isAvailable || product.stock < item.quantity) {
        throw new Error(`Product ${item.productId} is unavailable or out of stock`);
      }
      trustedItems.push({ productId: product.id, productName: product.name, price: product.price, quantity: item.quantity });
    }

    const totalAmount = trustedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [orderResult] = await tx.insert(storeOrders).values({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      notes: data.notes || "",
      totalAmount,
      currency: "IQD",
      status: "pending",
    });
    const orderId = Number(orderResult.insertId);

    for (const item of trustedItems) {
      await tx.update(storeProducts)
        .set({ stock: sql`${storeProducts.stock} - ${item.quantity}` })
        .where(and(eq(storeProducts.id, item.productId), gte(storeProducts.stock, item.quantity)));
    }

    await tx.insert(storeOrderItems).values(trustedItems.map(item => ({ ...item, orderId })));
    const [order] = await tx.select().from(storeOrders).where(eq(storeOrders.id, orderId)).limit(1);
    const items = await tx.select().from(storeOrderItems).where(eq(storeOrderItems.orderId, orderId));
    return order ? { ...order, items } : null;
  });
}

export async function getStoreOrderById(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [order] = await db.select().from(storeOrders).where(eq(storeOrders.id, orderId)).limit(1);
  if (!order) return null;
  const items = await db.select().from(storeOrderItems).where(eq(storeOrderItems.orderId, orderId));
  return { ...order, items };
}

export async function getStoreOrdersList() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const orders = await db.select().from(storeOrders).orderBy(desc(storeOrders.createdAt));
  const results = [];
  for (const order of orders) {
    const items = await db.select().from(storeOrderItems).where(eq(storeOrderItems.orderId, order.id));
    results.push({ ...order, items });
  }
  return results;
}

export async function updateStoreOrderStatus(orderId: number, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(storeOrders).set({ status }).where(eq(storeOrders.id, orderId));
  return getStoreOrderById(orderId);
}
