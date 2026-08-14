import { desc } from "drizzle-orm";
import { garments, productionBatches, salesOrders } from "../../drizzle/schema";
import { requireDb } from "../db";
import { router } from "../_core/trpc";
import { dashboardProcedure, moduleProcedure } from "./guards";

export const dashboardRouter = router({
  summary: dashboardProcedure.query(async () => {
    const db = await requireDb();
    const [allGarments, allOrders, allBatches] = await Promise.all([
      db.select().from(garments), db.select().from(salesOrders), db.select().from(productionBatches),
    ]);
    const inventoryUnits = allGarments.reduce((total: number, item: any) => total + item.quantity, 0);
    const lowStockItems = allGarments.filter((item: any) => item.quantity <= item.lowStockThreshold).length;
    const activeProduction = allBatches.filter((batch: any) => !["completed", "on_hold"].includes(batch.progressStatus)).length;
    const revenue = allOrders.filter((order: any) => order.status !== "cancelled").reduce((total: number, order: any) => total + Number(order.totalAmount), 0);
    return { orderCount: allOrders.length, inventoryUnits, lowStockItems, activeProduction, revenue };
  }),
});

export const reportsRouter = router({
  orderHistory: moduleProcedure("reports").query(async () => {
    const db = await requireDb();
    return db.select().from(salesOrders).orderBy(desc(salesOrders.orderDate));
  }),
  inventoryLevels: moduleProcedure("reports").query(async () => {
    const db = await requireDb();
    return db.select().from(garments).orderBy(desc(garments.updatedAt));
  }),
  productionOutput: moduleProcedure("reports").query(async () => {
    const db = await requireDb();
    return db.select().from(productionBatches).orderBy(desc(productionBatches.startDate));
  }),
});
