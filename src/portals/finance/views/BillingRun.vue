<template>
  <section>
    <div class="mb-1 px-3 pt-3 sm:px-6 sm:pt-6">
      <h1 class="text-lg font-semibold text-gray-900">Generate bills</h1>
      <p class="text-sm text-gray-500">Review each student's charges, then create the invoices for the class.</p>
    </div>

    <nav class="mb-2 flex flex-wrap gap-2 border-b border-gray-200 px-3 sm:px-6" aria-label="Billing steps">
      <RouterLink
        v-for="(step, i) in steps"
        :key="step.route"
        :to="{ name: step.route, query: $route.query }"
        class="border-b-2 px-4 py-3 text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600"
        active-class="border-blue-600 text-blue-600"
        exact-active-class="border-blue-600 text-blue-600"
      >
        {{ i + 1 }}. {{ step.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </section>
</template>

<script setup>
const steps = [
  { label: 'Review charges', route: 'FinanceBillingReview' },
  { label: 'Generate', route: 'FinanceBillingGenerate' },
]
</script>