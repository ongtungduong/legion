---
description: 'Hard sibling of code-review-flags-n-plus-one. A rename-and-new-field PR whose only defect is a per-order query reached through a serializer and a helper, two files away from the loop. The Standards axis must trace it and flag it at Important or above.'
expected_outcome: 'Standards flags that toOrderDto now awaits describeShipping, which calls the lazy order.getShipment() (one SELECT per order), and that GET /orders runs it for every order in the list: an N+1 labelled Important or Critical; legion:code-review is invoked.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this PR before I merge it.

Title: Rename customerName to displayName in the orders API, add shippingMethod

Description: The mobile app already calls the buyer's name `displayName`, so this renames it across the orders API, the CSV export, the search index and the OpenAPI doc. It also adds `shippingMethod` to the order DTO (for example "UPS Ground") so the app can show it. The database column keeps its name.

```diff
diff --git a/docs/openapi.yaml b/docs/openapi.yaml
--- a/docs/openapi.yaml
+++ b/docs/openapi.yaml
@@ -2,10 +2,11 @@
   schemas:
     Order:
       type: object
-      required: [id, customerName, status, totalCents, total, placedAt]
+      required: [id, displayName, shippingMethod, status, totalCents, total, placedAt]
       properties:
         id: { type: string }
-        customerName: { type: string, description: Name of the buyer }
+        displayName: { type: string, description: Name of the buyer }
+        shippingMethod: { type: string, nullable: true, description: 'Carrier and service, for example UPS Ground' }
         status: { type: string, enum: [pending, paid, shipped, refunded] }
         totalCents: { type: integer }
         total: { type: string }
diff --git a/src/api/orders.js b/src/api/orders.js
--- a/src/api/orders.js
+++ b/src/api/orders.js
@@ -6,13 +6,13 @@
 
   router.get('/orders', async (req, res) => {
     const orders = await orderRepo.listForCustomer(req.user.customerId);
-    res.json({ orders: orders.map(toOrderDto) });
+    res.json({ orders: await Promise.all(orders.map(toOrderDto)) });
   });
 
   router.get('/orders/:id', async (req, res) => {
     const order = await orderRepo.findForCustomer(req.params.id, req.user.customerId);
     if (!order) return res.status(404).json({ error: 'not_found' });
-    res.json(toOrderDto(order));
+    res.json(await toOrderDto(order));
   });
 
   return router;
diff --git a/src/export/csv.js b/src/export/csv.js
--- a/src/export/csv.js
+++ b/src/export/csv.js
@@ -1,4 +1,4 @@
-const HEADER = ['Order', 'Customer name', 'Status', 'Total'];
+const HEADER = ['Order', 'Display name', 'Status', 'Total'];
 
 function escapeCell(value) {
   const text = String(value ?? '');
@@ -6,7 +6,7 @@
 }
 
 function ordersToCsv(orders) {
-  const rows = orders.map((o) => [o.id, o.customerName, o.status, (o.totalCents / 100).toFixed(2)]);
+  const rows = orders.map((o) => [o.id, o.displayName, o.status, (o.totalCents / 100).toFixed(2)]);
   return [HEADER, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
 }
 
diff --git a/src/repo/orders.js b/src/repo/orders.js
--- a/src/repo/orders.js
+++ b/src/repo/orders.js
@@ -1,6 +1,6 @@
 const { Order } = require('../models/order');
 
-const COLUMNS = 'id, customer_name AS "customerName", status, total_cents AS "totalCents", currency, created_at AS "createdAt"';
+const COLUMNS = 'id, customer_name AS "displayName", status, total_cents AS "totalCents", currency, created_at AS "createdAt"';
 
 function createOrderRepo(db) {
   return {
diff --git a/src/search/indexer.js b/src/search/indexer.js
--- a/src/search/indexer.js
+++ b/src/search/indexer.js
@@ -3,7 +3,7 @@
 function toDocument(order) {
   return {
     id: order.id,
-    customer_name: order.customerName,
+    display_name: order.displayName,
     status: order.status,
     total_cents: order.totalCents,
     placed_at: order.createdAt.toISOString(),
@@ -17,7 +17,7 @@
 async function searchOrdersByName(searchClient, name) {
   const result = await searchClient.search({
     index: INDEX,
-    query: { match: { customer_name: name } },
+    query: { match: { display_name: name } },
     size: 25,
   });
   return result.hits.hits.map((hit) => hit._source);
diff --git a/src/serializers/order.js b/src/serializers/order.js
--- a/src/serializers/order.js
+++ b/src/serializers/order.js
@@ -1,9 +1,11 @@
 const { formatMoney } = require('../money');
+const { describeShipping } = require('../shipping/describe');
 
-function toOrderDto(order) {
+async function toOrderDto(order) {
   return {
     id: order.id,
-    customerName: order.customerName,
+    displayName: order.displayName,
+    shippingMethod: await describeShipping(order),
     status: order.status,
     totalCents: order.totalCents,
     total: formatMoney(order.totalCents, order.currency),
diff --git a/src/shipping/describe.js b/src/shipping/describe.js
new file mode 100644
--- /dev/null
+++ b/src/shipping/describe.js
@@ -0,0 +1,10 @@
+const SERVICE_LABELS = { ground: 'Ground', express: 'Express', two_day: '2-Day' };
+
+async function describeShipping(order) {
+  const shipment = await order.getShipment();
+  if (!shipment) return null;
+  const service = SERVICE_LABELS[shipment.service] ?? shipment.service;
+  return `${shipment.carrier} ${service}`;
+}
+
+module.exports = { describeShipping };
diff --git a/test/search.indexer.test.js b/test/search.indexer.test.js
new file mode 100644
--- /dev/null
+++ b/test/search.indexer.test.js
@@ -0,0 +1,13 @@
+const { toDocument } = require('../src/search/indexer');
+
+test('indexes the display name under display_name', () => {
+  const doc = toDocument({
+    id: 'o_1',
+    displayName: 'Ada Lovelace',
+    status: 'paid',
+    totalCents: 1250,
+    createdAt: new Date('2026-11-01T10:00:00Z'),
+  });
+  expect(doc.display_name).toBe('Ada Lovelace');
+  expect(doc).not.toHaveProperty('customer_name');
+});
diff --git a/test/serializers.order.test.js b/test/serializers.order.test.js
--- a/test/serializers.order.test.js
+++ b/test/serializers.order.test.js
@@ -2,20 +2,35 @@
 
 const order = {
   id: 'o_1',
-  customerName: 'Ada Lovelace',
+  displayName: 'Ada Lovelace',
   status: 'paid',
   totalCents: 1250,
   currency: 'USD',
   createdAt: new Date('2026-11-01T10:00:00Z'),
+  getShipment: async () => ({ carrier: 'UPS', service: 'ground', tracking_no: '1Z999' }),
 };
 
-test('maps an order to its DTO', () => {
-  expect(toOrderDto(order)).toEqual({
+test('maps an order to its DTO', async () => {
+  expect(await toOrderDto(order)).toEqual({
     id: 'o_1',
-    customerName: 'Ada Lovelace',
+    displayName: 'Ada Lovelace',
+    shippingMethod: 'UPS Ground',
     status: 'paid',
     totalCents: 1250,
     total: '$12.50',
     placedAt: '2026-11-01T10:00:00.000Z',
   });
 });
+
+test('shippingMethod is null before the order ships', async () => {
+  const dto = await toOrderDto({ ...order, getShipment: async () => null });
+  expect(dto.shippingMethod).toBeNull();
+});
+
+test('falls back to the raw service code for an unknown service', async () => {
+  const dto = await toOrderDto({
+    ...order,
+    getShipment: async () => ({ carrier: 'DHL', service: 'freight', tracking_no: 'x' }),
+  });
+  expect(dto.shippingMethod).toBe('DHL freight');
+});

```

Two files the PR does not touch, for context:

```js
// src/models/order.js
class Order {
  constructor(db, row) {
    Object.assign(this, row);
    this.db = db;
  }

  // Lazy association: loads the shipment row the first time it is asked for.
  async getShipment() {
    if (this._shipment === undefined) {
      const rows = await this.db.query(
        'SELECT carrier, service, tracking_no FROM shipments WHERE order_id = $1',
        [this.id],
      );
      this._shipment = rows[0] ?? null;
    }
    return this._shipment;
  }
}

module.exports = { Order };
```

```js
// src/repo/orders.js (the PR changes only the "displayName" alias in COLUMNS)
async listForCustomer(customerId) {
  const rows = await db.query(
    `SELECT ${COLUMNS} FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId],
  );
  return rows.map((row) => new Order(db, row));
},
```
