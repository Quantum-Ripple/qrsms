import api from '../../../api/axios'

async function fetchPdfBlob(path, params = {}) {
  const response = await api.get(path, {
    params,
    responseType: 'blob',
    headers: { Accept: '*/*' },
  })
  return response.data
}

function blobToUrl(blob) {
  return URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
}

function triggerDownload(blob, filename = 'document.pdf') {
  const url = blobToUrl(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function openInNewTab(blob) {
  const url = blobToUrl(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  return url
}

function printBlob(blob) {
  const url = blobToUrl(blob)
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) return
  const timer = setInterval(() => {
    try {
      if (win.document?.readyState === 'complete') {
        clearInterval(timer)
        win.focus()
        win.print()
      }
    } catch {
      clearInterval(timer)
      win.focus()
      win.print()
    }
  }, 500)
  return url
}

export async function getStudentStatementBlob(studentId, params = {}) {
  return fetchPdfBlob(`/documents/students/${studentId}/statement/`, params)
}

export async function getStudentFeeBreakdownBlob(studentId, params = {}) {
  return fetchPdfBlob(`/documents/students/${studentId}/fee-breakdown/`, params)
}

export async function getInvoiceBlob(invoiceId, params = {}) {
  return fetchPdfBlob(`/documents/invoices/${invoiceId}/`, params)
}

export async function getTransportInvoiceBlob(invoiceId, params = {}) {
  return fetchPdfBlob(`/documents/transport-invoices/${invoiceId}/`, params)
}

export async function getReceiptBlob(paymentId, params = {}) {
  return fetchPdfBlob(`/documents/payments/${paymentId}/receipt/`, params)
}

export {
  blobToUrl,
  triggerDownload,
  openInNewTab,
  printBlob,
}