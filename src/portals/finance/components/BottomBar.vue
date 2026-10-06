
<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 md:hidden
           bg-white border-t border-gray-200
           pb-[env(safe-area-inset-bottom)]"
  >
    <div class="h-16 flex items-stretch justify-around">

      <!-- Home -->
      <router-link
        :to="{ name: 'FinanceDashboard' }"
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


      <!-- Payments -->
      <router-link
        :to="{ name: 'FinancePayments' }"
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
            d="M3 10h18M7 15h2m2 0h2"
          />
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Payments
        </span>
      </router-link>


      <!-- Invoices -->
      <router-link
        :to="{ name: 'FinanceInvoices' }"
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
            d="M7 3h10a2 2 0 012 2v16l-7-3-7 3V5a2 2 0 012-2z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 8h6M9 12h6"
          />
        </svg>

        <span class="text-[11px] font-medium">
          Invoices
        </span>
      </router-link>


      <!-- Transport -->
      <router-link
        :to="{ name: 'TransportBilling' }"
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
            d="M5 17h14M6 17v2h2v-2m8 0v2h2v-2"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 17l1-7h12l1 7M8 10l1.5-4h5L16 10"
          />
          <circle cx="8" cy="14" r="1" />
          <circle cx="16" cy="14" r="1" />
        </svg>

        <span class="text-[11px] font-medium">
          Transport
        </span>
      </router-link>

    </div>
  </nav>
</template>
