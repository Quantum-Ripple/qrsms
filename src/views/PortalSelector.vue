
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const selectedPortal = ref(null)

const portals = [
  { name: 'Student Portal', role: 'student', icon: '👤' },
  { name: 'Parent Portal', role: 'parent', icon: '👥' },
  { name: 'Teacher Portal', role: 'teacher', icon: '📝' },
  { name: 'Principal Portal', role: 'principal', icon: '🔑' },
  { name: 'Finance Portal', role: 'finance', icon: '💳' },
]

const selectPortal = (portal) => {
  selectedPortal.value = portal
  isOpen.value = false
  
  setTimeout(() => {
    router.push({ name: 'Login', query: { role: portal.role } })
  }, 400)
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-start items-center bg-[#052e16] px-4 pt-16 sm:pt-24 selection:bg-emerald-500/30 overflow-x-hidden">
    
    <div class="mb-8 text-center animate-ripple-in">
      <div class="relative group inline-block">
        <img 
          src="../assets/logo.jpg" 
          alt="Quantum Ripple Logo" 
          class="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 rounded-xl shadow-2xl border border-emerald-500/20 group-hover:border-emerald-400 transition-colors duration-500"
        />
        <div class="absolute inset-0 bg-emerald-500/20 blur-3xl -z-10 rounded-full"></div>
      </div>
      
      <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-widest uppercase mt-4">
        Quantum <span class="text-emerald-400">Ripple</span>
      </h1>
      <p class="text-emerald-500/70 text-[10px] sm:text-xs tracking-[0.3em] uppercase mt-2 font-medium">
        The Wave of Innovation
      </p>
    </div>

    <div class="relative w-full max-w-xs sm:max-w-sm">
      <button 
        @click="isOpen = !isOpen"
        class="quantum-btn w-full flex items-center justify-between px-6 py-4 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl text-white backdrop-blur-md hover:bg-emerald-900/50 transition-all duration-300"
      >
        <span class="font-light tracking-wide text-sm sm:text-base">
          {{ selectedPortal ? selectedPortal.name : 'Select Access Portal' }}
        </span>
        <svg 
          class="w-5 h-5 text-emerald-400 transition-transform duration-500"
          :class="{ 'rotate-180': isOpen }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <transition name="quantum-drop">
        <div v-if="isOpen" class="absolute z-20 w-full mt-3 bg-[#064e3b] border border-emerald-500/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div class="p-1.5">
            <button
              v-for="portal in portals"
              :key="portal.role"
              @click="selectPortal(portal)"
              class="w-full px-4 py-3 text-left flex items-center gap-4 rounded-xl hover:bg-emerald-500/10 text-emerald-100/80 hover:text-white transition-all group"
            >
              <span class="text-lg opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">{{ portal.icon }}</span>
              <span class="text-sm font-medium tracking-wide">{{ portal.name }}</span>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div class="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
  </div>
</template>

<style>

html, body {
  background-color: #052e16;
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>

<style scoped>
@keyframes rippleIn {
  0% { opacity: 0; transform: translateY(10px); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}

.animate-ripple-in {
  animation: rippleIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.quantum-drop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.quantum-drop-leave-active {
  transition: all 0.2s ease-in;
}
.quantum-drop-enter-from,
.quantum-drop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.quantum-btn {
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  animation: pulse-border 3s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.1); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
</style>