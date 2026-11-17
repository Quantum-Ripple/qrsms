
<template>
  <div class="flex h-screen h-[100dvh] min-w-0 overflow-hidden bg-[#f8fafc] text-slate-900">
    <SimpleSideBar
      :items="navItems"
      :title="sidebarTitle"
      :collapsed="desktopSidebarCollapsed"
      @expand="desktopSidebarCollapsed = false"
      @logout="onLogout"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <SimpleAppBar
        :title="pageTitle"
        :sidebar-collapsed="desktopSidebarCollapsed"
        :mobile-sidebar-open="mobileSidebarOpen"
        @menu-toggle="toggleMobileSidebar"
        @sidebar-toggle="desktopSidebarCollapsed = !desktopSidebarCollapsed"
        @logout="onLogout"
      />

      <main
        id="principal-content"
        class="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-5 sm:px-6 md:pb-8 md:pt-6 lg:px-8"
      >
        <div class="mx-auto w-full max-w-[1600px]">
          <router-view />
        </div>
      </main>
    </div>

    <Teleport to="body">
      <transition name="drawer-fade">
        <div
          v-if="mobileSidebarOpen"
          class="fixed inset-0 z-[60] flex md:hidden"
        >
          <button
            type="button"
            aria-label="Close navigation"
            class="absolute inset-0 bg-slate-950/45"
            @click="closeMobileSidebar"
          />

          <SimpleSideBar
            class="relative z-10 h-full max-w-[85vw] shadow-xl"
            :items="navItems"
            :title="sidebarTitle"
            mobile
            @navigate="closeMobileSidebar"
            @close="closeMobileSidebar"
            @logout="onLogout"
          />
        </div>
      </transition>
    </Teleport>

    <BottomBar />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import SimpleAppBar from '../components/AppBar.vue'
import SimpleSideBar from '../components/SideBar.vue'
import BottomBar from '../components/BottomBar.vue'
import Auth from '../api/Auth'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  {
    label: 'Dashboard',
    route: { name: 'PrincipalDashboard' },
  },
  {
    label: 'Students',
    route: { name: 'PrincipalStudents' },
  },
  {
    label: 'Staff',
    children: [
      { label: 'Teachers', route: { name: 'PrincipalTeachers' } },
      { label: 'Non-Teaching Staff', route: { name: 'PrincipalOtherStaff' } },
    ],
  },
  {
    label: 'Parents',
    route: { name: 'ParentsList' },
  },
  {
    label: 'Finance',
    children: [
      { label: 'Fee Overview', route: { name: 'PrincipalFeeOverview' } },
      { label: 'Detailed Transactions', route: { name: 'PrincipalDetailedTransactions' } },
      { label: 'Expenditure Summary', route: { name: 'PrincipalExpenditureSummary' } },
    ],
  },
  {
    label: 'Attendance',
    route: { name: 'PrincipalAttendanceManagement' },
  },
  {
    label: 'Academics',
    children: [
      { label: 'Create Assessments', route: { name: 'ExamManagement' } },
      { label: 'Results', route: { name: 'ClassResultsView' } },
      { label: 'Release Results', route: { name: 'ReleaseResults' } },
    ],
  },
  {
    label: 'Reports',
    route: { name: 'PrincipalReports' },
  },
  {
    label: 'Promotions',
    route: { name: 'Promotions' },
  },
  {
    label: 'Communications',
    route: { name: 'PrincipalCommunications' },
  },
  {
    label: 'Calendar',
    route: { name: 'PrincipalCalendar' },
  },
  {
    label: 'Configurations',
    route: { name: 'Configurations' },
  },
  {
    label: 'Settings',
    route: { name: 'PrincipalSettings' },
  },
]

const auth = useAuthStore()
const route = useRoute()

const mobileSidebarOpen = ref(false)
const desktopSidebarCollapsed = ref(false)
const sidebarTitle = computed(() => auth.user?.school_name || '')

const currentHour = ref(new Date().getHours())

const greeting = computed(() =>
  currentHour.value < 12
    ? 'Good morning'
    : currentHour.value < 17
      ? 'Good afternoon'
      : 'Good evening'
)

const pageTitle = computed(() =>
  `${greeting.value}${auth.user?.first_name ? `, ${auth.user.first_name}` : ''}`
)

function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

function closeMobileSidebar() {
  mobileSidebarOpen.value = false
}

function handleKeydown(event) {
  if (event.key === 'Escape') closeMobileSidebar()
}

let desktopMediaQuery

function handleViewportChange(event) {
  if (event.matches) closeMobileSidebar()
}

onMounted(() => {
  desktopMediaQuery = window.matchMedia('(min-width: 48rem)')
  desktopMediaQuery.addEventListener('change', handleViewportChange)
  document.addEventListener('keydown', handleKeydown)
})

watch(
  () => route.fullPath,
  () => {
    closeMobileSidebar()
    currentHour.value = new Date().getHours()
  }
)

let previousBodyOverflow

function restoreBodyOverflow() {
  if (typeof document !== 'undefined' && previousBodyOverflow !== undefined) {
    document.body.style.overflow = previousBodyOverflow
    previousBodyOverflow = undefined
  }
}

watch(mobileSidebarOpen, (open) => {
  if (typeof document !== 'undefined') {
    if (open) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      restoreBodyOverflow()
    }
  }
})

onBeforeUnmount(() => {
  desktopMediaQuery?.removeEventListener('change', handleViewportChange)
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
  }
  restoreBodyOverflow()
})

async function onLogout() {
  closeMobileSidebar()

  if (window.confirm('Are you sure you want to log out?')) {
    await Auth.logout()
  }
}
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.18s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>
