<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-semibold mb-6">Generate Invoice</h2>

    <div v-if="loading">Loading invoice details...</div>

    <div v-else-if="invoice">

      <div class="mb-4 space-y-1">
        <p><strong>Invoice ID:</strong> {{ invoice.id }}</p>
        <p><strong>Student Name:</strong> {{ invoice.student_name }}</p>
        <p><strong>Admission No.:</strong> {{ invoice.admission_number || 'N/A' }}</p>
        <p><strong>Class / Stream:</strong> {{ invoice.student_class }} — {{ invoice.student_stream }}</p>
        <p><strong>Term:</strong> {{ invoice.term }} {{ invoice.academic_year }}</p>
        <p><strong>Amount Due:</strong> {{ invoice.amount_due }}</p>
        <p><strong>Amount Paid:</strong> {{ invoice.amount_paid }}</p>
        <p><strong>Balance:</strong> {{ invoice.balance }}</p>
        <p><strong>Fully Paid:</strong> {{ invoice.is_fully_paid ? 'Yes' : 'No' }}</p>
        <p><strong>Created At:</strong> {{ formatDate(invoice.created_at) }}</p>
      </div>

      <div v-if="invoice.payments?.length" class="mb-4">
        <h3 class="font-medium mb-2">Payments</h3>
        <ul class="list-disc pl-5 text-sm">
          <li v-for="p in invoice.payments" :key="p.id">
            {{ formatDate(p.date) }} - {{ p.amount }} via {{ p.method_display }}
            <span v-if="p.transaction_code">(Txn: {{ p.transaction_code }})</span>
          </li>
        </ul>
      </div>

      <button
        @click="generateInvoicePDF"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download Invoice PDF
      </button>
    </div>

    <div v-else>
      <p class="text-red-500">Invoice details not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import jsPDF from 'jspdf'
import { getPayment } from '../../api/finance'

const route = useRoute()
const paymentId = route.params.id
const invoice = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // This endpoint returns the invoice object (id, school, school_name,
    // student_name, admission_number, student_class, student_stream,
    // term, academic_year, amount_due, amount_paid, balance,
    // is_fully_paid, created_at, payments[]).
    invoice.value = await getPayment(paymentId)
  } catch (err) {
    console.error('Failed to fetch invoice:', err)
  } finally {
    loading.value = false
  }
})

/*
|--------------------------------------------------------------------------
| GENERAL HELPERS — identical to the bursar's Payment Details page
|--------------------------------------------------------------------------
*/

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatCurrency = (amount) => {
  const value = Number(amount || 0)
  return `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const safeFileName = (name) => String(name || 'Student').replace(/[^a-z0-9]/gi, '_')

// "Grade 7 (Bidii Academy)" -> "Grade 7"; "East - Grade 7" -> "East".
const formatClassStream = (className, stream) => {
  const level = String(className || '').replace(/\s*\([^)]*\)\s*/g, '').trim()
  const streamName = stream ? String(stream).split('-')[0].trim() : ''
  return [level, streamName].filter(Boolean).join(' - ')
}

// Only what the invoice endpoint actually returns — no extra lookups.
const schoolInfo = computed(() => ({
  name: invoice.value?.school_name || 'SCHOOL'
}))

/*
|--------------------------------------------------------------------------
| PDF DESIGN CONSTANTS — same palette as the bursar's receipts/invoices
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
  accent: [23, 52, 88],
  accentTint: [231, 236, 244],
  success: [21, 128, 84],
  successTint: [225, 244, 235],
  warning: [180, 95, 20],
  warningTint: [250, 235, 219]
}

const FOOTER_NOTE = 'This is a computer-generated document and does not require a signature.'

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
| HEADER
|--------------------------------------------------------------------------
*/

const drawHeader = (doc, { title, documentNumber, date, status }) => {
  const info = schoolInfo.value
  let y = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  setText(doc, COLORS.accent)
  doc.text(info.name, MARGIN, y)

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
| LABEL / VALUE ROW
|--------------------------------------------------------------------------
*/

const drawFieldRow = (doc, fields, y) => {
  const colW = CONTENT_WIDTH / fields.length

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
| HERO AMOUNT PANEL
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
| SIMPLE TABLE (fee summary + payment history)
|--------------------------------------------------------------------------
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
    doc.text(`${schoolInfo.value.name}   •   Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN, y + 6, { align: 'right' })
  }
}

/*
|--------------------------------------------------------------------------
| GENERATE INVOICE PDF — identical pipeline to the bursar's downloadInvoice
|--------------------------------------------------------------------------
*/

function generateInvoicePDF() {
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
</script>