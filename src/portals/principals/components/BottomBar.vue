
<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 md:hidden
           bg-white border-t border-gray-200
           pb-[env(safe-area-inset-bottom)]"
  >
    <div class="h-16 flex items-stretch justify-around">

      <!-- Home -->
      <router-link
        :to="{ name: 'PrincipalDashboard' }"
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
        :to="{ name: 'PrincipalStudents' }"
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
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 004 4v2"
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


      <!-- Fees -->
      <router-link
        :to="{ name: 'PrincipalFeeOverview' }"
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
            d="M12 1v22M17 5.5c-1-1-2.5-1.5-5-1.5S7 5 7 7s1.5 3 5 3 5 1 5 3-2.5 3-5 3-4-.5-5-1.5"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Fees
        </span>
      </router-link>


      <!-- Attendance -->
      <router-link
        :to="{ name: 'PrincipalAttendanceManagement' }"
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

    </div>
  </nav>
</template>
