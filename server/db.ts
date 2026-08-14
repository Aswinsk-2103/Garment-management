import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  deliveryChallanItems,
  deliveryChallans,
  garments,
  InsertUser,
  inventoryReceipts,
  productionBatches,
  purchaseOrderItems,
  purchaseOrders,
  salesOrderItems,
  salesOrders,
  User,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
const inMemoryUsers = new Map<string, User>();
let mockUserIdCounter = 100;

// Clean empty data stores for real user data entry
const garmentsStore: any[] = [];
const inventoryReceiptsStore: any[] = [];
const purchaseOrdersStore: any[] = [];
const purchaseOrderItemsStore: any[] = [];
const salesOrdersStore: any[] = [];
const salesOrderItemsStore: any[] = [];
const productionBatchesStore: any[] = [];
const deliveryChallansStore: any[] = [];
const deliveryChallanItemsStore: any[] = [];

function extractTargetValue(condition: any): any {
  if (!condition) return undefined;
  if (typeof condition === "number" || typeof condition === "string") return condition;
  if (condition.value !== undefined) return condition.value;
  if (Array.isArray(condition.queryChunks)) {
    for (const chunk of condition.queryChunks) {
      if (typeof chunk === "number" || typeof chunk === "string") return chunk;
      if (chunk && typeof chunk === "object" && chunk.value !== undefined) return chunk.value;
    }
  }
  return undefined;
}

class MockDb {
  select(fields?: any) {
    return {
      from: (table: any) => {
        let data: any[] = [];
        let keyName = "";

        if (table === garments) { data = garmentsStore; keyName = "id"; }
        else if (table === inventoryReceipts) { data = inventoryReceiptsStore; keyName = "id"; }
        else if (table === purchaseOrders) { data = purchaseOrdersStore; keyName = "id"; }
        else if (table === purchaseOrderItems) { data = purchaseOrderItemsStore; keyName = "purchaseOrderId"; }
        else if (table === salesOrders) { data = salesOrdersStore; keyName = "id"; }
        else if (table === salesOrderItems) { data = salesOrderItemsStore; keyName = "salesOrderId"; }
        else if (table === productionBatches) { data = productionBatchesStore; keyName = "id"; }
        else if (table === deliveryChallans) { data = deliveryChallansStore; keyName = "id"; }
        else if (table === deliveryChallanItems) { data = deliveryChallanItemsStore; keyName = "deliveryChallanId"; }
        else if (table === users) { data = Array.from(inMemoryUsers.values()); keyName = "id"; }

        let filteredData = [...data];

        const chain = {
          orderBy: (...args: any[]) => chain,
          where: (condition: any) => {
            const targetVal = extractTargetValue(condition);
            if (targetVal !== undefined && keyName) {
              filteredData = data.filter((item) => Number(item[keyName]) === Number(targetVal) || String(item[keyName]) === String(targetVal));
            }
            return chain;
          },
          limit: (n: number) => {
            filteredData = filteredData.slice(0, n);
            return chain;
          },
          then: (resolve: Function) => resolve(filteredData),
        };
        return chain;
      },
    };
  }

  insert(table: any) {
    return {
      values: (values: any) => {
        const valArray = Array.isArray(values) ? values : [values];
        let lastInsertId = 1;

        if (table === garments) {
          valArray.forEach((v) => {
            const id = garmentsStore.length ? Math.max(...garmentsStore.map((g) => g.id)) + 1 : 1;
            lastInsertId = id;
            garmentsStore.push({ id, ...v, quantity: v.quantity ?? 0, lowStockThreshold: v.lowStockThreshold ?? 25, createdAt: new Date(), updatedAt: new Date() });
          });
        } else if (table === inventoryReceipts) {
          valArray.forEach((v) => {
            const id = inventoryReceiptsStore.length ? Math.max(...inventoryReceiptsStore.map((r) => r.id)) + 1 : 1;
            lastInsertId = id;
            inventoryReceiptsStore.push({ id, ...v, createdAt: new Date() });
          });
        } else if (table === purchaseOrders) {
          valArray.forEach((v) => {
            const id = purchaseOrdersStore.length ? Math.max(...purchaseOrdersStore.map((p) => p.id)) + 1 : 1;
            lastInsertId = id;
            purchaseOrdersStore.push({ id, ...v, createdAt: new Date(), updatedAt: new Date() });
          });
        } else if (table === purchaseOrderItems) {
          valArray.forEach((v) => {
            const id = purchaseOrderItemsStore.length ? Math.max(...purchaseOrderItemsStore.map((p) => p.id)) + 1 : 1;
            lastInsertId = id;
            purchaseOrderItemsStore.push({ id, ...v });
          });
        } else if (table === salesOrders) {
          valArray.forEach((v) => {
            const id = salesOrdersStore.length ? Math.max(...salesOrdersStore.map((s) => s.id)) + 1 : 1;
            lastInsertId = id;
            salesOrdersStore.push({ id, ...v, createdAt: new Date(), updatedAt: new Date() });
          });
        } else if (table === salesOrderItems) {
          valArray.forEach((v) => {
            const id = salesOrderItemsStore.length ? Math.max(...salesOrderItemsStore.map((s) => s.id)) + 1 : 1;
            lastInsertId = id;
            salesOrderItemsStore.push({ id, ...v });
          });
        } else if (table === productionBatches) {
          valArray.forEach((v) => {
            const id = productionBatchesStore.length ? Math.max(...productionBatchesStore.map((b) => b.id)) + 1 : 1;
            lastInsertId = id;
            productionBatchesStore.push({ id, ...v, createdAt: new Date(), updatedAt: new Date() });
          });
        } else if (table === deliveryChallans) {
          valArray.forEach((v) => {
            const id = deliveryChallansStore.length ? Math.max(...deliveryChallansStore.map((c) => c.id)) + 1 : 1;
            lastInsertId = id;
            deliveryChallansStore.push({ id, ...v, createdAt: new Date(), updatedAt: new Date() });
          });
        } else if (table === deliveryChallanItems) {
          valArray.forEach((v) => {
            const id = deliveryChallanItemsStore.length ? Math.max(...deliveryChallanItemsStore.map((c) => c.id)) + 1 : 1;
            lastInsertId = id;
            deliveryChallanItemsStore.push({ id, ...v });
          });
        }

        const res = [{ insertId: lastInsertId }];
        const chain = {
          onDuplicateKeyUpdate: () => Promise.resolve(res),
          then: (resolve: Function) => resolve(res),
        };
        return chain;
      },
    };
  }

  update(table: any) {
    return {
      set: (values: any) => {
        return {
          where: (condition: any) => {
            const targetId = extractTargetValue(condition);
            if (targetId !== undefined) {
              let store: any[] = [];
              if (table === garments) store = garmentsStore;
              else if (table === productionBatches) store = productionBatchesStore;
              else if (table === salesOrders) store = salesOrdersStore;
              else if (table === purchaseOrders) store = purchaseOrdersStore;
              else if (table === deliveryChallans) store = deliveryChallansStore;
              else if (table === users) store = Array.from(inMemoryUsers.values());

              const target = store.find((item) => Number(item.id) === Number(targetId));
              if (target) {
                Object.assign(target, values, { updatedAt: new Date() });
              }
            }
            return Promise.resolve({ success: true });
          },
        };
      },
    };
  }

  delete(table: any) {
    return {
      where: (condition: any) => {
        const targetId = extractTargetValue(condition);
        if (targetId !== undefined) {
          let store: any[] = [];
          if (table === garments) store = garmentsStore;
          else if (table === productionBatches) store = productionBatchesStore;
          else if (table === salesOrders) store = salesOrdersStore;
          else if (table === purchaseOrders) store = purchaseOrdersStore;
          else if (table === deliveryChallans) store = deliveryChallansStore;

          const index = store.findIndex((item) => Number(item.id) === Number(targetId));
          if (index !== -1) {
            store.splice(index, 1);
          }
        }
        return Promise.resolve({ success: true });
      },
    };
  }

  async transaction(cb: Function) {
    return cb(this);
  }
}

const mockDb = new MockDb() as any;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db || mockDb;
}

export async function requireDb() {
  const db = await getDb();
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (db === mockDb) {
    const existing = inMemoryUsers.get(user.openId);
    const now = new Date();
    if (existing) {
      if (user.name !== undefined) existing.name = user.name ?? null;
      if (user.email !== undefined) existing.email = user.email ?? null;
      if (user.role !== undefined) existing.role = user.role;
      if (user.loginMethod !== undefined) existing.loginMethod = user.loginMethod ?? null;
      existing.lastSignedIn = now;
      existing.updatedAt = now;
    } else {
      inMemoryUsers.set(user.openId, {
        id: mockUserIdCounter++,
        openId: user.openId,
        name: user.name ?? "Demo User",
        email: user.email ?? `${user.openId}@klggarments.com`,
        loginMethod: user.loginMethod ?? "dev",
        role: user.role ?? "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      });
    }
    return;
  }

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (db === mockDb) {
    return inMemoryUsers.get(openId);
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listGarments() {
  const db = await requireDb();
  return db.select().from(garments).orderBy(desc(garments.updatedAt));
}
