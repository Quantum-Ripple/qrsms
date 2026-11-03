<template>
  <section>
    <nav class="mb-6 flex flex-wrap gap-2 border-b border-gray-200" aria-label="School fee sections">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.label"
        :to="{ name: tab.route }"
        class="border-b-2 px-4 py-3 text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600"
        active-class="border-blue-600 text-blue-600"
        exact-active-class="border-blue-600 text-blue-600"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </section>
</template>

<script setup>
const tabs = [
  { label: 'Fee Structure', route: 'FinanceFeeStructure' },
  { label: 'Transport', route: 'TransportConfigurations' },
  { label: 'Uniforms', route: 'FinanceUniforms' },
  { label: 'Other Charges', route: 'FinanceOtherCharges' },
  { label: 'Student Details', route: 'ChargeAssignment'}
]
</script>