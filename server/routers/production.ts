import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { productionBatches } from "../../drizzle/schema";
import { requireDb } from "../db";
import { router } from "../_core/trpc";
import { moduleProcedure } from "./guards";

const batchInput = z.object({
  batchNo: z.string().trim().min(1).max(80), garmentId: z.number().int().positive(), assignedQuantity: z.number().int().positive(),
  progressStatus: z.enum(["planned", "cutting", "stitching", "checking", "completed", "on_hold"]), startDate: z.number().int().positive(), completionDate: z.number().int().positive().optional(), notes: z.string().trim().max(1000).optional(),
});

export const productionRouter = router({
  list: moduleProcedure("production").query(async () => {
    const db = await requireDb();
    return db.select().from(productionBatches).orderBy(desc(productionBatches.createdAt));
  }),
  create: moduleProcedure("production").input(batchInput).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.insert(productionBatches).values({ ...input, startDate: new Date(input.startDate), completionDate: input.completionDate ? new Date(input.completionDate) : null, notes: input.notes || null });
    return { success: true };
  }),
  updateStatus: moduleProcedure("production").input(z.object({ id: z.number().int().positive(), progressStatus: batchInput.shape.progressStatus, completionDate: z.number().int().positive().optional() })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.update(productionBatches).set({ progressStatus: input.progressStatus, completionDate: input.completionDate ? new Date(input.completionDate) : null }).where(eq(productionBatches.id, input.id));
    return { success: true };
  }),
});
