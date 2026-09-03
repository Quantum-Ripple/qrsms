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
        @logout="onLogout"
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
import { ref, computed } from 'vue'
import SimpleAppBar from '../components/AppBar.vue'
import SimpleSideBar from '../components/SideBar.vue'
import Auth from '../api/Auth'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'




const navItems = [
  { label: 'Dashboard', route: { name: 'PrincipalDashboard' } },
  { label: 'Students', route: { name: 'PrincipalStudents' } },
  {
    label: 'Staff',
    children: [
      { label: 'Teachers', route: { name: 'PrincipalTeachers' } },
      { label: 'Non-Teaching Staff', route: { name: 'PrincipalOtherStaff' } },
    ],
  },
  { label: 'Parents', route: { name: 'ParentsList' } },
  //{ label: 'Attendance', route: { name: 'PrincipalAttendance' } },
  //{ label: 'Academics', route: {name: 'Academics'}},

  {
    label: 'Finance',
    children: [
      { label: 'Fee Overview', route: { name: 'PrincipalFeeOverview' } },
      { label: 'Detailed Transactions', route: { name: 'PrincipalDetailedTransactions' } },
      { label: 'Expenditure Summary', route: { name: 'PrincipalExpenditureSummary' } },
    ],
  },

  { label: 'Attendance', route: { name: 'PrincipalAttendanceManagement' } },

  {
    label: 'Academics',
    children: [
      
      { label: 'Create Assessments', route: { name: 'ExamManagement' } },
      { label: 'Performance Reports', route: { name: 'Academics' } },
    ],
  },



  { label: 'Reports', route: { name: 'PrincipalReports' } },
  { label: 'Promotions', route: { name: 'Promotions' } },

  { label: 'Communications', route: { name: 'PrincipalCommunications' } },

  { label: 'Calendar', route: {name: 'PrincipalCalendar'}},

  { label: 'Configurations', route: { name: 'Configurations' } },

  { label: 'Settings', route: { name: 'PrincipalSettings' } },
]


const mobileSidebarOpen = ref(false)
const router = useRouter()




function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}


const auth = useAuthStore()

const PageTitle = computed(() => `${getGreeting()}, ${auth.user?.first_name || ''}`)
const sidebarTitle = computed(() => `${auth.user?.school_name || ''}`)





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
