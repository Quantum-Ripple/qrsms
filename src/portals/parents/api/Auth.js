import api from '../../../api/axios'
import { useAuthStore } from '@/stores/authStore'

export default {
  async login(username, password) {
    return useAuthStore().login(username, password)
  },

  async logout() {
    return useAuthStore().logout()
  },

  isAuthenticated() {
    return useAuthStore().isAuthenticated
  },

  getUser() {
    return useAuthStore().user
  },

  async ChangePassword(oldPassword, newPassword) {
    try {
      const response = await api.put('password-change/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      return response.data
    } catch (error) {
      if (error.response) throw error.response.data
      throw error
    }
  },
}
