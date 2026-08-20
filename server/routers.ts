import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  clearAdminSession,
  createAdminSession,
  isAdminRequest,
  isValidAdminCode,
  setAdminSession,
} from "./adminAuth";
import {
  createBooking,
  listBookings,
  listRoomPrices,
  updateBookingStatus,
  updateRoomPrice,
} from "./db";

const roomSchema = z.enum(["vip", "vvip"]);
const statusSchema = z.enum(["pending", "confirmed", "cancelled"]);

const adminSessionProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!isAdminRequest(ctx.req)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin session required" });
  }
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  prices: router({
    list: publicProcedure.query(() => listRoomPrices()),
  }),

  booking: router({
    create: publicProcedure
      .input(
        z.object({
          room: roomSchema,
          guestName: z.string().trim().min(2).max(120),
          bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          startHour: z.number().int().min(0).max(23),
          endHour: z.number().int().min(1).max(24),
          guests: z.number().int().min(1).max(30),
        }).refine(input => input.endHour > input.startHour, {
          message: "Booking end time must be after start time",
          path: ["endHour"],
        }),
      )
      .mutation(({ input }) =>
        createBooking({
          ...input,
          status: "pending",
        }),
      ),
  }),

  admin: router({
    login: publicProcedure
      .input(z.object({ code: z.string().min(1).max(120) }))
      .mutation(({ ctx, input }) => {
        if (!isValidAdminCode(input.code)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "رمز الإدارة غير صحيح" });
        }
        setAdminSession(ctx.res, ctx.req, createAdminSession());
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSession(ctx.res, ctx.req);
      return { success: true } as const;
    }),
    me: publicProcedure.query(({ ctx }) => ({ isAdmin: isAdminRequest(ctx.req) })),
    bookings: router({
      list: adminSessionProcedure.query(() => listBookings()),
      updateStatus: adminSessionProcedure
        .input(z.object({ id: z.number().int().positive(), status: statusSchema }))
        .mutation(({ input }) => updateBookingStatus(input.id, input.status)),
    }),
    prices: router({
      list: adminSessionProcedure.query(() => listRoomPrices()),
      update: adminSessionProcedure
        .input(
          z.object({
            room: roomSchema,
            pricePerHour: z.number().int().min(0).max(100_000_000),
          }),
        )
        .mutation(({ input }) => updateRoomPrice(input.room, input.pricePerHour)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
