<template>
  <header class="w-full bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="h-16 flex items-center justify-between">
        
        <div class="flex items-center space-x-3">
          <button
            class="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            aria-label="open menu"
            @click="$emit('menu-toggle')"
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span class="text-lg font-semibold" data-testid="app-title">{{ title }}</span>
        </div>

        <div class="relative flex items-center">

            <button
              id="classMenuButton"
              @click="showClassMenu = !showClassMenu"
              class="px-3 py-1 border rounded-md text-sm font-medium hover:bg-gray-100"
            >
              {{ classLabel }} ▾
            </button>

            <div
  v-if="showClassMenu"
  id="classMenu"
  class="absolute right-0 top-10 w-44 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
>
              <button
                v-for="cls in classes"
                :key="cls.class_level + cls.stream"
                @click="selectClass(cls)"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {{ cls.class_level }} {{ cls.stream }}
              </button>
            </div>

          </div>
        
        

        
        <div class="md:hidden">
          <button class="p-2 rounded-md hover:bg-gray-100" @click="$emit('mobile-actions')" aria-label="more">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>

import { ref, onMounted } from "vue"
import { computed } from "vue"
import { useClassStore } from "@/stores/classStore"
import { watch } from "vue"

const classStore = useClassStore()
const classes = ref([])
const activeClass = ref(null)
const showClassMenu = ref(false)

watch(
  () => classStore.activeClass,
  (cls) => {
    activeClass.value = cls
    showClassMenu.value = false  
  },
  { immediate: true }
)

const selectClass = (cls) => {
  classStore.setClass(cls)  
  showClassMenu.value = false
}


const loadClasses = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  classes.value = user.teaching_assignments || []

  const saved = JSON.parse(localStorage.getItem("activeClass"))

  // Verify if the saved class belongs to current teacher
  const isValid = saved && classes.value.some(cls => 
    cls.class_level === saved.class_level && 
    cls.stream === saved.stream &&
    cls.subject === saved.subject
  )

  if (isValid) {
    activeClass.value = saved
    classStore.setClass(saved)
  } else if (classes.value.length) {
    activeClass.value = classes.value[0]
    classStore.setClass(activeClass.value)
  } else {
    activeClass.value = null
    classStore.clearClass()
  }
}

onMounted(() => {
  loadClasses()
  document.addEventListener("click", handleClickOutside)
})

const handleClickOutside = (event) => {
  const menu = document.getElementById("classMenu")
  const button = document.getElementById("classMenuButton")
  if (!menu || !button) return
  if (!menu.contains(event.target) && !button.contains(event.target)) {
    showClassMenu.value = false
  }
}
/*
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})*/


const classLabel = computed(() => {
  if (!activeClass.value) return ""

  const grade = activeClass.value.class_level.replace("Grade ", "G")
  const stream = activeClass.value.stream

  if (window.innerWidth < 768) {
    return `${grade}${stream[0]}`   // mobile → G8N
  }

  return `${activeClass.value.class_level} ${stream}`
})

const props = defineProps({
  title: { type: String, default: 'My App' }
})
</script>