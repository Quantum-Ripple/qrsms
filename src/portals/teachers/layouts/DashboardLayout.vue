<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <SimpleSideBar
      class="hidden md:flex"
      :items="navItems"
      :title="sidebarTitle"
      @logout="onLogout"
    />

    <!-- Main Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top App Bar -->
      <SimpleAppBar
          class="relative z-50"
          :title="PageTitle"
          @menu-toggle="toggleSidebar"
          @logout="onLogout"
        />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>

    <!-- Mobile Sidebar (toggleable) -->
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
import Auth from '../api/Auth'
import { useAuthStore } from '@/stores/authStore'
import { useClassStore } from '@/stores/classStore'

const navItems = [
  { label: 'Dashboard', route: { name: 'TeachersDashboard' } },
  { label: 'Students', route: { name: 'TeachersStudentsPage' } },
  { label: 'Attendance', route: { name: 'TeachersAttendancePage' } },
 // { label: 'Grades', route: { name: 'TeachersGradesPage' } },
  //{ label: 'Assessments', route: { name: 'TeachersAssessmentsPage' } },
  { label: 'Assessments' ,
     children: [
      //{ label: 'Create Assessment', route: { name: 'CreateExam' } },
      //{ label: 'Rubric', route: { name: 'TeachersRubrics' } },
      { label: 'Subject Score', route: { name: 'TeachersSubjectScore' } },
      { label: 'Term Scores', route: { name: 'TeachersResults' } },
      //{label: 'Final Results', route: {name: 'TeachersFinalResults'}}
    ], 
  },
  { label: 'Assignments', route: { name: 'TeachersAssignmentsPage' } },

  { label: 'Announcements', route: { name: 'TeachersAnnouncementsPage' } },
  { label: 'Settings', route: { name: 'TeachersSettings' } },
]


const mobileSidebarOpen = ref(false)
const auth = useAuthStore()
const classStore = useClassStore()

classStore.loadInitialClass()



function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
const userData = auth.user || {}


const getDisplayNameFromEmail = (email = "") => {
  if (!email || typeof email !== "string") return ""
  return email.split("@")[0]
}
//const name = getDisplayNameFromEmail(userData.email)
const name=userData.username

const PageTitle = ref(`${getGreeting()}, ${name || ""}`)

const sidebarTitle = ref(`${userData.school_name || ""}`)





function toggleSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

async function onLogout() {
  if(confirm("Are you sure you want to logout?")){
    await Auth.logout()
    classStore.clearClass()
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
