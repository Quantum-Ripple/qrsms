export function exportResultsCsv(headers, rows, filename, metadata = []) {
  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = [...metadata, headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
