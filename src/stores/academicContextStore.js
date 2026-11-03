import { defineStore } from "pinia"
import api from "@/api/axios"
import { useAuthStore } from "./authStore" // adjust path to your auth store

const YEAR_SWITCHING_ROLES = ["principal", "finance"]

function storageKey() {
  const user = useAuthStore().user
  if (!user) return null
  const school = user.school?.id ?? user.school
  return `academicContext:${school}:${user.id}:${user.role}`
}

function readSaved() {
  try {
    const key = storageKey()
    return key ? JSON.parse(localStorage.getItem(key)) : null
  } catch {
    return null
  }
}

export const useAcademicContextStore = defineStore("academicContext", {
  state: () => ({
    years: [],              // newest first, each with nested terms (oldest first)
    currentYearId: null,    // official, from backend
    currentTermId: null,    // official, from backend
    selectedYearId: null,   // what the user is viewing
    selectedTermId: null,
    loaded: false,
    loading: false,
  }),

  getters: {
    availableYears: (s) => s.years,

    allTerms: (s) =>
      s.years.flatMap((y) => y.terms.map((t) => ({ ...t, yearId: y.id }))),

    canSwitchYear: () =>
      YEAR_SWITCHING_ROLES.includes(useAuthStore().user?.role),

    currentAcademicYear: (s) => s.years.find((y) => y.id === s.currentYearId) || null,
    currentTerm() {
      return this.allTerms.find((t) => t.id === this.currentTermId) || null
    },

    selectedAcademicYear: (s) => s.years.find((y) => y.id === s.selectedYearId) || null,
    selectedTerm() {
      return this.allTerms.find((t) => t.id === this.selectedTermId) || null
    },

    isViewingCurrentYear: (s) => s.selectedYearId === s.currentYearId,
    isViewingCurrentTerm: (s) => s.selectedTermId === s.currentTermId,
    isViewingCurrent() {
      return this.isViewingCurrentYear && this.isViewingCurrentTerm
    },
  },

  actions: {
    async init() {
      if (!useAuthStore().user) return
      this.loading = true
      try {
        const { data } = await api.get("academic-context/")
        this.years = data.years
        this.currentYearId = data.current_year_id
        this.currentTermId = data.current_term_id
        this.restoreOrDefault()
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    // Current year -> current term. Any other year -> its last term.
    defaultTermId(year) {
      if (!year) return null
      if (year.id === this.currentYearId && this.currentTermId) return this.currentTermId
      return year.terms.at(-1)?.id ?? null
    },

    restoreOrDefault() {
      let yearId = this.currentYearId
      let termId = this.defaultTermId(this.currentAcademicYear)

      const saved = readSaved()
      if (saved) {
        const savedTerm = this.allTerms.find((t) => t.id === saved.termId)
        const savedYear = this.years.find((y) => y.id === saved.yearId)
        if (this.canSwitchYear && savedYear) {
          yearId = savedYear.id
          termId = savedTerm && savedTerm.yearId === savedYear.id
            ? savedTerm.id
            : this.defaultTermId(savedYear)
        } else if (savedTerm) {
          yearId = savedTerm.yearId
          termId = savedTerm.id
        }
      }

      this.selectedYearId = yearId
      this.selectedTermId = termId
    },

    setYear(yearId) {
      if (!this.canSwitchYear) return
      const year = this.years.find((y) => y.id === yearId)
      if (!year) return
      this.selectedYearId = year.id
      this.selectedTermId = this.defaultTermId(year) // never strand on the wrong year's term
      this.persist()
    },

    setTerm(termId) {
      const term = this.allTerms.find((t) => t.id === termId)
      if (!term) return
      this.selectedTermId = term.id
      this.selectedYearId = term.yearId // year always follows the term
      this.persist()
    },

    resetToCurrent() {
      this.selectedYearId = this.currentYearId
      this.selectedTermId = this.defaultTermId(this.currentAcademicYear)
      this.persist()
    },

    persist() {
      const key = storageKey()
      if (!key) return
      localStorage.setItem(
        key,
        JSON.stringify({ yearId: this.selectedYearId, termId: this.selectedTermId })
      )
    },

    clear() {
      this.$reset() // memory only; saved selection stays under its namespaced key
    },
  },
})