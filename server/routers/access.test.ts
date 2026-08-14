import { describe, expect, it } from "vitest";
import { hasModuleAccess } from "./guards";

describe("KLG role-module access", () => {
  it("gives administrators access to every module", () => {
    expect(hasModuleAccess("admin", "catalog")).toBe(true);
    expect(hasModuleAccess("admin", "reports")).toBe(true);
    expect(hasModuleAccess("admin", "team")).toBe(true);
  });

  it("keeps production users away from sales and account reports", () => {
    expect(hasModuleAccess("production", "production")).toBe(true);
    expect(hasModuleAccess("production", "catalog")).toBe(true);
    expect(hasModuleAccess("production", "sales_orders")).toBe(false);
    expect(hasModuleAccess("production", "reports")).toBe(false);
  });

  it("limits accounts users to financial and dispatch workflows", () => {
    expect(hasModuleAccess("accounts", "sales_orders")).toBe(true);
    expect(hasModuleAccess("accounts", "delivery_challans")).toBe(true);
    expect(hasModuleAccess("accounts", "inventory")).toBe(false);
  });
});
