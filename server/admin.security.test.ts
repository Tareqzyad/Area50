import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const publicContext: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("admin protected procedures", () => {
  it("rejects booking inbox access without an admin session", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.bookings.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects booking status changes without an admin session", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.bookings.updateStatus({ id: 1, status: "confirmed" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects price reads and updates without an admin session", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.prices.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.admin.prices.update({ room: "vip", pricePerHour: 25000 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("store admin protected procedures", () => {
  it("rejects store catalog reads without an admin session", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.store.categories.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.admin.store.products.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects category and product mutations without an admin session", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.store.categories.create({ slug: "new-category", title: "تصنيف جديد", detail: "", tone: "cyan" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.admin.store.products.create({ categoryId: 1, name: "منتج جديد", description: "", price: 1000, imageUrl: "/image.png", isAvailable: 1, stock: 5 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects product image uploads without an admin session", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.admin.store.uploadImage({ fileName: "image.png", contentType: "image/png", base64: "ZGF0YQ==" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
