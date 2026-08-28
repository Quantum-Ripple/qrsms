import api from './axios'

// Routes
export async function fetchTransportRoutes() {
  return api.get('/transport/routes/')
}

export async function createTransportRoute(data) {
  return api.post('/transport/routes/', data)
}

export async function updateTransportRoute(id, data) {
  return api.patch(`/transport/routes/${id}/`, data)
}

export async function deleteTransportRoute(id) {
  return api.delete(`/transport/routes/${id}/`)
}

// Route Prices
export async function fetchTransportRoutePrices(params = {}) {
  return api.get('/transport/route-prices/', { params })
}

export async function createTransportRoutePrice(data) {
  return api.post('/transport/route-prices/', data)
}

export async function updateTransportRoutePrice(id, data) {
  return api.patch(`/transport/route-prices/${id}/`, data)
}

export async function deleteTransportRoutePrice(id) {
  return api.delete(`/transport/route-prices/${id}/`)
}

// Transport Invoices
export async function fetchTransportInvoices(params = {}) {
  return api.get('/transport/invoices/', { params })
}

export async function generateTransportInvoices(data) {
  return api.post('/transport/invoices/generate/', data)
}

export async function updateTransportInvoice(id, data) {
  return api.patch(`/transport/invoices/${id}/`, data)
}

export async function deleteTransportInvoice(id) {
  return api.delete(`/transport/invoices/${id}/`)
}