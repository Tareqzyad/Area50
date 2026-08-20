import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("admin.login", () => {
  it("accepts the configured Area 50 admin code and creates a session cookie", async () => {
    const cookies: Array<{ name: string; value: string }> = [];
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: {
        cookie: (name: string, value: string) => cookies.push({ name, value }),
      },
    } as unknown as TrpcContext;

    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.login({ code: process.env.AREA50_ADMIN_CODE ?? "" });

    expect(result).toEqual({ success: true });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe("area50_admin_session");
  });
});
