<template>
  <div v-if="ctx.loaded && ctx.availableYears.length" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
      :class="ctx.isViewingCurrent ? 'border-gray-200' : 'border-amber-300 bg-amber-50'"
      @click="open = !open"
    >
      <span class="hidden sm:inline text-xs text-gray-500">
        {{ ctx.canSwitchYear ? 'Academic year' : 'Viewing' }}
      </span>
      <span class="font-medium truncate max-w-[9rem]">{{ label }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />

    <div
      v-if="open"
      class="absolute right-0 top-12 w-72 max-w-[calc(100vw-1rem)] max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
    >
      <!-- Year section: principal / finance only -->
      <div v-if="ctx.canSwitchYear" class="mb-2">
        <p class="px-2 py-1 text-xs font-semibold uppercase text-gray-400">Academic year</p>
        <button
          v-for="y in ctx.availableYears"
          :key="y.id"
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-gray-100"
          :class="y.id === ctx.selectedYearId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'"
          @click="ctx.setYear(y.id)"
        >
          <span>{{ y.year }}</span>
          <span v-if="y.id === ctx.currentYearId" class="text-xs text-green-600">Current</span>
        </button>
      </div>

      <!-- Term section -->
      <div v-for="group in termGroups" :key="group.id" class="mb-1">
        <p class="px-2 py-1 text-xs font-semibold uppercase text-gray-400">
          {{ ctx.canSwitchYear ? 'Term' : group.year }}
        </p>
        <p v-if="!group.terms.length" class="px-3 py-2 text-sm text-gray-400">No terms set up</p>
        <button
          v-for="t in group.terms"
          :key="t.id"
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-gray-100"
          :class="t.id === ctx.selectedTermId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'"
          @click="pickTerm(t.id)"
        >
          <span>{{ t.name }}</span>
          <span v-if="t.id === ctx.currentTermId" class="text-xs text-green-600">Current term</span>
        </button>
      </div>

      <button
        v-if="!ctx.isViewingCurrent"
        type="button"
        class="w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border-t"
        @click="backToCurrent"
      >
        Back to current term
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useAcademicContextStore } from "@/stores/academicContextStore"

const ctx = useAcademicContextStore()
const open = ref(false)

const label = computed(() => {
  const year = ctx.selectedAcademicYear?.year ?? ""
  const term = ctx.selectedTerm?.name
  if (ctx.canSwitchYear) return term ? `${year} · ${term}` : year
  return term ? `${term} · ${year}` : year
})

// Principal/finance: terms of the selected year. Others: every year, grouped.
const termGroups = computed(() => {
  const years = ctx.canSwitchYear
    ? ctx.availableYears.filter((y) => y.id === ctx.selectedYearId)
    : ctx.availableYears
  return years.map((y) => ({ id: y.id, year: y.year, terms: [...y.terms].reverse() })) // newest first
})

function pickTerm(id) {
  ctx.setTerm(id)
  open.value = false
}

function backToCurrent() {
  ctx.resetToCurrent()
  open.value = false
}
</script>