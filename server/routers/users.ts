import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { businessRoles, users } from "../../drizzle/schema";
import { requireDb } from "../db";
import { router } from "../_core/trpc";
import { adminProcedure } from "./guards";

export const usersRouter = router({
  list: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn }).from(users).orderBy(asc(users.name));
  }),
  updateRole: adminProcedure.input(z.object({ id: z.number().int().positive(), role: z.enum(businessRoles) })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
    return { success: true };
  }),
});
