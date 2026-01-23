<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-semibold mb-6">Generate Invoice</h2>

    <div v-if="loading">Loading payment details...</div>

    <div v-else-if="payment">
    
      <div class="mb-4">
        <p><strong>Student Name:</strong> {{ payment.student_name }}</p>
        <p><strong>Class Level:</strong> {{ payment.class_level || 'N/A' }}</p>
        <p><strong>Payment Method:</strong> {{ payment.method_display }}</p>
        <p><strong>Payment Date:</strong> {{ payment.date }}</p>
        <p><strong>Transaction ID:</strong> {{ payment.transaction_code || 'N/A' }}</p>
        <p><strong>Received By:</strong> {{ payment.received_by }}</p>
      </div>

      
      <button
        @click="generateInvoicePDF"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download Invoice PDF
      </button>
    </div>

    <div v-else>
      <p class="text-red-500">Payment details not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' 
import { getPayment } from '../../api/finance'

const route = useRoute()
const paymentId = route.params.id
const payment = ref(null)
const loading = ref(true)

const schoolInfo = {
  name: 'Precious Academy',
  address: '123 Tech Street, Nairobi',
  phone: '+254 700 000000',
  email: 'info@quantumripple.co.ke',
}

onMounted(async () => {
  try {
    const data = await getPayment(paymentId)
    payment.value = data
  } catch (err) {
    console.error('Failed to fetch payment:', err)
  } finally {
    loading.value = false
  }
})

function generateInvoicePDF() {
  if (!payment.value) return

  const doc = new jsPDF()


  doc.setFontSize(18)
  doc.text(schoolInfo.name, 14, 20)
  doc.setFontSize(11)
  doc.text(schoolInfo.address, 14, 26)
  doc.text(`Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}`, 14, 32)

 
  doc.setFontSize(16)
  doc.text('INVOICE', 14, 45)

  // Payment Details
  doc.setFontSize(11)
  doc.text(`Student Name: ${payment.value.student_name}`, 14, 55)
  doc.text(`Class Level: ${payment.value.class_level || 'N/A'}`, 14, 61)
  doc.text(`Payment Method: ${payment.value.method_display}`, 14, 67)
  doc.text(`Payment Date: ${payment.value.date}`, 14, 73)
  doc.text(`Transaction ID: ${payment.value.transaction_code || 'N/A'}`, 14, 79)
  doc.text(`Received By: ${payment.value.received_by}`, 14, 85)

  // Payment Table using autoTable
  autoTable(doc, {
    startY: 95,
    head: [['Description', 'Amount (KES)']],
    body: [['School Fees Payment', Number(payment.value.amount).toLocaleString()]],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 11 },
  })

  const finalY = doc.lastAutoTable.finalY || 110
  doc.setFontSize(12)
  doc.text(`Total: KES ${Number(payment.value.amount).toLocaleString()}`, 14, finalY + 10)
  doc.setFontSize(10)
  doc.text('Thank you for your payment!', 14, finalY + 20)

  doc.save(`Invoice_${payment.value.student_name}_${payment.value.date}.pdf`)
}
</script>
