
import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
import './style.css'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { VueQueryPlugin } from "@tanstack/vue-query"

const options = {
  timeout: 3000,
  position: "top-right",
};

createApp(App)
  .use(router)
  .use(Toast,options)
  .use(VueQueryPlugin)
  .mount('#app')