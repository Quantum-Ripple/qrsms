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


        <nav class="hidden md:flex items-center space-x-3">

          
          <router-link :to="{ name: 'PrincipalFeeOverview'}" class="px-3 py-2 rounded-md hover:bg-gray-100" >Finance</router-link>
          <router-link class="px-3 py-2 rounded-md hover:bg-gray-100" :to="{ name: 'PrincipalStudents'}">Students</router-link>
          
          
        <div class="relative">
  <button
    class="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
    aria-label="profile menu"
    @click="showProfileMenu = !showProfileMenu"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  </button>

  <transition name="fade">
    <div
      v-if="showProfileMenu"
      class="absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
    >
      <button
        type="button"
        class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        @click="handleLogout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0H5a2 2 0 00-2 2v10a2 2 0 002 2h8"
          />
        </svg>

        Logout
      </button>
    </div>
  </transition>
</div>
        </nav>


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
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'menu-toggle',
  'mobile-actions',
  'logout'
])

const showProfileMenu = ref(false)

function handleLogout() {
  showProfileMenu.value = false
  emit('logout')
}
</script>

