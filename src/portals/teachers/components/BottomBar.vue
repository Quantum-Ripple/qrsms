
<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 md:hidden
           bg-white border-t border-gray-200
           pb-[env(safe-area-inset-bottom)]"
  >
    <div class="h-16 flex items-stretch justify-around">

      <!-- Home -->
      <router-link
        :to="{ name: 'TeachersDashboard' }"
        class="flex-1 flex flex-col items-center justify-center
               text-gray-500 hover:text-gray-800
               transition-colors duration-150"
        active-class="text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 10.5L12 3l9 7.5M5.5 9.5V21h13V9.5M9 21v-6h6v6"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Home
        </span>
      </router-link>


      <!-- Students -->
      <router-link
        :to="{ name: 'TeachersStudentsPage' }"
        class="flex-1 flex flex-col items-center justify-center
               text-gray-500 hover:text-gray-800
               transition-colors duration-150"
        active-class="text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
          />
          <circle
            cx="9"
            cy="7"
            r="4"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Students
        </span>
      </router-link>


      <!-- Attendance -->
      <router-link
        :to="{ name: 'TeachersAttendancePage' }"
        class="flex-1 flex flex-col items-center justify-center
               text-gray-500 hover:text-gray-800
               transition-colors duration-150"
        active-class="text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 11l3 3L22 4"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Attendance
        </span>
      </router-link>


      <!-- Assessments -->
      <router-link
        :to="{ name: 'TeachersSubjectScore' }"
        class="flex-1 flex flex-col items-center justify-center
               text-gray-500 hover:text-gray-800
               transition-colors duration-150"
        active-class="text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
          />
          <rect
            x="9"
            y="3"
            width="6"
            height="4"
            rx="1"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 13h6M9 17h4"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Assessments
        </span>
      </router-link>

    </div>
  </nav>
</template>
