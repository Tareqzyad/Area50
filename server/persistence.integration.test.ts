import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { bookings } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const shouldRun = Boolean(process.env.RUN_DB_TESTS && process.env.DATABASE_URL && process.env.AREA50_ADMIN_CODE);
let createdBookingIds: number[] = [];

afterEach(async () => {
  if (createdBookingIds.length === 0) return;
  const db = await getDb();
  if (db) {
    for (const id of createdBookingIds) {
      await db.delete(bookings).where(eq(bookings.id, id));
    }
  }
  createdBookingIds = [];
});

function makeLoginContext(cookies: Array<{ name: string; value: string }>): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} },
    res: { cookie: (name: string, value: string) => cookies.push({ name, value }) },
  } as unknown as TrpcContext;
}

function makeAdminContext(session: string): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { cookie: `area50_admin_session=${session}` } },
    res: {},
  } as unknown as TrpcContext;
}

describe.skipIf(!shouldRun)("database persistence", () => {
  it("saves VIP and VVIP bookings, exposes both to admin, and updates both statuses", async () => {
    const loginCookies: Array<{ name: string; value: string }> = [];
    const publicCaller = appRouter.createCaller(makeLoginContext(loginCookies));

    const vipBooking = await publicCaller.booking.create({
      room: "vip",
      guestName: `Vitest VIP ${Date.now()}`,
      bookingDate: "2026-09-01",
      startHour: 13,
      endHour: 15,
      guests: 2,
    });
    const vvipBooking = await publicCaller.booking.create({
      room: "vvip",
      guestName: `Vitest VVIP ${Date.now()}`,
      bookingDate: "2026-09-02",
      startHour: 16,
      endHour: 19,
      guests: 4,
    });
    createdBookingIds = [vipBooking.id, vvipBooking.id];

    await publicCaller.admin.login({ code: process.env.AREA50_ADMIN_CODE! });
    const session = loginCookies.find(cookie => cookie.name === "area50_admin_session");
    expect(session?.value).toBeTruthy();
    const adminCaller = appRouter.createCaller(makeAdminContext(session!.value));

    const listed = await adminCaller.admin.bookings.list();
    expect(listed.some(booking => booking.id === vipBooking.id && booking.room === "vip")).toBe(true);
    expect(listed.some(booking => booking.id === vvipBooking.id && booking.room === "vvip")).toBe(true);

    const confirmed = await adminCaller.admin.bookings.updateStatus({ id: vipBooking.id, status: "confirmed" });
    const cancelled = await adminCaller.admin.bookings.updateStatus({ id: vvipBooking.id, status: "cancelled" });
    expect(confirmed?.status).toBe("confirmed");
    expect(cancelled?.status).toBe("cancelled");

    const refreshed = await adminCaller.admin.bookings.list();
    expect(refreshed.find(booking => booking.id === vipBooking.id)?.status).toBe("confirmed");
    expect(refreshed.find(booking => booking.id === vvipBooking.id)?.status).toBe("cancelled");
  });

  it("persists both hourly prices and exposes them through the public center query", async () => {
    const loginCookies: Array<{ name: string; value: string }> = [];
    const publicCaller = appRouter.createCaller(makeLoginContext(loginCookies));
    const initialPrices = await publicCaller.prices.list();
    const originalVip = initialPrices.find(price => price.room === "vip")?.pricePerHour ?? 0;
    const originalVvip = initialPrices.find(price => price.room === "vvip")?.pricePerHour ?? 0;

    await publicCaller.admin.login({ code: process.env.AREA50_ADMIN_CODE! });
    const session = loginCookies.find(cookie => cookie.name === "area50_admin_session");
    const adminCaller = appRouter.createCaller(makeAdminContext(session!.value));

    try {
      await adminCaller.admin.prices.update({ room: "vip", pricePerHour: 12345 });
      await adminCaller.admin.prices.update({ room: "vvip", pricePerHour: 23456 });
      const refreshedPrices = await publicCaller.prices.list();
      expect(refreshedPrices.find(price => price.room === "vip")?.pricePerHour).toBe(12345);
      expect(refreshedPrices.find(price => price.room === "vvip")?.pricePerHour).toBe(23456);
    } finally {
      await adminCaller.admin.prices.update({ room: "vip", pricePerHour: originalVip });
      await adminCaller.admin.prices.update({ room: "vvip", pricePerHour: originalVvip });
    }
  });
});
