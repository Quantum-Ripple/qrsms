<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 md:hidden
           bg-white border-t border-gray-200
           pb-[env(safe-area-inset-bottom)]"
  >
    <div class="h-16 flex items-center justify-around">

      <!-- Home -->
      <RouterLink
        :to="{ name: 'ParentDashboard' }"
        class="flex flex-col items-center justify-center
               w-full h-full text-gray-500
               active:text-gray-900"
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
            d="M3 12l9-9 9 9M5 10v10h14V10M9 20v-6h6v6"
          />
        </svg>
        <span class="text-xs">Home</span>
      </RouterLink>

      <!-- Fees -->
      <RouterLink
        :to="{ name: 'ParentFeeSummary' }"
        class="flex flex-col items-center justify-center
               w-full h-full text-gray-500
               active:text-gray-900"
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
            d="M3 10h18M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16 15h2"
          />
        </svg>
        <span class="text-xs">Fees</span>
      </RouterLink>

      <!-- Assessments -->
      <RouterLink
        :to="{ name: 'ParentAssessment' }"
        class="flex flex-col items-center justify-center
               w-full h-full text-gray-500
               active:text-gray-900"
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
        <span class="text-xs">Assessments</span>
      </RouterLink>

      <!-- Inbox -->
      <RouterLink
        :to="{ name: 'ParentAnnouncements' }"
        class="flex flex-col items-center justify-center
               w-full h-full text-gray-500
               active:text-gray-900"
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
            d="M3 8l9 6 9-6"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
          />
        </svg>
        <span class="text-xs">Inbox</span>
      </RouterLink>

    </div>
  </nav>
</template>