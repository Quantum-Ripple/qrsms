import { defineStore } from "pinia"

export const useClassStore = defineStore("classStore", {
  state: () => ({
    activeClass: null
  }),

  actions: {

    loadInitialClass() {
      const saved = JSON.parse(localStorage.getItem("activeClass"))
      if (saved) {
        this.activeClass = saved
      }
    },

    setClass(cls) {
      this.activeClass = cls
      localStorage.setItem("activeClass", JSON.stringify(cls))
    },

    clearClass() {
      this.activeClass = null
      localStorage.removeItem("activeClass")
    }

  }
})