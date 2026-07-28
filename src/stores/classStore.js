import { defineStore } from "pinia"

export const useClassStore = defineStore("classStore", {
  state: () => ({
    activeClass: null
  }),

  actions: {

    loadInitialClass() {
      const saved = JSON.parse(localStorage.getItem("activeClass"))
      if (saved && typeof saved === "object") {
        this.activeClass = saved
      }
    },

    setClass(cls) {
      this.activeClass = cls && typeof cls === "object" ? { ...cls } : null

      if (this.activeClass) {
        localStorage.setItem("activeClass", JSON.stringify(this.activeClass))
      } else {
        localStorage.removeItem("activeClass")
      }
    },

    clearClass() {
      this.activeClass = null
      localStorage.removeItem("activeClass")
    }

  }
})