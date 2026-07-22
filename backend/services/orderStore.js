/**
 * orderStore.js
 * ------------------------------------------------------------------
 * TEMPORARY in-memory log of detected orders, per business.
 * The NEXT build step (Excel/Sheets export) will read from this same
 * store, so the shape here is designed to map cleanly onto spreadsheet
 * rows later.
 * ------------------------------------------------------------------
 */

const orders = new Map(); // businessId -> array of order records

function addOrder(businessId, orderData) {
  const list = orders.get(businessId) || [];
  const record = {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    receivedAt: new Date().toISOString(),
    raw: orderData.raw, // the full text the AI produced after "ORDER_CONFIRMED:"
    customerWaId: orderData.customerWaId,
  };
  list.push(record);
  orders.set(businessId, list);
  return record;
}

function getOrders(businessId) {
  return orders.get(businessId) || [];
}

module.exports = { addOrder, getOrders };
