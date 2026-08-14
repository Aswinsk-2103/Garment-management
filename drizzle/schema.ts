import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const businessRoles = ["admin", "store_inventory", "production", "accounts"] as const;
export type BusinessRole = (typeof businessRoles)[number];

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "store_inventory", "production", "accounts"]).default("store_inventory").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const garments = mysqlTable("garments", {
  id: int("id").autoincrement().primaryKey(),
  style: varchar("style", { length: 160 }).notNull(),
  size: varchar("size", { length: 48 }).notNull(),
  color: varchar("color", { length: 96 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  lowStockThreshold: int("lowStockThreshold").notNull().default(25),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inventoryReceipts = mysqlTable("inventoryReceipts", {
  id: int("id").autoincrement().primaryKey(),
  garmentId: int("garmentId").notNull().references(() => garments.id),
  quantity: int("quantity").notNull(),
  supplierName: varchar("supplierName", { length: 180 }).notNull(),
  receivedDate: timestamp("receivedDate").notNull(),
  referenceNo: varchar("referenceNo", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const purchaseOrders = mysqlTable("purchaseOrders", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderNo: varchar("purchaseOrderNo", { length: 80 }).notNull().unique(),
  supplierName: varchar("supplierName", { length: 180 }).notNull(),
  supplierAddress: text("supplierAddress"),
  supplierGstin: varchar("supplierGstin", { length: 32 }),
  orderDate: timestamp("orderDate").notNull(),
  expectedDate: timestamp("expectedDate"),
  status: mysqlEnum("status", ["draft", "sent", "received", "cancelled"]).notNull().default("draft"),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const purchaseOrderItems = mysqlTable("purchaseOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchaseOrderId").notNull().references(() => purchaseOrders.id),
  garmentId: int("garmentId").notNull().references(() => garments.id),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unitCost", { precision: 12, scale: 2 }).notNull().default("0.00"),
  lineTotal: decimal("lineTotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
});

export const salesOrders = mysqlTable("salesOrders", {
  id: int("id").autoincrement().primaryKey(),
  salesOrderNo: varchar("salesOrderNo", { length: 80 }).notNull().unique(),
  customerName: varchar("customerName", { length: 180 }).notNull(),
  customerAddress: text("customerAddress").notNull(),
  customerGstin: varchar("customerGstin", { length: 32 }),
  orderDate: timestamp("orderDate").notNull(),
  deliveryDate: timestamp("deliveryDate"),
  status: mysqlEnum("status", ["draft", "confirmed", "in_production", "ready_to_dispatch", "delivered", "cancelled"]).notNull().default("draft"),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const salesOrderItems = mysqlTable("salesOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  salesOrderId: int("salesOrderId").notNull().references(() => salesOrders.id),
  garmentId: int("garmentId").notNull().references(() => garments.id),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull().default("0.00"),
  lineTotal: decimal("lineTotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
});

export const productionBatches = mysqlTable("productionBatches", {
  id: int("id").autoincrement().primaryKey(),
  batchNo: varchar("batchNo", { length: 80 }).notNull().unique(),
  garmentId: int("garmentId").notNull().references(() => garments.id),
  assignedQuantity: int("assignedQuantity").notNull(),
  progressStatus: mysqlEnum("progressStatus", ["planned", "cutting", "stitching", "checking", "completed", "on_hold"]).notNull().default("planned"),
  startDate: timestamp("startDate").notNull(),
  completionDate: timestamp("completionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deliveryChallans = mysqlTable("deliveryChallans", {
  id: int("id").autoincrement().primaryKey(),
  challanNo: varchar("challanNo", { length: 80 }).notNull().unique(),
  challanDate: timestamp("challanDate").notNull(),
  recipientName: varchar("recipientName", { length: 180 }).notNull(),
  recipientAddress: text("recipientAddress").notNull(),
  recipientGstin: varchar("recipientGstin", { length: 32 }),
  orderNo: varchar("orderNo", { length: 80 }).notNull(),
  purpose: varchar("purpose", { length: 160 }).notNull(),
  challanType: varchar("challanType", { length: 80 }).notNull(),
  remarks: text("remarks"),
  vehicleNo: varchar("vehicleNo", { length: 80 }),
  receivedBy: varchar("receivedBy", { length: 140 }),
  preparedBy: varchar("preparedBy", { length: 140 }),
  checkedBy: varchar("checkedBy", { length: 140 }),
  approvedBy: varchar("approvedBy", { length: 140 }),
  status: mysqlEnum("status", ["draft", "issued", "returned"]).notNull().default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deliveryChallanItems = mysqlTable("deliveryChallanItems", {
  id: int("id").autoincrement().primaryKey(),
  deliveryChallanId: int("deliveryChallanId").notNull().references(() => deliveryChallans.id),
  itemDescription: varchar("itemDescription", { length: 240 }).notNull(),
  deliveryQty: int("deliveryQty").notNull(),
  uom: varchar("uom", { length: 20 }).notNull().default("Pcs"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
