<template>
  <div
    class="dashboard-container p-6 min-h-screen"
  >

    <!-- Header -->
    <div class="flex items-center justify-end mb-8">
      <div class="flex items-center gap-3 sm:gap-4">

        <!-- Student Selector -->
        <div
          v-if="students.length > 1"
          class="flex items-center gap-2"
        >
          <label
            for="student-select"
            class="hidden sm:block font-semibold text-gray-700"
          >
            Select Student:
          </label>

          <select
            id="student-select"
            v-model="selectedStudentId"
            @change="onStudentChange"
            class="px-3 py-2 sm:px-4 rounded-lg border border-gray-300
                   bg-white text-gray-700 text-sm sm:text-base
                   focus:outline-none focus:ring-2 focus:ring-blue-300
                   max-w-[180px] sm:max-w-none"
          >
            <option disabled value="">
              Please select one
            </option>

            <option
              v-for="student in students"
              :key="student.id"
              :value="student.id"
            >
              {{ student.full_name }}
            </option>
          </select>
        </div>

        <!-- Notification Bell -->
        <div class="relative">

          <button
            @click="toggleNotifications"
            class="relative text-gray-700 hover:text-gray-900
                   transition-transform duration-200 hover:scale-110"
            title="View latest announcement"
          >
            <i class="fas fa-bell text-2xl"></i>

            <!-- Today's notification count -->
            <span
              v-if="todayAnnouncementCount > 0"
              class="absolute -top-1 -right-2
                     bg-red-500 text-white text-xs font-bold
                     w-5 h-5 rounded-full
                     flex items-center justify-center"
            >
              {{ todayAnnouncementCount }}
            </span>
          </button>

          <!-- Latest Announcement -->
          <div
            v-if="showNotifications && latestAnnouncement"
            class="absolute right-0 top-full mt-3
                   w-72 max-w-[calc(100vw-1.5rem)]
                   bg-white border border-gray-200
                   rounded-2xl shadow-xl
                   p-4 z-50"
          >
            <p class="font-semibold text-gray-800">
              {{ latestAnnouncement.title }}
            </p>

            <p class="text-sm text-gray-600 mt-1 leading-relaxed">
              {{ latestAnnouncement.message }}
            </p>

            <p class="text-xs text-gray-400 mt-2 text-right">
              {{ formatDate(latestAnnouncement.created_at) }}
            </p>
          </div>

        </div>

      </div>
    </div>


    <!-- Student Dashboard -->
    <div
      v-if="selectedStudentId"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >

      <FeeOverview
        :student-id="selectedStudentId"
      />

      <DashboardAttendance
        :student-id="selectedStudentId"
      />

      <DashboardGrades
        :student-id="selectedStudentId"
      />

    </div>


    <!-- No Student Selected -->
    <div
      v-else
      class="text-center mt-16 text-gray-500"
    >
      <p>
        Please select a student to view their dashboard.
      </p>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';

import FeeOverview from '../components/Dashboard/FeeOverview.vue';
import DashboardGrades from '../components/Dashboard/DashboardGrades.vue';
import DashboardAttendance from '../components/Dashboard/DashboardAttendance.vue';

import { getStudent } from '../api/Students';
import { fetchEvents } from '../api/event';


// ==================================================
// Students
// ==================================================

const students = ref([]);
const selectedStudentId = ref('');


// ==================================================
// Notifications
// ==================================================

const latestAnnouncement = ref(null);
const todayAnnouncementCount = ref(0);
const showNotifications = ref(false);


// ==================================================
// Toggle Notification
// ==================================================

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};


// ==================================================
// Load Announcements
// ==================================================

const loadAnnouncement = async () => {
  try {

    const res = await fetchEvents();

    if (res.length > 0) {

      // Sort newest first
      const sorted = [...res].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

      // Latest announcement
      latestAnnouncement.value = sorted[0];


      // Count announcements created today
      const today = new Date();

      todayAnnouncementCount.value = sorted.filter(
        (announcement) => {

          const announcementDate =
            new Date(announcement.created_at);

          return (
            announcementDate.getFullYear() ===
              today.getFullYear() &&

            announcementDate.getMonth() ===
              today.getMonth() &&

            announcementDate.getDate() ===
              today.getDate()
          );
        }
      ).length;

    } else {

      latestAnnouncement.value = null;
      todayAnnouncementCount.value = 0;

    }

  } catch (error) {

    console.error(
      'Failed to load announcements:',
      error
    );

    latestAnnouncement.value = null;
    todayAnnouncementCount.value = 0;
  }
};


// ==================================================
// Format Announcement Date
// ==================================================

const formatDate = (dateStr) => {

  const date = new Date(dateStr);

  return date.toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

};


// ==================================================
// Student Selection
// ==================================================

const onStudentChange = () => {

  console.log(
    `Selected student ID changed to: ${selectedStudentId.value}`
  );

};


// ==================================================
// Initial Load
// ==================================================

onMounted(async () => {

  try {

    // Load students
    const response = await getStudent();

    students.value =
      Array.isArray(response)
        ? response
        : [];


    // Automatically select first student
    if (students.value.length > 0) {

      selectedStudentId.value =
        students.value[0].id;

    }


    // Load announcements
    await loadAnnouncement();

  } catch (error) {

    console.error(
      'Error fetching students or notifications:',
      error
    );

  }

});
</script>
