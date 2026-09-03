import { defineStore } from 'pinia'
import api from '@/api/axios'
import router from '../routers'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,  // memory only — never persisted
    user: null,          // memory only — never persisted
    ready: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken && !!s.user,
  },
  actions: {
    async login(username, password) {
      const { data } = await api.post('token/', { username, password })
      this.accessToken = data.access
      const { data: user } = await api.get('users/me/')
      this.user = user
      return user
    },
    async refreshAccessToken() {
      const { data } = await api.post('token/refresh/')  // cookie sent automatically
      this.accessToken = data.access
      return data.access
    },
    async boot() {  // called once on app start / hard refresh
      try {
        await this.refreshAccessToken()
        const { data: user } = await api.get('users/me/')
        this.user = user
      } catch {
        this.accessToken = null
        this.user = null
      } finally {
        this.ready = true
      }
    },
    async logout() {
      try { await api.post('logout/') } finally {
        this.accessToken = null
        this.user = null
        router.push('/login')
      }
    },
    forceLogout() {
      this.accessToken = null
      this.user = null
      router.push('/login')
    },
  },
})