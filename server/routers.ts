import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { z } from "zod";
import { businessRoles } from "../drizzle/schema";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { catalogRouter } from "./routers/catalog";
import { challanRouter } from "./routers/challans";
import { inventoryRouter } from "./routers/inventory";
import { purchaseOrderRouter, salesOrderRouter } from "./routers/orders";
import { productionRouter } from "./routers/production";
import { dashboardRouter, reportsRouter } from "./routers/reporting";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure
      .input(
        z.object({
          role: z.enum(businessRoles).default("admin"),
          name: z.string().optional(),
          email: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const roleLabels: Record<string, string> = {
          admin: "Administrator",
          store_inventory: "Store & Inventory Manager",
          production: "Production Supervisor",
          accounts: "Accounts Officer",
        };
        const openId = `dev_${input.role}_user`;
        const name = input.name || roleLabels[input.role] || "KLG User";
        const email = input.email || `${input.role}@klggarments.com`;

        await db.upsertUser({
          openId,
          name,
          email,
          role: input.role,
          loginMethod: "direct",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        if (typeof ctx.res?.cookie === "function") {
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        }

        return { success: true, token: sessionToken };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof ctx.res?.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return { success: true } as const;
    }),
  }),
  dashboard: dashboardRouter,
  catalog: catalogRouter,
  inventory: inventoryRouter,
  purchaseOrders: purchaseOrderRouter,
  salesOrders: salesOrderRouter,
  production: productionRouter,
  challans: challanRouter,
  reports: reportsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
