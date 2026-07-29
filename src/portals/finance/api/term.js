import api from '../../../api/axios'

export const listTerms = async () => {
    const response = await api.get('/terms/')
    return response.data
}