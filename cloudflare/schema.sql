-- Area 50 schema for Cloudflare D1 (SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openId TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  loginMethod TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL CHECK(room IN ('vip', 'vvip')),
  roomNumber INTEGER NOT NULL DEFAULT 1,
  guestName TEXT NOT NULL,
  bookingDate TEXT NOT NULL,
  startHour INTEGER NOT NULL,
  endHour INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bookings_room_time_idx
  ON bookings(room, roomNumber, bookingDate, status);

CREATE TABLE IF NOT EXISTS roomPrices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL UNIQUE CHECK(room IN ('vip', 'vvip')),
  pricePerHour INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IQD',
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storeCategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  detail TEXT,
  tone TEXT NOT NULL DEFAULT 'cyan',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storeProducts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryId INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IQD',
  imageUrl TEXT NOT NULL,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  stock INTEGER NOT NULL DEFAULT 10,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES storeCategories(id)
);

CREATE INDEX IF NOT EXISTS store_products_category_idx ON storeProducts(categoryId);

CREATE TABLE IF NOT EXISTS storeOrders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerName TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerAddress TEXT NOT NULL,
  notes TEXT,
  totalAmount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IQD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storeOrderItems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  productId INTEGER,
  productName TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (orderId) REFERENCES storeOrders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS store_order_items_order_idx ON storeOrderItems(orderId);

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
