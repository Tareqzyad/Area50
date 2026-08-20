import { z } from "zod";
import { TRPCError } from "@trpc/server";
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
  createStoreCategory,
  createStoreProduct,
  deleteStoreCategory,
  deleteStoreProduct,
  listBookings,
  listRoomPrices,
  listStoreCategories,
  listStoreProducts,
  updateBookingStatus,
  updateRoomPrice,
  updateStoreCategory,
  updateStoreProduct,
} from "./db";
import { storagePut } from "./storage";

const roomSchema = z.enum(["vip", "vvip"]);
const statusSchema = z.enum(["pending", "confirmed", "cancelled"]);
const toneSchema = z.enum(["cyan", "lime", "violet", "amber"]);
const imageTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const adminSessionProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!isAdminRequest(ctx.req)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin session required" });
  }
  return next();
});

const categoryInput = z.object({
  slug: z.string().trim().min(2).max(64).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(2).max(120),
  detail: z.string().trim().max(500).optional().default(""),
  tone: toneSchema.default("cyan"),
});

const categoryUpdateInput = categoryInput.omit({ slug: true });

const productInput = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1500).optional().default(""),
  price: z.number().int().min(0).max(100_000_000),
  imageUrl: z.string().trim().min(1).max(2000),
  isAvailable: z.number().int().min(0).max(1).default(1),
  stock: z.number().int().min(0).max(1_000_000).default(10),
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
      .mutation(({ input }) => createBooking({ ...input, status: "pending" })),
  }),

  store: router({
    categories: router({
      list: publicProcedure.query(() => listStoreCategories()),
    }),
    products: router({
      list: publicProcedure.query(() => listStoreProducts()),
    }),
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
        .input(z.object({ room: roomSchema, pricePerHour: z.number().int().min(0).max(100_000_000) }))
        .mutation(({ input }) => updateRoomPrice(input.room, input.pricePerHour)),
    }),
    store: router({
      categories: router({
        list: adminSessionProcedure.query(() => listStoreCategories()),
        create: adminSessionProcedure.input(categoryInput).mutation(({ input }) => createStoreCategory(input)),
        update: adminSessionProcedure
          .input(z.object({ id: z.number().int().positive(), data: categoryUpdateInput }))
          .mutation(({ input }) => updateStoreCategory(input.id, input.data)),
        delete: adminSessionProcedure
          .input(z.object({ id: z.number().int().positive() }))
          .mutation(({ input }) => deleteStoreCategory(input.id)),
      }),
      products: router({
        list: adminSessionProcedure.query(() => listStoreProducts()),
        create: adminSessionProcedure.input(productInput).mutation(({ input }) => createStoreProduct(input)),
        update: adminSessionProcedure
          .input(z.object({ id: z.number().int().positive(), data: productInput }))
          .mutation(({ input }) => updateStoreProduct(input.id, input.data)),
        delete: adminSessionProcedure
          .input(z.object({ id: z.number().int().positive() }))
          .mutation(({ input }) => deleteStoreProduct(input.id)),
      }),
      uploadImage: adminSessionProcedure
        .input(z.object({ fileName: z.string().trim().min(1).max(180), contentType: imageTypeSchema, base64: z.string().min(1).max(7_000_000) }))
        .mutation(async ({ input }) => {
          const rawBase64 = input.base64.replace(/^data:[^;]+;base64,/, "");
          const fileBuffer = Buffer.from(rawBase64, "base64");
          if (fileBuffer.length > 5 * 1024 * 1024) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الصورة يجب ألا يتجاوز 5MB" });
          }
          const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
          return storagePut(`area50-store/${Date.now()}-${safeName}`, fileBuffer, input.contentType);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
