import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { garments, inventoryReceipts } from "../../drizzle/schema";
import { requireDb } from "../db";
import { router } from "../_core/trpc";
import { moduleProcedure } from "./guards";

export const inventoryRouter = router({
  receipts: moduleProcedure("inventory").query(async () => {
    const db = await requireDb();
    return db.select().from(inventoryReceipts).orderBy(desc(inventoryReceipts.receivedDate));
  }),
  receive: moduleProcedure("inventory").input(z.object({
    garmentId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    supplierName: z.string().trim().min(1).max(180),
    receivedDate: z.number().int().positive(),
    referenceNo: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(1000).optional(),
  })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.transaction(async (tx) => {
      await tx.insert(inventoryReceipts).values({ ...input, receivedDate: new Date(input.receivedDate), referenceNo: input.referenceNo || null, notes: input.notes || null });
      await tx.update(garments).set({ quantity: sql`${garments.quantity} + ${input.quantity}` }).where(eq(garments.id, input.garmentId));
    });
    return { success: true };
  }),
});
