import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import './style.css'

import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import { VueQueryPlugin } from "@tanstack/vue-query"
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'

const options = {
  timeout: 3000,
  position: "top-right",
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
   .use(Toast, options)
   .use(VueQueryPlugin)

useAuthStore().boot().finally(() => {
  app.use(router)
  app.mount('#app')
})