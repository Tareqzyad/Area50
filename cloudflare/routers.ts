import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
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
  createStoreOrder,
  createStoreProduct,
  deleteBooking,
  deleteStoreCategory,
  deleteStoreOrder,
  deleteStoreProduct,
  getRoomCounts,
  getStoreOrdersList,
  listBookings,
  listRoomPrices,
  listStoreCategories,
  listStoreProducts,
  updateBookingStatus,
  updateRoomCounts,
  updateRoomPrice,
  updateStoreCategory,
  updateStoreOrderStatus,
  updateStoreProduct,
} from "./db";
import { createCloudflareContext, type CloudflareTrpcContext } from "./context";
import { uploadStoreImage } from "./storage";

const t = initTRPC.context<CloudflareTrpcContext>().create({ transformer: superjson });
const router = t.router;
const publicProcedure = t.procedure;
const roomSchema = z.enum(["vip", "vvip"]);
const statusSchema = z.enum(["pending", "confirmed", "cancelled"]);
const orderStatusSchema = z.enum(["pending", "confirmed", "completed", "cancelled"]);
const toneSchema = z.enum(["cyan", "lime", "violet", "amber"]);
const imageTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const adminSessionProcedure = publicProcedure.use(({ ctx, next }) => {
  return isAdminRequest(ctx.req).then(isAdmin => {
    if (!isAdmin) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin session required" });
    return next();
  });
});

const categoryInput = z.object({
  slug: z.string().trim().min(2).max(64).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(2).max(120),
  detail: z.string().trim().max(500).optional().default(""),
  tone: toneSchema.default("cyan"),
});
const productInput = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1500).optional().default(""),
  price: z.number().int().min(0).max(100_000_000),
  imageUrl: z.string().trim().min(1).max(2000),
  isAvailable: z.number().int().min(0).max(1).default(1),
  stock: z.number().int().min(0).max(1_000_000).default(10),
});

export const cloudflareAppRouter = router({
  prices: router({ list: publicProcedure.query(() => listRoomPrices()) }),
  booking: router({
    roomCounts: publicProcedure.query(() => getRoomCounts()),
    create: publicProcedure.input(z.object({
      room: roomSchema,
      roomNumber: z.number().int().min(1).max(50).default(1),
      guestName: z.string().trim().min(2).max(120),
      bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startHour: z.number().int().min(0).max(23),
      endHour: z.number().int().min(1).max(24),
      guests: z.number().int().min(1).max(30),
    }).refine(input => input.endHour > input.startHour, { message: "Booking end time must be after start time", path: ["endHour"] }))
      .mutation(async ({ input }) => {
        try {
          return await createBooking({ ...input, status: "pending" });
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "تعذر إتمام الحجز" });
        }
      }),
  }),
  store: router({
    categories: router({ list: publicProcedure.query(() => listStoreCategories()) }),
    products: router({ list: publicProcedure.query(() => listStoreProducts()) }),
    orders: router({
      create: publicProcedure.input(z.object({
        customerName: z.string().trim().min(2).max(180),
        customerPhone: z.string().trim().min(7).max(50),
        customerAddress: z.string().trim().min(3).max(1000),
        notes: z.string().trim().max(1000).optional().default(""),
        items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(100) })).min(1).max(50),
      }).superRefine((input, context) => {
        const ids = input.items.map(item => item.productId);
        if (new Set(ids).size !== ids.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "لا تكرر المنتج في الطلب" });
      })).mutation(async ({ input }) => {
        try {
          return await createStoreOrder(input);
        } catch (error) {
          const message = error instanceof Error ? error.message : "تعذر إنشاء الطلب";
          throw new TRPCError({ code: "BAD_REQUEST", message: message.includes("unavailable") || message.includes("empty") ? "أحد المنتجات غير متوفر أو أن السلة فارغة" : "تعذر حفظ الطلب حالياً" });
        }
      }),
    }),
  }),
  admin: router({
    login: publicProcedure.input(z.object({ code: z.string().min(1).max(120) })).mutation(async ({ ctx, input }) => {
      if (!isValidAdminCode(input.code)) throw new TRPCError({ code: "UNAUTHORIZED", message: "رمز الإدارة غير صحيح" });
      setAdminSession(ctx.responseHeaders, ctx.req, await createAdminSession());
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSession(ctx.responseHeaders, ctx.req);
      return { success: true } as const;
    }),
    me: publicProcedure.query(async ({ ctx }) => ({ isAdmin: await isAdminRequest(ctx.req) })),
    bookings: router({
      list: adminSessionProcedure.query(() => listBookings()),
      updateStatus: adminSessionProcedure.input(z.object({ id: z.number().int().positive(), status: statusSchema })).mutation(({ input }) => updateBookingStatus(input.id, input.status)),
      delete: adminSessionProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteBooking(input.id)),
    }),
    settings: router({
      roomCounts: adminSessionProcedure.query(() => getRoomCounts()),
      updateRoomCounts: adminSessionProcedure.input(z.object({ vip: z.number().int().min(1).max(50), vvip: z.number().int().min(1).max(50) })).mutation(({ input }) => updateRoomCounts(input)),
    }),
    prices: router({
      list: adminSessionProcedure.query(() => listRoomPrices()),
      update: adminSessionProcedure.input(z.object({ room: roomSchema, pricePerHour: z.number().int().min(0).max(100_000_000) })).mutation(({ input }) => updateRoomPrice(input.room, input.pricePerHour)),
    }),
    store: router({
      categories: router({
        list: adminSessionProcedure.query(() => listStoreCategories()),
        create: adminSessionProcedure.input(categoryInput).mutation(({ input }) => createStoreCategory(input)),
        update: adminSessionProcedure.input(z.object({ id: z.number().int().positive(), data: categoryInput.omit({ slug: true }) })).mutation(({ input }) => updateStoreCategory(input.id, input.data)),
        delete: adminSessionProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteStoreCategory(input.id)),
      }),
      products: router({
        list: adminSessionProcedure.query(() => listStoreProducts()),
        create: adminSessionProcedure.input(productInput).mutation(({ input }) => createStoreProduct(input)),
        update: adminSessionProcedure.input(z.object({ id: z.number().int().positive(), data: productInput })).mutation(({ input }) => updateStoreProduct(input.id, input.data)),
        delete: adminSessionProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteStoreProduct(input.id)),
      }),
      orders: router({
        list: adminSessionProcedure.query(() => getStoreOrdersList()),
        updateStatus: adminSessionProcedure.input(z.object({ id: z.number().int().positive(), status: orderStatusSchema })).mutation(({ input }) => updateStoreOrderStatus(input.id, input.status)),
        delete: adminSessionProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteStoreOrder(input.id)),
      }),
      uploadImage: adminSessionProcedure.input(z.object({ fileName: z.string().trim().min(1).max(180), contentType: imageTypeSchema, base64: z.string().min(1).max(7_000_000) }))
        .mutation(({ input }) => uploadStoreImage(input)),
    }),
  }),
});

export { createCloudflareContext };
