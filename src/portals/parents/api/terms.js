import api from '../../../api/axios'



export const fetchTerms = async () => {
    const response = await api.get('/terms/')
    return response.data
}