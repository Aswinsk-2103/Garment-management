import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { deliveryChallanItems, deliveryChallans } from "../../drizzle/schema";
import { requireDb } from "../db";
import { router } from "../_core/trpc";
import { moduleProcedure } from "./guards";

const challanItem = z.object({ itemDescription: z.string().trim().min(1).max(240), deliveryQty: z.number().int().positive(), uom: z.string().trim().min(1).max(20) });

export const challanRouter = router({
  list: moduleProcedure("delivery_challans").query(async () => {
    const db = await requireDb();
    return db.select().from(deliveryChallans).orderBy(desc(deliveryChallans.createdAt));
  }),
  details: moduleProcedure("delivery_challans").input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = await requireDb();
    const header = await db.select().from(deliveryChallans).where(eq(deliveryChallans.id, input.id)).limit(1);
    const items = await db.select().from(deliveryChallanItems).where(eq(deliveryChallanItems.deliveryChallanId, input.id));
    return { header: header[0] ?? null, items };
  }),
  create: moduleProcedure("delivery_challans").input(z.object({
    challanNo: z.string().trim().min(1).max(80), challanDate: z.number().int().positive(), recipientName: z.string().trim().min(1).max(180), recipientAddress: z.string().trim().min(1).max(1000), recipientGstin: z.string().trim().max(32).optional(), orderNo: z.string().trim().min(1).max(80), purpose: z.string().trim().min(1).max(160), challanType: z.string().trim().min(1).max(80), remarks: z.string().trim().max(1000).optional(), vehicleNo: z.string().trim().max(80).optional(), receivedBy: z.string().trim().max(140).optional(), preparedBy: z.string().trim().max(140).optional(), checkedBy: z.string().trim().max(140).optional(), approvedBy: z.string().trim().max(140).optional(), status: z.enum(["draft", "issued", "returned"]), items: z.array(challanItem).min(1),
  })).mutation(async ({ input }) => {
    const db = await requireDb();
    const { items, challanDate, recipientGstin, remarks, vehicleNo, receivedBy, preparedBy, checkedBy, approvedBy, ...header } = input;
    await db.transaction(async (tx: any) => {
      const result = await tx.insert(deliveryChallans).values({ ...header, challanDate: new Date(challanDate), recipientGstin: recipientGstin || null, remarks: remarks || null, vehicleNo: vehicleNo || null, receivedBy: receivedBy || null, preparedBy: preparedBy || null, checkedBy: checkedBy || null, approvedBy: approvedBy || null });
      const challanId = Number(result[0].insertId);
      await tx.insert(deliveryChallanItems).values(items.map((item) => ({ ...item, deliveryChallanId: challanId })));
    });
    return { success: true };
  }),
});
