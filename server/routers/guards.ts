import { BusinessRole } from "../../drizzle/schema";
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../_core/trpc";

export type ModuleKey =
  | "catalog"
  | "inventory"
  | "purchase_orders"
  | "sales_orders"
  | "production"
  | "delivery_challans"
  | "reports"
  | "team";

const ROLE_MODULES: Record<BusinessRole, ModuleKey[]> = {
  admin: [
    "catalog",
    "inventory",
    "purchase_orders",
    "sales_orders",
    "production",
    "delivery_challans",
    "reports",
    "team",
  ],
  store_inventory: ["catalog", "inventory", "purchase_orders"],
  production: ["catalog", "production"],
  accounts: ["sales_orders", "delivery_challans", "reports"],
};

export function hasModuleAccess(role: BusinessRole | string, module: string): boolean {
  if (role === "admin") return true;
  const allowed = ROLE_MODULES[role as BusinessRole];
  if (!allowed) return false;
  return allowed.includes(module as ModuleKey);
}

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const dashboardProcedure = protectedProcedure;

export function moduleProcedure(moduleKey: string) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }
    if (!hasModuleAccess(ctx.user.role, moduleKey)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Module access denied" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}
