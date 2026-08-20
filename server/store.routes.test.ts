import { describe, expect, it, vi } from "vitest";
import { createAdminSession, ADMIN_COOKIE_NAME } from "./adminAuth";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createBooking: vi.fn(),
  listBookings: vi.fn().mockResolvedValue([]),
  updateBookingStatus: vi.fn(),
  deleteBooking: vi.fn().mockResolvedValue({ success: true }),
  listRoomPrices: vi.fn().mockResolvedValue([]),
  updateRoomPrice: vi.fn(),
  listStoreCategories: vi.fn().mockResolvedValue([{ id: 1, slug: "accessories", title: "إكسسوارات", detail: "قطع للـ setup", tone: "cyan" }]),
  createStoreCategory: vi.fn().mockResolvedValue({ id: 2, slug: "new", title: "جديد", detail: "", tone: "lime" }),
  updateStoreCategory: vi.fn().mockResolvedValue({ id: 1, slug: "accessories", title: "إكسسوارات معدلة", detail: "", tone: "violet" }),
  deleteStoreCategory: vi.fn().mockResolvedValue({ success: true }),
  listStoreProducts: vi.fn().mockResolvedValue([{ id: 1, categoryId: 1, name: "ماوس باد", description: "وصف", price: 25000, currency: "IQD", imageUrl: "/image.png", isAvailable: 1, stock: 10 }]),
  createStoreProduct: vi.fn().mockResolvedValue({ id: 2 }),
  updateStoreProduct: vi.fn().mockResolvedValue({ id: 1 }),
  deleteStoreProduct: vi.fn().mockResolvedValue({ success: true }),
  createStoreOrder: vi.fn().mockResolvedValue({ id: 7, status: "pending", totalAmount: 25000, items: [] }),
  getStoreOrdersList: vi.fn().mockResolvedValue([]),
  updateStoreOrderStatus: vi.fn().mockResolvedValue({ id: 7, status: "confirmed" }),
  deleteStoreOrder: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => ({ storagePut: vi.fn().mockResolvedValue({ key: "area50-store/image.png", url: "/manus-storage/image.png" }) }));

import { appRouter } from "./routers";

const publicContext: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

function adminContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { cookie: `${ADMIN_COOKIE_NAME}=${createAdminSession()}` } } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("public store procedures", () => {
  it("lists categories and products for visitors", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.store.categories.list()).resolves.toHaveLength(1);
    await expect(caller.store.products.list()).resolves.toHaveLength(1);
    expect(dbMocks.listStoreCategories).toHaveBeenCalled();
    expect(dbMocks.listStoreProducts).toHaveBeenCalled();
  });

  it("creates an order with customer details and cart item ids", async () => {
    const caller = appRouter.createCaller(publicContext);
    await caller.store.orders.create({ customerName: "زبون Area", customerPhone: "07700000000", customerAddress: "بغداد", notes: "اتصل قبل التوصيل", items: [{ productId: 1, quantity: 2 }] });
    expect(dbMocks.createStoreOrder).toHaveBeenCalledWith({ customerName: "زبون Area", customerPhone: "07700000000", customerAddress: "بغداد", notes: "اتصل قبل التوصيل", items: [{ productId: 1, quantity: 2 }] });
  });

  it("rejects duplicate product lines", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.store.orders.create({ customerName: "زبون Area", customerPhone: "07700000000", customerAddress: "بغداد", items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 1 }] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.createStoreOrder).not.toHaveBeenCalledWith(expect.objectContaining({ items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 1 }] }));
  });
});

describe("admin store procedures", () => {
  it("creates, updates, and deletes categories", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.store.categories.create({ slug: "new-category", title: "تصنيف جديد", detail: "تفاصيل", tone: "cyan" });
    await caller.admin.store.categories.update({ id: 1, data: { title: "تصنيف معدل", detail: "تعديل", tone: "violet" } });
    await caller.admin.store.categories.delete({ id: 1 });
    expect(dbMocks.createStoreCategory).toHaveBeenCalledWith({ slug: "new-category", title: "تصنيف جديد", detail: "تفاصيل", tone: "cyan" });
    expect(dbMocks.updateStoreCategory).toHaveBeenCalledWith(1, { title: "تصنيف معدل", detail: "تعديل", tone: "violet" });
    expect(dbMocks.deleteStoreCategory).toHaveBeenCalledWith(1);
  });

  it("creates, updates, and deletes products", async () => {
    const caller = appRouter.createCaller(adminContext());
    const product = { categoryId: 1, name: "منتج", description: "وصف المنتج", price: 25000, imageUrl: "/image.png", isAvailable: 1, stock: 8 };
    await caller.admin.store.products.create(product);
    await caller.admin.store.products.update({ id: 1, data: { ...product, price: 30000 } });
    await caller.admin.store.products.delete({ id: 1 });
    expect(dbMocks.createStoreProduct).toHaveBeenCalledWith(product);
    expect(dbMocks.updateStoreProduct).toHaveBeenCalledWith(1, { ...product, price: 30000 });
    expect(dbMocks.deleteStoreProduct).toHaveBeenCalledWith(1);
  });

  it("rejects invalid product data before calling the database", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.store.products.create({ categoryId: 1, name: "x", description: "", price: -1, imageUrl: "", isAvailable: 1, stock: 1 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.createStoreProduct).not.toHaveBeenCalledWith(expect.objectContaining({ price: -1 }));
  });

  it("lists store orders and updates their status for admins", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.store.orders.list();
    await caller.admin.store.orders.updateStatus({ id: 7, status: "confirmed" });
    expect(dbMocks.getStoreOrdersList).toHaveBeenCalled();
    expect(dbMocks.updateStoreOrderStatus).toHaveBeenCalledWith(7, "confirmed");
  });

  it("deletes a store order when an admin cancels it", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.store.orders.delete({ id: 7 });
    expect(dbMocks.deleteStoreOrder).toHaveBeenCalledWith(7);
  });

  it("rejects store order management without an admin session", async () => {
    dbMocks.getStoreOrdersList.mockClear();
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.store.orders.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.getStoreOrdersList).not.toHaveBeenCalledWith();
  });
});


describe("admin booking deletion", () => {
  it("deletes a booking when an admin cancels it", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.bookings.delete({ id: 12 });
    expect(dbMocks.deleteBooking).toHaveBeenCalledWith(12);
  });
});
