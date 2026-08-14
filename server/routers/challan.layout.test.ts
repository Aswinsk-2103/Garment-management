import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChallanSheet } from "../../client/src/pages/KLGApp";

describe("delivery challan printable sheet", () => {
  it("preserves the supplied document’s header, table, note, and signature structure", () => {
    const markup = renderToStaticMarkup(createElement(ChallanSheet, {
      challan: { challanNo: "GN-58/26", challanDate: new Date("2026-07-09"), recipientName: "Kavillakshmi Garment", recipientAddress: "Tirupur – 641604", recipientGstin: "33GRMPK2410K1ZS", orderNo: "KG-11689", purpose: "STITCHING TO CHECKING", challanType: "Returnable", remarks: "KG WAFFLE BLACK : REMAINING", vehicleNo: "TN 39 AB 1234", receivedBy: "Receiver", preparedBy: "Prepared", checkedBy: "Checked", approvedBy: "Approved" },
      items: [{ id: 1, itemDescription: "WOMEN LONG SLEEVE TEE-BLACK-2XL", deliveryQty: 149, uom: "Pcs" }],
    }));
    for (const expected of ["GENERAL DELIVERY", "KLG GARMENTS", "TO M/S.", "Delivery Challan No:", "Order No:", "Purpose:", "Type:", "Item Description", "Delivery Qty", "Recd. By:", "Prepared By", "Checked By", "Approved By", "For KLG GARMENTS", "Authorised Sig"]) expect(markup).toContain(expected);
    expect(markup).toContain("WOMEN LONG SLEEVE TEE-BLACK-2XL");
    expect(markup).toContain("Total:");
  });
});
