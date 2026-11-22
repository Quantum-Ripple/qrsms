
import api from './axios'
import { useAuthStore } from '@/stores/authStore'

export default {
  // LOGIN
  async login(username, password) {
    return useAuthStore().login(username, password)
  },

  // LOGOUT
  async logout() {
    return useAuthStore().logout()
  },

  // AUTH STATUS
  isAuthenticated() {
    return useAuthStore().isAuthenticated
  },

  getUser() {
    return useAuthStore().user
  },

  // CHANGE PASSWORD - AUTHENTICATED USERS
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

  // STAFF PASSWORD RECOVERY

  async requestStaffOTP(identifier) {
    const response = await api.post(
      'auth/staff/request-otp/',
      {
        identifier: identifier.trim(),
      }
    )
    return response.data
  },

  async verifyStaffOTP(challengeId, code) {
    const response = await api.post(
      'auth/staff/verify-otp/',
      {
        challenge_id: challengeId,
        code: String(code),
      }
    )
    return response.data
  },

  async setStaffPassword({
    resetToken,
    password,
    confirmPassword,
  }) {
    const response = await api.post(
      'auth/staff/set-password/',
      {
        reset_token: resetToken,
        password,
        confirm_password: confirmPassword,
      }
    )
    return response.data
  },
}
