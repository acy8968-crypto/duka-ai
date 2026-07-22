/**
 * exportService.js
 * ------------------------------------------------------------------
 * Turns a business's detected orders (from orderStore.js) into a real
 * downloadable .xlsx file, so the business owner can open it in Excel,
 * Google Sheets, or any spreadsheet app.
 *
 * The AI is instructed (in geminiService.js's meta-prompt) to output
 * order details as: item, quantity, price, customer name, phone, delivery area
 * separated by commas. This parses that loosely - if an order doesn't
 * match the expected shape, its full raw text is kept in "Order Details"
 * instead of being dropped, so nothing is ever silently lost.
 * ------------------------------------------------------------------
 */

const XLSX = require("xlsx");

const EXPECTED_FIELD_COUNT = 6;
const COLUMN_HEADERS = [
  "Item",
  "Quantity",
  "Price",
  "Customer Name",
  "Phone",
  "Delivery Area",
];

/**
 * Attempts to split one order's raw text into structured fields.
 * Falls back to putting everything in "Order Details" if the shape
 * doesn't match what the AI was instructed to produce.
 */
function parseOrderRow(order) {
  const parts = order.raw.split(",").map((p) => p.trim());

  const base = {
    "Order ID": order.id,
    "Received At": order.receivedAt,
    "Customer WhatsApp": order.customerWaId,
  };

  if (parts.length === EXPECTED_FIELD_COUNT) {
    const structured = {};
    COLUMN_HEADERS.forEach((header, i) => {
      structured[header] = parts[i];
    });
    return { ...base, ...structured };
  }

  // Fallback: keep the raw text intact rather than guessing at a bad split
  return { ...base, "Order Details": order.raw };
}

/**
 * Builds an .xlsx workbook buffer from a list of order records.
 * @param {Array} orders - order records from orderStore.getOrders()
 * @returns {Buffer} an .xlsx file, ready to send as a download
 */
function buildOrdersWorkbook(orders) {
  const rows = orders.map(parseOrderRow);

  // If there are zero orders yet, still produce a valid file with headers
  // only, so the download never errors out on an empty business.
  const worksheet =
    rows.length > 0
      ? XLSX.utils.json_to_sheet(rows)
      : XLSX.utils.json_to_sheet([
          { "Order ID": "", "Received At": "", "Customer WhatsApp": "", "Order Details": "No orders yet" },
        ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = { buildOrdersWorkbook };
