import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { purchaseOrderItems, purchaseOrders, salesOrderItems, salesOrders } from "../../drizzle/schema";
import { requireDb } from "../db";
import { router } from "../_core/trpc";
import { moduleProcedure } from "./guards";

const purchaseItem = z.object({ garmentId: z.number().int().positive(), quantity: z.number().int().positive(), unitCost: z.number().min(0) });
const salesItem = z.object({ garmentId: z.number().int().positive(), quantity: z.number().int().positive(), unitPrice: z.number().min(0) });

export const purchaseOrderRouter = router({
  list: moduleProcedure("purchase_orders").query(async () => {
    const db = await requireDb();
    return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }),
  details: moduleProcedure("purchase_orders").input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = await requireDb();
    const header = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, input.id)).limit(1);
    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, input.id));
    return { header: header[0] ?? null, items };
  }),
  create: moduleProcedure("purchase_orders").input(z.object({
    purchaseOrderNo: z.string().trim().min(1).max(80), supplierName: z.string().trim().min(1).max(180), supplierAddress: z.string().trim().max(1000).optional(), supplierGstin: z.string().trim().max(32).optional(),
    orderDate: z.number().int().positive(), expectedDate: z.number().int().positive().optional(), status: z.enum(["draft", "sent", "received", "cancelled"]), items: z.array(purchaseItem).min(1),
  })).mutation(async ({ input }) => {
    const db = await requireDb();
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const { items, orderDate, expectedDate, supplierAddress, supplierGstin, ...header } = input;
    await db.transaction(async (tx) => {
      const result = await tx.insert(purchaseOrders).values({ ...header, supplierAddress: supplierAddress || null, supplierGstin: supplierGstin || null, orderDate: new Date(orderDate), expectedDate: expectedDate ? new Date(expectedDate) : null, totalAmount: total.toFixed(2) });
      const orderId = Number(result[0].insertId);
      await tx.insert(purchaseOrderItems).values(items.map((item) => ({ purchaseOrderId: orderId, garmentId: item.garmentId, quantity: item.quantity, unitCost: item.unitCost.toFixed(2), lineTotal: (item.quantity * item.unitCost).toFixed(2) })));
    });
    return { success: true };
  }),
});

export const salesOrderRouter = router({
  list: moduleProcedure("sales_orders").query(async () => {
    const db = await requireDb();
    return db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
  }),
  details: moduleProcedure("sales_orders").input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = await requireDb();
    const header = await db.select().from(salesOrders).where(eq(salesOrders.id, input.id)).limit(1);
    const items = await db.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, input.id));
    return { header: header[0] ?? null, items };
  }),
  create: moduleProcedure("sales_orders").input(z.object({
    salesOrderNo: z.string().trim().min(1).max(80), customerName: z.string().trim().min(1).max(180), customerAddress: z.string().trim().min(1).max(1000), customerGstin: z.string().trim().max(32).optional(),
    orderDate: z.number().int().positive(), deliveryDate: z.number().int().positive().optional(), status: z.enum(["draft", "confirmed", "in_production", "ready_to_dispatch", "delivered", "cancelled"]), items: z.array(salesItem).min(1),
  })).mutation(async ({ input }) => {
    const db = await requireDb();
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const { items, orderDate, deliveryDate, customerGstin, ...header } = input;
    await db.transaction(async (tx) => {
      const result = await tx.insert(salesOrders).values({ ...header, customerGstin: customerGstin || null, orderDate: new Date(orderDate), deliveryDate: deliveryDate ? new Date(deliveryDate) : null, totalAmount: total.toFixed(2) });
      const orderId = Number(result[0].insertId);
      await tx.insert(salesOrderItems).values(items.map((item) => ({ salesOrderId: orderId, garmentId: item.garmentId, quantity: item.quantity, unitPrice: item.unitPrice.toFixed(2), lineTotal: (item.quantity * item.unitPrice).toFixed(2) })));
    });
    return { success: true };
  }),
});
