

export function getErrorMessage(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return fallback
  if (data.detail) return data.detail

  // Flatten { password: ['Too common'], non_field_errors: ['...'] } into one list
  const messages = []
  const walk = (value, key) => {
    if (typeof value === 'string') {
      messages.push(key && key !== 'non_field_errors' ? `${key}: ${value}` : value)
    } else if (Array.isArray(value)) {
      value.forEach((v) => walk(v, key))
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => walk(v, k))
    }
  }
  walk(data, '')
  return messages.length ? messages.join('\n') : fallback
}