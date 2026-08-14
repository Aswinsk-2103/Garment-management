import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { garments } from "../../drizzle/schema";
import { listGarments, requireDb } from "../db";
import { router } from "../_core/trpc";
import { moduleProcedure } from "./guards";

const garmentInput = z.object({
  style: z.string().trim().min(1).max(160),
  size: z.string().trim().min(1).max(48),
  color: z.string().trim().min(1).max(96),
  quantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(25),
});

export const catalogRouter = router({
  list: moduleProcedure("catalog").query(() => listGarments()),
  create: moduleProcedure("catalog").input(garmentInput).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.insert(garments).values(input);
    return { success: true };
  }),
  update: moduleProcedure("catalog").input(garmentInput.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await requireDb();
    const { id, ...values } = input;
    await db.update(garments).set(values).where(eq(garments.id, id));
    return { success: true };
  }),
  delete: moduleProcedure("catalog").input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.delete(garments).where(eq(garments.id, input.id));
    return { success: true };
  }),
  lowStock: moduleProcedure("inventory").query(async () => {
    const db = await requireDb();
    const rows = await db.select().from(garments).orderBy(desc(garments.updatedAt));
    return rows.filter((item: any) => item.quantity <= item.lowStockThreshold);
  }),
});
