import { describe, expect, it } from "vitest";
import { bookingTimesOverlap } from "./db";

describe("bookingTimesOverlap", () => {
  const base = {
    room: "vip" as const,
    roomNumber: 2,
    bookingDate: "2026-09-01",
    startHour: 13,
    endHour: 16,
  };

  it("rejects overlapping bookings for the same room and date", () => {
    expect(bookingTimesOverlap(base, { ...base, startHour: 15, endHour: 18, status: "pending" })).toBe(true);
    expect(bookingTimesOverlap(base, { ...base, startHour: 16, endHour: 18, status: "confirmed" })).toBe(false);
  });

  it("allows the same time in another room or room type", () => {
    expect(bookingTimesOverlap(base, { ...base, roomNumber: 3, status: "pending" })).toBe(false);
    expect(bookingTimesOverlap(base, { ...base, room: "vvip", status: "pending" })).toBe(false);
  });

  it("allows the same room when the time range does not overlap", () => {
    expect(bookingTimesOverlap(base, { ...base, startHour: 9, endHour: 13, status: "confirmed" })).toBe(false);
    expect(bookingTimesOverlap(base, { ...base, startHour: 16, endHour: 20, status: "pending" })).toBe(false);
  });

  it("ignores cancelled bookings and different dates", () => {
    expect(bookingTimesOverlap(base, { ...base, status: "cancelled" })).toBe(false);
    expect(bookingTimesOverlap(base, { ...base, bookingDate: "2026-09-02", status: "confirmed" })).toBe(false);
  });
});
