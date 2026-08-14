import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMock = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("../db", () => ({
  requireDb: vi.fn(async () => dbMock),
  listGarments: vi.fn(async () => []),
}));

import { appRouter } from "../routers";

type Role = "admin" | "store_inventory" | "production" | "accounts";

function callerFor(role: Role) {
  const ctx: TrpcContext = {
    user: { id: 1, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

function valuesResult(result: unknown = undefined) {
  return { values: vi.fn().mockResolvedValue(result) };
}

beforeEach(() => vi.clearAllMocks());

describe("KLG business procedures", () => {
  it("creates a garment with the required style, size, color, and quantity", async () => {
    const insert = valuesResult();
    dbMock.insert.mockReturnValue(insert);
    await callerFor("store_inventory").catalog.create({ style: "Women Long Sleeve Tee", size: "2XL", color: "Black", quantity: 149, lowStockThreshold: 25 });
    expect(dbMock.insert).toHaveBeenCalledTimes(1);
    expect(insert.values).toHaveBeenCalledWith({ style: "Women Long Sleeve Tee", size: "2XL", color: "Black", quantity: 149, lowStockThreshold: 25 });
  });

  it("records a stock receipt and runs the quantity increment inside one transaction", async () => {
    const receiptInsert = valuesResult();
    const quantityUpdate = { set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) };
    dbMock.transaction.mockImplementation(async (work: (tx: typeof dbMock) => Promise<void>) => work({ ...dbMock, insert: vi.fn().mockReturnValue(receiptInsert), update: vi.fn().mockReturnValue(quantityUpdate) }));
    await callerFor("store_inventory").inventory.receive({ garmentId: 7, quantity: 12, supplierName: "Tetra Knits", receivedDate: Date.now(), referenceNo: "GRN-12", notes: "Received and counted" });
    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    expect(receiptInsert.values).toHaveBeenCalledWith(expect.objectContaining({ garmentId: 7, quantity: 12, supplierName: "Tetra Knits" }));
    expect(quantityUpdate.set).toHaveBeenCalledTimes(1);
  });

  it("creates a supplier purchase order with calculated line totals", async () => {
    const headerInsert = valuesResult([{ insertId: 40 }]);
    const itemsInsert = valuesResult();
    dbMock.transaction.mockImplementation(async (work: (tx: typeof dbMock) => Promise<void>) => work({ ...dbMock, insert: vi.fn().mockReturnValueOnce(headerInsert).mockReturnValueOnce(itemsInsert) }));
    await callerFor("store_inventory").purchaseOrders.create({ purchaseOrderNo: "PO-001", supplierName: "Tetra Knits", orderDate: Date.now(), status: "sent", items: [{ garmentId: 7, quantity: 20, unitCost: 150 }] });
    expect(headerInsert.values).toHaveBeenCalledWith(expect.objectContaining({ purchaseOrderNo: "PO-001", totalAmount: "3000.00" }));
    expect(itemsInsert.values).toHaveBeenCalledWith([{ purchaseOrderId: 40, garmentId: 7, quantity: 20, unitCost: "150.00", lineTotal: "3000.00" }]);
  });

  it("creates customer sales orders with their multiple line-item totals", async () => {
    const headerInsert = valuesResult([{ insertId: 41 }]);
    const itemsInsert = valuesResult();
    dbMock.transaction.mockImplementation(async (work: (tx: typeof dbMock) => Promise<void>) => work({ ...dbMock, insert: vi.fn().mockReturnValueOnce(headerInsert).mockReturnValueOnce(itemsInsert) }));
    await callerFor("accounts").salesOrders.create({ salesOrderNo: "SO-001", customerName: "Kavillakshmi Garment", customerAddress: "Tirupur", orderDate: Date.now(), status: "confirmed", items: [{ garmentId: 7, quantity: 10, unitPrice: 275 }, { garmentId: 8, quantity: 2, unitPrice: 300 }] });
    expect(headerInsert.values).toHaveBeenCalledWith(expect.objectContaining({ salesOrderNo: "SO-001", totalAmount: "3350.00" }));
    expect(itemsInsert.values).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ lineTotal: "2750.00" }), expect.objectContaining({ lineTotal: "600.00" })]));
  });

  it("creates a delivery challan header and itemized delivery list in one transaction", async () => {
    const headerInsert = valuesResult([{ insertId: 51 }]);
    const itemsInsert = valuesResult();
    dbMock.transaction.mockImplementation(async (work: (tx: typeof dbMock) => Promise<void>) => work({ ...dbMock, insert: vi.fn().mockReturnValueOnce(headerInsert).mockReturnValueOnce(itemsInsert) }));
    await callerFor("accounts").challans.create({ challanNo: "GN-58/26", challanDate: Date.now(), recipientName: "Kavillakshmi Garment", recipientAddress: "Tirupur", orderNo: "KG-11689", purpose: "STITCHING TO CHECKING", challanType: "Returnable", status: "issued", items: [{ itemDescription: "WOMEN LONG SLEEVE TEE-BLACK-2XL", deliveryQty: 149, uom: "Pcs" }] });
    expect(headerInsert.values).toHaveBeenCalledWith(expect.objectContaining({ challanNo: "GN-58/26", recipientName: "Kavillakshmi Garment" }));
    expect(itemsInsert.values).toHaveBeenCalledWith([{ deliveryChallanId: 51, itemDescription: "WOMEN LONG SLEEVE TEE-BLACK-2XL", deliveryQty: 149, uom: "Pcs" }]);
  });

  it("denies production operations to a role without production access", async () => {
    await expect(callerFor("accounts").production.create({ batchNo: "BT-01", garmentId: 7, assignedQuantity: 10, progressStatus: "planned", startDate: Date.now() })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });
});
