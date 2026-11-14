# QRSMS Parent Finance Portal — Integration

Files in `src/portals/parent/api/` and `src/portals/parent/components/Finance/` are ready to merge into the Vue frontend. They reuse your existing `getStudent()` and `fetchTerms()` functions and `src/api/axios` instance. They depend on Stage 1 finance serializers (including nested invoice lines) and Stage 2 PDF endpoints.

## 1. Routes (`src/portals/parent/index.js`)

Existing imports for FeeSummary, FeeStructure and FeeStatements can remain. Add:

```js
import Invoices from './components/Finance/Invoices.vue'
import Receipts from './components/Finance/Receipts.vue'
```

Then add inside the existing `path: 'finance'` route's `children` array:

```js
{ path: 'invoices', name: 'ParentInvoices', component: Invoices },
{ path: 'receipts', name: 'ParentReceipts', component: Receipts },
```

Do not replace the other finance routes. If a parent has a `ParentOnlinePayment` route already, retain it. Remove the unrelated duplicate `assignments` route at a later cleanup.

## 2. Sidebar (`DashboardLayout.vue`)

Under `Finance.children`, add:

```js
{ label: 'Invoices', route: { name: 'ParentInvoices' } },
{ label: 'Receipts', route: { name: 'ParentReceipts' } },
```

Retain `Make Payment` and the existing overview, statement and fee structure items.

## 3. Axios base URL

The helper imports the existing `src/api/axios` instance and sends relative paths such as `documents/students/7/statement/`. This matches the old parent `Finance.js` patterns assuming its Axios `baseURL` is `/api/v1/`. If your instance is mounted differently, change the paths in `api/financeDocuments.js` only.

For PDF preview/download the helper requests `responseType: 'blob'`, which sends the same Authorization header as other Axios calls. This is required for JWT-based authorization.

## 4. Backend dependencies

- `GET /api/v1/student/<id>/?term=<id>` from existing `StudentFinanceDetailView`.
- `GET /api/v1/student/<id>/payments/` from existing `StudentPaymentHistoryView`.
- The five `documents/` routes created in Stage 2.
- `InvoiceDetailSerializer.lines` from Stage 1.

Backend receipts are currently scoped to the payment owner; a payment allocated to the selected student but recorded for another sibling may appear in the payment-history list but return 404 when requesting a PDF. The UI reports this honestly. Decide on your parent receipt-ownership policy before enabling sibling downloads.

## 5. Notes

- `FeeStructure.vue` shows the **issued invoice lines** for the selected student, not the generic class fee structure.
- Term statement PDF is explicitly a **current-position** report, not an as-of-date reconstruction.
- Available credit is separate from applied payments.
- Preview uses a PDF blob URL and a modal iframe; browser PDF viewers have varying support for scripted Print. Use their built-in print command if needed.
- Parent `Make Payment` is untouched.
- No additional frontend dependencies.
- The shared `useParentFinance` module holds selected student/term while switching parent Finance pages. It does not persist across full browser refreshes.
- PDF backend still requires `reportlab` on the Django server; the frontend cannot compensate for missing backend dependencies.

## 6. Local verification

- Ensure the project builds (`npm run build` or your existing build command).
- Test a parent with one child and with multiple children.
- Test no invoice, itemized charges, negative discount lines, transport-only invoice, and legacy arrears in earlier outstanding.
- Test an actual posted payment and an authorized reversed payment receipt.
- Test PDF preview/download with JWT enabled and at mobile width.
