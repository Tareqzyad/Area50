import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("booking.create validation", () => {
  it("requires a guest name", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.booking.create({
      room: "vip",
      guestName: "",
      bookingDate: "2026-09-01",
      startHour: 13,
      endHour: 18,
      guests: 2,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires a full-hour interval with an end after the start", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.booking.create({
      room: "vvip",
      guestName: "أحمد محمد",
      bookingDate: "2026-09-01",
      startHour: 13,
      endHour: 13,
      guests: 4,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
