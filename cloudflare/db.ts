import { env } from "cloudflare:workers";

export type RoomKey = "vip" | "vvip";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type RoomCounts = { vip: number; vvip: number };

type Booking = {
  id: number;
  room: RoomKey;
  roomNumber: number;
  guestName: string;
  bookingDate: string;
  startHour: number;
  endHour: number;
  guests: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

type RoomPrice = {
  id: number;
  room: RoomKey;
  pricePerHour: number;
  currency: string;
  updatedAt: string;
};

type StoreCategory = {
  id: number;
  slug: string;
  title: string;
  detail: string | null;
  tone: string;
  createdAt: string;
};

type StoreProduct = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string;
  isAvailable: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

type StoreOrderItem = {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  price: number;
  quantity: number;
};

type StoreOrder = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string | null;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_ROOM_COUNTS: RoomCounts = { vip: 4, vvip: 4 };
const DEFAULT_ROOM_PRICES: Record<RoomKey, Pick<RoomPrice, "room" | "pricePerHour" | "currency">> = {
  vip: { room: "vip", pricePerHour: 0, currency: "IQD" },
  vvip: { room: "vvip", pricePerHour: 0, currency: "IQD" },
};
const ROOM_COUNTS_SETTING_ID = "room_counts";
const MANUS_ASSET_BASE = "https://area50game-jujyunld.manus.space/manus-storage";

function database() {
  if (!env.AREA50_DB) throw new Error("Cloudflare D1 database is not configured");
  return env.AREA50_DB;
}

async function rows<T>(query: string, ...params: unknown[]): Promise<T[]> {
  const result = await database().prepare(query).bind(...params).all<T>();
  return result.results;
}

async function one<T>(query: string, ...params: unknown[]): Promise<T | null> {
  const result = await rows<T>(query, ...params);
  return result[0] ?? null;
}

function parseRoomCounts(value: string): RoomCounts {
  try {
    const data = JSON.parse(value) as Partial<RoomCounts>;
    const normalize = (count: number | undefined, fallback: number) =>
      Number.isInteger(count) ? Math.max(1, Math.min(50, Number(count))) : fallback;
    return { vip: normalize(data.vip, 4), vvip: normalize(data.vvip, 4) };
  } catch {
    return { ...DEFAULT_ROOM_COUNTS };
  }
}

export function bookingTimesOverlap(
  candidate: Pick<Booking, "room" | "roomNumber" | "bookingDate" | "startHour" | "endHour">,
  existing: Pick<Booking, "room" | "roomNumber" | "bookingDate" | "startHour" | "endHour" | "status">,
): boolean {
  return existing.status !== "cancelled"
    && candidate.room === existing.room
    && candidate.roomNumber === existing.roomNumber
    && candidate.bookingDate === existing.bookingDate
    && candidate.startHour < existing.endHour
    && candidate.endHour > existing.startHour;
}

export async function getRoomCounts(): Promise<RoomCounts> {
  const setting = await one<{ value: string }>("SELECT value FROM system_settings WHERE id = ?", ROOM_COUNTS_SETTING_ID);
  if (setting) return parseRoomCounts(setting.value);
  await database().prepare(
    "INSERT OR IGNORE INTO system_settings (id, value) VALUES (?, ?)",
  ).bind(ROOM_COUNTS_SETTING_ID, JSON.stringify(DEFAULT_ROOM_COUNTS)).run();
  return { ...DEFAULT_ROOM_COUNTS };
}

export async function updateRoomCounts(data: RoomCounts): Promise<RoomCounts> {
  if (![data.vip, data.vvip].every(count => Number.isInteger(count) && count >= 1 && count <= 50)) {
    throw new Error("عدد الغرف يجب أن يكون بين 1 و 50");
  }
  await database().prepare(
    "INSERT INTO system_settings (id, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
  ).bind(ROOM_COUNTS_SETTING_ID, JSON.stringify(data)).run();
  return data;
}

export async function createBooking(data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
  const roomCounts = await getRoomCounts();
  const maxRooms = data.room === "vip" ? roomCounts.vip : roomCounts.vvip;
  if (data.roomNumber < 1 || data.roomNumber > maxRooms) {
    throw new Error(`رقم الغرفة يجب أن يكون بين 1 و ${maxRooms}`);
  }

  const existing = await rows<Booking>(
    "SELECT * FROM bookings WHERE room = ? AND roomNumber = ? AND bookingDate = ? AND status != 'cancelled'",
    data.room,
    data.roomNumber,
    data.bookingDate,
  );
  const collision = existing.find(booking => bookingTimesOverlap(data, booking));
  if (collision) {
    throw new Error(`الغرفة رقم ${data.roomNumber} محجوزة بالفعل في هذا الوقت (${collision.startHour}:00 - ${collision.endHour}:00). اختر وقتاً أو غرفة أخرى.`);
  }

  const result = await database().prepare(
    "INSERT INTO bookings (room, roomNumber, guestName, bookingDate, startHour, endHour, guests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(data.room, data.roomNumber, data.guestName, data.bookingDate, data.startHour, data.endHour, data.guests, data.status).run();
  const booking = await one<Booking>("SELECT * FROM bookings WHERE id = ?", Number(result.meta.last_row_id));
  if (!booking) throw new Error("تعذر حفظ الحجز");
  return booking;
}

export async function listBookings(): Promise<Booking[]> {
  return rows<Booking>("SELECT * FROM bookings ORDER BY datetime(createdAt) DESC, id DESC");
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | null> {
  await database().prepare("UPDATE bookings SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").bind(status, id).run();
  return one<Booking>("SELECT * FROM bookings WHERE id = ?", id);
}

export async function deleteBooking(id: number) {
  await database().prepare("DELETE FROM bookings WHERE id = ?").bind(id).run();
  return { success: true } as const;
}

export async function listRoomPrices(): Promise<RoomPrice[]> {
  for (const room of Object.keys(DEFAULT_ROOM_PRICES) as RoomKey[]) {
    const price = DEFAULT_ROOM_PRICES[room];
    await database().prepare(
      "INSERT OR IGNORE INTO roomPrices (room, pricePerHour, currency) VALUES (?, ?, ?)",
    ).bind(price.room, price.pricePerHour, price.currency).run();
  }
  return rows<RoomPrice>("SELECT * FROM roomPrices ORDER BY id ASC");
}

export async function updateRoomPrice(room: RoomKey, pricePerHour: number): Promise<RoomPrice | null> {
  await database().prepare(
    "INSERT INTO roomPrices (room, pricePerHour, currency, updatedAt) VALUES (?, ?, 'IQD', CURRENT_TIMESTAMP) ON CONFLICT(room) DO UPDATE SET pricePerHour = excluded.pricePerHour, updatedAt = CURRENT_TIMESTAMP",
  ).bind(room, pricePerHour).run();
  return one<RoomPrice>("SELECT * FROM roomPrices WHERE room = ?", room);
}

export async function listStoreCategories(): Promise<StoreCategory[]> {
  const current = await rows<StoreCategory>("SELECT * FROM storeCategories ORDER BY id ASC");
  if (current.length > 0) return current;
  const defaults = [
    ["3d-models", "مجسمات 3D", "قطع تنطبع حسب الطلب وتضيف شخصية لمكانك.", "cyan"],
    ["accessories", "إكسسوارات اللاعب", "أشياء صغيرة، فرقها كبير في جوّ اللعب.", "lime"],
    ["area-picks", "اختيارات Area", "منتجات مختارة من عالم الألعاب والـ setup.", "violet"],
  ];
  await database().batch(defaults.map(category => database().prepare(
    "INSERT OR IGNORE INTO storeCategories (slug, title, detail, tone) VALUES (?, ?, ?, ?)",
  ).bind(...category)));
  return rows<StoreCategory>("SELECT * FROM storeCategories ORDER BY id ASC");
}

export async function createStoreCategory(data: { slug: string; title: string; detail?: string; tone?: string }): Promise<StoreCategory | null> {
  await database().prepare("INSERT INTO storeCategories (slug, title, detail, tone) VALUES (?, ?, ?, ?)")
    .bind(data.slug, data.title, data.detail || "", data.tone || "cyan").run();
  return one<StoreCategory>("SELECT * FROM storeCategories WHERE slug = ?", data.slug);
}

export async function updateStoreCategory(id: number, data: { title: string; detail?: string; tone?: string }): Promise<StoreCategory | null> {
  await database().prepare("UPDATE storeCategories SET title = ?, detail = ?, tone = ? WHERE id = ?")
    .bind(data.title, data.detail || "", data.tone || "cyan", id).run();
  return one<StoreCategory>("SELECT * FROM storeCategories WHERE id = ?", id);
}

export async function deleteStoreCategory(id: number) {
  await database().prepare("DELETE FROM storeCategories WHERE id = ?").bind(id).run();
  return { success: true } as const;
}

export async function listStoreProducts(): Promise<StoreProduct[]> {
  const current = await rows<StoreProduct>("SELECT * FROM storeProducts ORDER BY id ASC");
  if (current.length > 0) return current;
  const categories = await listStoreCategories();
  const categoryId = (slug: string) => categories.find(category => category.slug === slug)?.id;
  const defaults = [
    [categoryId("3d-models"), "حامل سماعة نيون RGB", "حامل سماعة ألعاب عصري بإضاءة RGB متغيرة وتصميم فخم للمكتب.", 25000, `${MANUS_ASSET_BASE}/area50-center-hero_de9fad3b.jpg`, 1, 15],
    [categoryId("3d-models"), "مجسم شخصية Dark Knight 3D", "مجسم مطبوع بدقة عالية بتقنية الطباعة ثلاثية الأبعاد لشخصية أسطورية.", 18000, `${MANUS_ASSET_BASE}/area50-store-hero_cfa38d93.jpg`, 1, 8],
    [categoryId("accessories"), "ماوس باد احترافي Area Edition", "سطح قماشي ناعم ومانع للانزلاق بحجم كبير يلبي احتياجات المحترفين.", 15000, `${MANUS_ASSET_BASE}/area50-mark_6c38c50c.png`, 1, 25],
  ];
  await database().batch(defaults.filter(product => product[0]).map(product => database().prepare(
    "INSERT INTO storeProducts (categoryId, name, description, price, imageUrl, isAvailable, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).bind(...product)));
  return rows<StoreProduct>("SELECT * FROM storeProducts ORDER BY id ASC");
}

export async function createStoreProduct(data: { categoryId: number; name: string; description?: string; price: number; imageUrl: string; isAvailable?: number; stock?: number }): Promise<StoreProduct | null> {
  const result = await database().prepare(
    "INSERT INTO storeProducts (categoryId, name, description, price, imageUrl, isAvailable, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).bind(data.categoryId, data.name, data.description || "", data.price, data.imageUrl, data.isAvailable ?? 1, data.stock ?? 10).run();
  return one<StoreProduct>("SELECT * FROM storeProducts WHERE id = ?", Number(result.meta.last_row_id));
}

export async function updateStoreProduct(id: number, data: { categoryId: number; name: string; description?: string; price: number; imageUrl: string; isAvailable: number; stock: number }): Promise<StoreProduct | null> {
  await database().prepare(
    "UPDATE storeProducts SET categoryId = ?, name = ?, description = ?, price = ?, imageUrl = ?, isAvailable = ?, stock = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
  ).bind(data.categoryId, data.name, data.description || "", data.price, data.imageUrl, data.isAvailable, data.stock, id).run();
  return one<StoreProduct>("SELECT * FROM storeProducts WHERE id = ?", id);
}

export async function deleteStoreProduct(id: number) {
  await database().prepare("DELETE FROM storeProducts WHERE id = ?").bind(id).run();
  return { success: true } as const;
}

export async function createStoreOrder(data: { customerName: string; customerPhone: string; customerAddress: string; notes?: string; items: Array<{ productId: number; quantity: number }> }) {
  if (data.items.length === 0) throw new Error("Cart is empty");
  const trustedItems: Array<{ productId: number; productName: string; price: number; quantity: number }> = [];
  for (const item of data.items) {
    const product = await one<StoreProduct>("SELECT * FROM storeProducts WHERE id = ?", item.productId);
    if (!product || !product.isAvailable || product.stock < item.quantity) {
      throw new Error(`Product ${item.productId} is unavailable or out of stock`);
    }
    trustedItems.push({ productId: product.id, productName: product.name, price: product.price, quantity: item.quantity });
  }
  const totalAmount = trustedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderResult = await database().prepare(
    "INSERT INTO storeOrders (customerName, customerPhone, customerAddress, notes, totalAmount, currency, status) VALUES (?, ?, ?, ?, ?, 'IQD', 'pending')",
  ).bind(data.customerName, data.customerPhone, data.customerAddress, data.notes || "", totalAmount).run();
  const orderId = Number(orderResult.meta.last_row_id);
  const changes = await database().batch([
    ...trustedItems.map(item => database().prepare("UPDATE storeProducts SET stock = stock - ? WHERE id = ? AND stock >= ?")
      .bind(item.quantity, item.productId, item.quantity)),
    ...trustedItems.map(item => database().prepare(
      "INSERT INTO storeOrderItems (orderId, productId, productName, price, quantity) VALUES (?, ?, ?, ?, ?)",
    ).bind(orderId, item.productId, item.productName, item.price, item.quantity)),
  ]);
  const stockChanges = changes.slice(0, trustedItems.length);
  if (stockChanges.some(change => Number(change.meta.changes) !== 1)) throw new Error("Product stock changed while completing the order");
  return getStoreOrderById(orderId);
}

export async function getStoreOrderById(orderId: number) {
  const order = await one<StoreOrder>("SELECT * FROM storeOrders WHERE id = ?", orderId);
  if (!order) return null;
  const items = await rows<StoreOrderItem>("SELECT * FROM storeOrderItems WHERE orderId = ? ORDER BY id ASC", orderId);
  return { ...order, items };
}

export async function getStoreOrdersList() {
  const orders = await rows<StoreOrder>("SELECT * FROM storeOrders ORDER BY datetime(createdAt) DESC, id DESC");
  return Promise.all(orders.map(async order => ({
    ...order,
    items: await rows<StoreOrderItem>("SELECT * FROM storeOrderItems WHERE orderId = ? ORDER BY id ASC", order.id),
  })));
}

export async function updateStoreOrderStatus(orderId: number, status: StoreOrder["status"]) {
  await database().prepare("UPDATE storeOrders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").bind(status, orderId).run();
  return getStoreOrderById(orderId);
}

export async function deleteStoreOrder(id: number) {
  await database().batch([
    database().prepare("DELETE FROM storeOrderItems WHERE orderId = ?").bind(id),
    database().prepare("DELETE FROM storeOrders WHERE id = ?").bind(id),
  ]);
  return { success: true } as const;
}
