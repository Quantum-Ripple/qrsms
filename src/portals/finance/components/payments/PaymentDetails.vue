<template>
  <div class="p-4 md:p-6">
    <h1 class="text-2xl font-semibold mb-6">Payment Details</h1>

    <button
      class="mb-4 text-blue-600 hover:underline"
      @click="$router.push({ name: 'FinancePayments'})"
    >
      &larr; Back to Payments
    </button>

    <section class="mb-6 p-4 border rounded shadow-sm bg-white">
      <h2 class="text-xl font-medium mb-4">Payment Details</h2>
      <p><strong>Student:</strong> {{ payment.student_name }}</p>
      <p><strong>Date:</strong> {{ payment.date }}</p>
      <p><strong>Amount:</strong> {{ payment.amount }}</p>
      <p><strong>Method:</strong> {{ payment.method_display }}</p>
      <p><strong>Received By:</strong> {{ payment.received_by }}</p>

      <button
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="downloadReceipt"
      >
        Download Receipt
      </button>
    </section>

    <section v-if="invoice" class="p-4 border rounded shadow-sm bg-white">
      <h2 class="text-xl font-medium mb-4">Invoice Details</h2>
      <p><strong>Invoice ID:</strong> {{ invoice.id }}</p>
      <p><strong>Student:</strong> {{ invoice.student_name }}</p>
      <p><strong>Amount Due:</strong> {{ invoice.amount_due }}</p>
      <p><strong>Amount Paid:</strong> {{ invoice.amount_paid }}</p>
      <p><strong>Fully Paid:</strong> {{ invoice.is_fully_paid ? 'Yes' : 'No' }}</p>
      <p><strong>Created At:</strong> {{ formatDate(invoice.created_at) }}</p>

      <h3 class="font-medium mt-4">Payments</h3>
      <ul class="list-disc pl-5">
        <li v-for="p in invoice.payments" :key="p.id">
          {{ formatDate(p.date) }} - {{ p.amount }} via {{ p.method_display }}
          <span v-if="p.transaction_code">
            (Txn: {{ p.transaction_code }})
          </span>
        </li>
      </ul>

      <button
        class="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        @click="downloadInvoice"
      >
        Download Invoice
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPaymentById, getInvoiceById } from '../../api/fee'
import { getSchoolDetails } from '../../api/event'
import jsPDF from 'jspdf'

const route = useRoute()
const paymentId = route.params.id

const payment = ref({})
const invoice = ref(null)
const school = ref({})

/*
|--------------------------------------------------------------------------
| GENERAL HELPERS
|--------------------------------------------------------------------------
*/

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => {
  const value = Number(amount || 0)
  return `KES ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

const safeFileName = (name) => String(name || 'Student').replace(/[^a-z0-9]/gi, '_')

// "Grade 7 (Bidii Academy)" -> "Grade 7"; "East - Grade 7" -> "East".
// Combined result: "Grade 7 - East" (no repeated grade, no school name).
const formatClassStream = (className, stream) => {
  const level = String(className || '').replace(/\s*\([^)]*\)\s*/g, '').trim()
  const streamName = stream ? String(stream).split('-')[0].trim() : ''
  return [level, streamName].filter(Boolean).join(' - ')
}

// The API sometimes returns addresses with literal \r\n in them -
// collapse to a single readable line.
const oneLine = (value) => String(value || '').replace(/\r\n|\r|\n/g, ', ').trim()

/*
|--------------------------------------------------------------------------
| SCHOOL INFO
|--------------------------------------------------------------------------
| The payment endpoint already returns the school fields flattened
| (school_name, school_address, ...), so for a receipt we don't need
| a second network call. The invoice endpoint only gives us a school
| id + school_name, so we still fetch full details for invoices.
*/

const schoolInfo = computed(() => ({
  name: payment.value.school_name || school.value.name || invoice.value?.school_name || 'SCHOOL',
  registrationNumber: payment.value.school_registration_number || school.value.registration_number || '',
  address: oneLine(payment.value.school_address || school.value.address),
  city: payment.value.school_city || school.value.city || '',
  county: payment.value.school_county || school.value.county || '',
  phone: payment.value.school_phone || school.value.phone || '',
  email: payment.value.school_email || school.value.email || ''
}))

/*
|--------------------------------------------------------------------------
| PDF DESIGN CONSTANTS
|--------------------------------------------------------------------------
*/

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const COLORS = {
  ink: [30, 32, 36],
  muted: [120, 122, 128],
  faint: [160, 162, 168],
  line: [223, 225, 229],
  panel: [246, 247, 249],
  panelLine: [232, 234, 238],
  accent: [23, 52, 88],       // deep navy — school brand tone
  accentTint: [231, 236, 244],
  success: [21, 128, 84],
  successTint: [225, 244, 235],
  warning: [180, 95, 20],
  warningTint: [250, 235, 219]
}

const FOOTER_NOTE = 'This is a computer-generated document and does not require a signature.'

/*
|--------------------------------------------------------------------------
| LOW-LEVEL DRAW HELPERS
|--------------------------------------------------------------------------
*/

const setText = (doc, color = COLORS.ink) => doc.setTextColor(...color)
const setDraw = (doc, color = COLORS.line) => doc.setDrawColor(...color)
const setFill = (doc, color) => doc.setFillColor(...color)

const hLine = (doc, y, color = COLORS.line, weight = 0.3, x1 = MARGIN, x2 = PAGE_WIDTH - MARGIN) => {
  setDraw(doc, color)
  doc.setLineWidth(weight)
  doc.line(x1, y, x2, y)
}

const panel = (doc, x, y, w, h, { fill = COLORS.panel, stroke = COLORS.panelLine, radius = 2.5 } = {}) => {
  setFill(doc, fill)
  setDraw(doc, stroke)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, w, h, radius, radius, 'FD')
}

/*
|--------------------------------------------------------------------------
| DOCUMENT HEADER
|--------------------------------------------------------------------------
| Letterhead-style header: school identity on the left, document
| title / number / date on the right, plus an optional status pill
| (PAID / BALANCE DUE) and a clean accent rule underneath.
*/

const drawHeader = (doc, { title, documentNumber, date, status }) => {
  const info = schoolInfo.value
  let y = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  setText(doc, COLORS.accent)
  doc.text(info.name, MARGIN, y)

  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, COLORS.muted)

  const line2 = [info.city, info.county].filter(Boolean).join(', ')
  if (line2) {
    doc.text(line2, MARGIN, y)
    y += 4
  }

  const line3 = [info.phone, info.email].filter(Boolean).join('   •   ')
  if (line3) {
    doc.text(line3, MARGIN, y)
  }

  // Title block, right-aligned
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  setText(doc, COLORS.ink)
  doc.text(title.toUpperCase(), PAGE_WIDTH - MARGIN, 22, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, COLORS.muted)
  doc.text(documentNumber, PAGE_WIDTH - MARGIN, 28, { align: 'right' })
  doc.text(formatDate(date), PAGE_WIDTH - MARGIN, 33, { align: 'right' })

  if (status) {
    const isPositive = status.tone === 'success'
    const fill = isPositive ? COLORS.successTint : COLORS.warningTint
    const text = isPositive ? COLORS.success : COLORS.warning
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    const label = status.label.toUpperCase()
    const textWidth = doc.getTextWidth(label)
    const padX = 3
    const boxW = textWidth + padX * 2
    const boxX = PAGE_WIDTH - MARGIN - boxW
    const boxY = 36
    setFill(doc, fill)
    doc.roundedRect(boxX, boxY, boxW, 6, 1.5, 1.5, 'F')
    setText(doc, text)
    doc.text(label, boxX + boxW / 2, boxY + 4.2, { align: 'center' })
  }

  hLine(doc, 48, COLORS.accent, 0.7)

  return 60
}

/*
|--------------------------------------------------------------------------
| STUDENT PANEL
|--------------------------------------------------------------------------
*/

const drawStudentPanel = (doc, { name, admission, classText }, y) => {
  const panelH = 24
  panel(doc, MARGIN, y, CONTENT_WIDTH, panelH)

  const padX = 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  setText(doc, COLORS.muted)
  doc.text('STUDENT', MARGIN + padX, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  setText(doc, COLORS.ink)
  doc.text(name || '—', MARGIN + padX, y + 14)

  if (admission) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    setText(doc, COLORS.muted)
    doc.text(`Admission No. ${admission}`, MARGIN + padX, y + 19.5)
  }

  if (classText) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setText(doc, COLORS.ink)
    doc.text(classText, PAGE_WIDTH - MARGIN - padX, y + 14, { align: 'right' })
  }

  return y + panelH + 8
}

/*
|--------------------------------------------------------------------------
| LABEL / VALUE ROW (evenly spaced across the content width)
|--------------------------------------------------------------------------
*/

const drawFieldRow = (doc, fields, y) => {
  const cols = fields.length
  const colW = CONTENT_WIDTH / cols

  fields.forEach((field, i) => {
    const x = MARGIN + colW * i
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setText(doc, COLORS.muted)
    doc.text(field.label.toUpperCase(), x, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    setText(doc, COLORS.ink)
    doc.text(String(field.value || '—'), x, y + 5.5)
  })

  return y + 16
}

/*
|--------------------------------------------------------------------------
| HERO AMOUNT PANEL (single figure, e.g. Amount Paid)
|--------------------------------------------------------------------------
*/

const drawAmountHero = (doc, label, amount, y, tone = 'accent') => {
  const fill = tone === 'success' ? COLORS.successTint : COLORS.accentTint
  const textColor = tone === 'success' ? COLORS.success : COLORS.accent
  const panelH = 26

  panel(doc, MARGIN, y, CONTENT_WIDTH, panelH, { fill, stroke: fill })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, COLORS.muted)
  doc.text(label.toUpperCase(), PAGE_WIDTH / 2, y + 9, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(21)
  setText(doc, textColor)
  doc.text(formatCurrency(amount), PAGE_WIDTH / 2, y + 20, { align: 'center' })

  return y + panelH + 10
}

/*
|--------------------------------------------------------------------------
| SIMPLE TABLE (used for invoice fee summary + payment history)
|--------------------------------------------------------------------------
| columns: [{ header, width (fraction of content width), align }]
| rows: array of arrays of pre-formatted strings
| onNewPage: callback invoked when the table has to continue on a
|            fresh page — should redraw the letterhead and return the y
|            to resume at.
*/

const drawTable = (doc, { columns, rows, y, onNewPage }) => {
  const widths = columns.map((c) => c.width * CONTENT_WIDTH)
  const xs = []
  let acc = MARGIN
  widths.forEach((w) => {
    xs.push(acc)
    acc += w
  })

  const drawHeaderRow = (yy) => {
    setFill(doc, COLORS.panel)
    doc.rect(MARGIN, yy, CONTENT_WIDTH, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    setText(doc, COLORS.muted)
    columns.forEach((col, i) => {
      const align = col.align || 'left'
      const tx = align === 'right' ? xs[i] + widths[i] - 2 : xs[i] + 2
      doc.text(col.header.toUpperCase(), tx, yy + 5.3, { align })
    })
    return yy + 8
  }

  let cy = drawHeaderRow(y)

  rows.forEach((row, rowIndex) => {
    const rowH = 9

    if (cy + rowH > PAGE_HEIGHT - 40) {
      cy = onNewPage(doc)
      cy = drawHeaderRow(cy)
    }

    if (rowIndex % 2 === 1) {
      setFill(doc, COLORS.panel)
      doc.rect(MARGIN, cy, CONTENT_WIDTH, rowH, 'F')
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    setText(doc, COLORS.ink)

    row.forEach((cell, i) => {
      const align = columns[i].align || 'left'
      const tx = align === 'right' ? xs[i] + widths[i] - 2 : xs[i] + 2
      const bold = columns[i].bold
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.text(String(cell), tx, cy + 6, { align })
    })

    cy += rowH
  })

  hLine(doc, cy, COLORS.panelLine)

  return cy + 8
}

/*
|--------------------------------------------------------------------------
| FOOTER
|--------------------------------------------------------------------------
*/

const drawFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i)
    const y = PAGE_HEIGHT - 16
    hLine(doc, y, COLORS.line)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setText(doc, COLORS.faint)
    doc.text(FOOTER_NOTE, MARGIN, y + 6)
    doc.text(
      `${schoolInfo.value.name}   •   Page ${i} of ${pageCount}`,
      PAGE_WIDTH - MARGIN,
      y + 6,
      { align: 'right' }
    )
  }
}

/*
|--------------------------------------------------------------------------
| FETCH DATA
|--------------------------------------------------------------------------
*/

const fetchData = async () => {
  try {
    payment.value = await getPaymentById(paymentId)

    if (payment.value.invoice) {
      invoice.value = await getInvoiceById(payment.value.invoice)
    }

    // Fall back to a direct school lookup only if the payment response
    // didn't already give us full contact details (e.g. older API).
    const needsSchoolFetch = !payment.value.school_address && (payment.value.school || invoice.value?.school)
    if (needsSchoolFetch) {
      school.value = await getSchoolDetails(payment.value.school || invoice.value.school)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

/*
|--------------------------------------------------------------------------
| DOWNLOAD RECEIPT
|--------------------------------------------------------------------------
*/

const downloadReceipt = () => {
  if (!payment.value?.id) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setProperties({
    title: `Receipt - ${payment.value.student_name}`,
    subject: 'Payment Receipt',
    creator: schoolInfo.value.name
  })

  const receiptNumber = `RCP-${String(payment.value.id).padStart(5, '0')}`

  let y = drawHeader(doc, {
    title: 'Payment Receipt',
    documentNumber: receiptNumber,
    date: payment.value.date
  })

  y = drawStudentPanel(doc, {
    name: payment.value.student_name,
    admission: payment.value.student_admission_number,
    classText: formatClassStream(payment.value.student_class, payment.value.student_stream)
  }, y)

  y = drawFieldRow(doc, [
    { label: 'Date Paid', value: formatDate(payment.value.date) },
    { label: 'Method', value: payment.value.method_display },
    { label: 'Transaction Ref.', value: payment.value.transaction_code || '—' },
    { label: 'Term', value: [payment.value.term, payment.value.academic_year].filter(Boolean).join(' • ') || '—' }
  ], y)

  y += 2
  y = drawAmountHero(doc, 'Amount Paid', payment.value.amount, y, 'success')

  if (payment.value.invoice_amount_due !== undefined) {
    y = drawFieldRow(doc, [
      { label: 'Invoice Total', value: formatCurrency(payment.value.invoice_amount_due) },
      { label: 'Total Paid to Date', value: formatCurrency(payment.value.invoice_amount_paid) },
      { label: 'Balance Outstanding', value: formatCurrency(payment.value.invoice_balance) },
      { label: 'Received By', value: payment.value.received_by || '—' }
    ], y)
  } else {
    y = drawFieldRow(doc, [
      { label: 'Received By', value: payment.value.received_by || '—' }
    ], y)
  }

  y += 6
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  setText(doc, COLORS.muted)
  doc.text('Thank you for your payment.', PAGE_WIDTH / 2, y, { align: 'center' })

  drawFooter(doc)

  const fileName = safeFileName(payment.value.student_name)
  doc.save(`Receipt_${fileName}_${payment.value.id}.pdf`)
}

/*
|--------------------------------------------------------------------------
| DOWNLOAD INVOICE
|--------------------------------------------------------------------------
*/

const downloadInvoice = () => {
  if (!invoice.value) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setProperties({
    title: `Invoice - ${invoice.value.student_name}`,
    subject: 'Fee Invoice',
    creator: schoolInfo.value.name
  })

  const invoiceNumber = `INV-${String(invoice.value.id).padStart(5, '0')}`

  const redrawLetterhead = () => drawHeader(doc, {
    title: 'Invoice',
    documentNumber: invoiceNumber,
    date: invoice.value.created_at,
    status: {
      label: invoice.value.is_fully_paid ? 'Fully paid' : 'Balance due',
      tone: invoice.value.is_fully_paid ? 'success' : 'warning'
    }
  })

  let y = redrawLetterhead()

  y = drawStudentPanel(doc, {
    name: invoice.value.student_name,
    admission: invoice.value.admission_number,
    classText: formatClassStream(invoice.value.student_class, invoice.value.student_stream)
  }, y)

  y = drawFieldRow(doc, [
    { label: 'Billing Period', value: [invoice.value.term, invoice.value.academic_year].filter(Boolean).join(' • ') || '—' },
    { label: 'Invoice Date', value: formatDate(invoice.value.created_at) },
    { label: 'Status', value: invoice.value.is_fully_paid ? 'Fully Paid' : 'Balance Due' }
  ], y)

  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setText(doc, COLORS.muted)
  doc.text('FEE SUMMARY', MARGIN, y)
  y += 4

  y = drawTable(doc, {
    columns: [
      { header: 'Description', width: 0.7 },
      { header: 'Amount', width: 0.3, align: 'right', bold: true }
    ],
    rows: [
      [`School Fees — ${[invoice.value.term, invoice.value.academic_year].filter(Boolean).join(' ')}`.trim(), formatCurrency(invoice.value.amount_due)]
    ],
    y,
    onNewPage: () => {
      doc.addPage()
      return redrawLetterhead()
    }
  })

  const balance = invoice.value.balance !== undefined
    ? invoice.value.balance
    : Number(invoice.value.amount_due || 0) - Number(invoice.value.amount_paid || 0)

  y = drawFieldRow(doc, [
    { label: 'Total Due', value: formatCurrency(invoice.value.amount_due) },
    { label: 'Total Paid', value: formatCurrency(invoice.value.amount_paid) },
    { label: 'Balance', value: formatCurrency(balance) }
  ], y)

  const payments = invoice.value.payments || []
  if (payments.length) {
    y += 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    setText(doc, COLORS.muted)
    doc.text('PAYMENT HISTORY', MARGIN, y)
    y += 4

    y = drawTable(doc, {
      columns: [
        { header: 'Date', width: 0.22 },
        { header: 'Method', width: 0.23 },
        { header: 'Transaction Ref.', width: 0.3 },
        { header: 'Amount', width: 0.25, align: 'right', bold: true }
      ],
      rows: payments.map((p) => [
        formatDate(p.date),
        p.method_display || '—',
        p.transaction_code || '—',
        formatCurrency(p.amount)
      ]),
      y,
      onNewPage: () => {
        doc.addPage()
        return redrawLetterhead()
      }
    })
  }

  if (y > PAGE_HEIGHT - 60) {
    doc.addPage()
    y = redrawLetterhead()
  }

  y += 4
  y = drawAmountHero(
    doc,
    'Outstanding Balance',
    balance,
    y,
    invoice.value.is_fully_paid ? 'success' : 'accent'
  )

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  setText(doc, COLORS.muted)
  doc.text(
    invoice.value.is_fully_paid
      ? 'Thank you. This invoice has been fully settled.'
      : 'Please clear the outstanding balance at your earliest convenience.',
    PAGE_WIDTH / 2,
    y,
    { align: 'center' }
  )

  drawFooter(doc)

  const fileName = safeFileName(invoice.value.student_name)
  doc.save(`Invoice_${fileName}_${invoice.value.id}.pdf`)
}

/*
|--------------------------------------------------------------------------
| INITIAL LOAD
|--------------------------------------------------------------------------
*/

onMounted(fetchData)
</script>

<style scoped>
section {
  margin-bottom: 1.5rem;
}
</style>