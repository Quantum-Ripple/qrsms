
import api from '../../../api/axios'


export const getWallet = async () => (await api.get('/wallet/')).data

export const previewSms = async (payload) => (await api.post('/preview/', payload)).data

export const sendSmsCampaign = async (payload) => (await api.post('/campaigns/', payload)).data

export const listCampaigns = async () => (await api.get('/campaigns/')).data

export const getCampaignStats = async (id) => (await api.get(`/campaigns/${id}/stats/`)).data

export const getCampaignRecipients = async (id, status = '') =>
  (await api.get(`/campaigns/${id}/recipients/`, { params: status ? { status } : {} })).data

export const createTopUp = async (payload) => (await api.post('/topups/', payload)).data

export const getTopUp = async (id) => (await api.get(`/topups/${id}/`)).data

// DRF returns either {detail: "..."} or {field: ["message"]}. Turn both into one string.
export function errorText(err) {
  const data = err?.response?.data
  if (!data) return err?.message || 'Something went wrong.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  const first = Object.values(data)[0]
  return Array.isArray(first) ? first[0] : String(first)
}

// Some list endpoints are paginated ({results: []}), some are plain lists.
export const rows = (data) => (Array.isArray(data) ? data : data?.results || [])
