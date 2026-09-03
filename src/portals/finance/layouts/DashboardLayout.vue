<template>
  <div class="flex h-screen bg-gray-50">
    
    <SimpleSideBar
      class="hidden md:flex"
      :items="navItems"
      :title="sidebarTitle"
      @logout="onLogout"
    />

    
    <div class="flex-1 flex flex-col">
      
      <SimpleAppBar
        class="relative z-50"
        :title="PageTitle"
        @menu-toggle="toggleSidebar"
      />

      
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>

    
    <transition name="fade">
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 z-40 flex"
      >

        <SimpleSideBar
          class="relative z-50 bg-white w-full sm:w-3/4 max-w-xs"
          :items="navItems"
          title="Menu"
          @logout="onLogout"
          @navigate="toggleSidebar"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SimpleAppBar from '../components/AppBar.vue'
import SimpleSideBar from '../components/SideBar.vue'
import Auth from '../../../api/Auth.js'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const navItems = [
  { label: 'Dashboard', route: { name: 'FinanceDashboard' } },
  { label: 'Fee Structures', route: { name: 'FinanceFeeStructure'}},
  { label: 'Payments', route: { name: 'FinancePayments'}},
  { label: 'Invoices', route: { name: 'FinanceInvoices'}},
  { label: 'Expenditures', route: { name: 'FinanceExpenditures'}},
  { label: 'Transport Billing', route: { name: 'TransportBilling'}},
  { label: 'Transport Configurations', route: { name: 'TransportConfigurations'}},
  { label: 'Announcements', route: { name: 'FinanceAnnouncements' } },
  { label: 'Settings', route: { name: 'FinanceSettings' } },
 
]

const mobileSidebarOpen = ref(false)
const router = useRouter()




function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
const userData = auth.user

const PageTitle = ref(`${getGreeting()}, ${userData.first_name || ""}`)

const sidebarTitle = ref(`${userData.school_name || ""}`)





function toggleSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

async function onLogout() {
  if (confirm("Are you sure you want to logout?")) {
    await Auth.logout()
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>