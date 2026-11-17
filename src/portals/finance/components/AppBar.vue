<template>
  <header class="qr-appbar">
    <!-- LEFT: Menu and greeting -->
    <div class="qr-appbar-left">
      <button
        type="button"
        class="qr-icon-button qr-desktop-sidebar-toggle"
        :aria-label="props.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!props.sidebarCollapsed"
        aria-controls="finance-sidebar"
        :title="props.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="$emit('sidebar-toggle')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="props.sidebarCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'" />
        </svg>
      </button>

      <button
        type="button"
        class="qr-icon-button qr-mobile-menu"
        :aria-label="props.mobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'"
        :aria-expanded="props.mobileSidebarOpen"
        aria-controls="finance-sidebar-mobile"
        @click="emit('menu-toggle')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="qr-greeting">
        <span class="qr-greeting-accent"></span>
        <h1 data-testid="app-title">{{ title }}</h1>
      </div>
    </div>

    <!-- CENTER: Search -->
    <div class="qr-search-wrap">
      <div class="qr-search" role="search">
        <svg class="qr-search-icon" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.9"
          stroke-linecap="round">
          <circle cx="10.8" cy="10.8" r="7.2" />
          <path d="m16 16 5 5" />
        </svg>

        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search fees, payments, invoices..."
          aria-label="Search"
          @keydown.enter="submitSearch"
        />

        <kbd class="qr-search-shortcut">Ctrl + K</kbd>
      </div>
    </div>

    <!-- RIGHT: Academic context and profile -->
    <div class="qr-appbar-right">
      <div class="qr-context-desktop">
        <AcademicContextSelector />
      </div>

      <!-- Mobile academic context -->
      <button
        type="button"
        class="qr-icon-button qr-mobile-context"
        aria-label="Academic context"
        aria-haspopup="dialog"
        :aria-expanded="showMobileContext"
        @click="showMobileContext = !showMobileContext"
      >
        <svg viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      </button>

      <!-- Profile -->
      <div ref="profileRoot" class="qr-profile-root">
        <button
          type="button"
          class="qr-avatar"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          :aria-expanded="showProfileMenu"
          @click="showProfileMenu = !showProfileMenu"
        >
          {{ userInitial }}
        </button>

        <transition name="qr-dropdown">
          <div
            v-if="showProfileMenu"
            class="qr-profile-dropdown"
            role="menu"
          >
            <div class="qr-profile-details">
              <div class="qr-profile-avatar">
                {{ userInitial }}
              </div>

              <div class="qr-profile-info">
                <strong>{{ fullName }}</strong>
                <span>Finance</span>
              </div>
            </div>

            <div class="qr-dropdown-divider"></div>

            <button
              type="button"
              class="qr-logout-action"
              role="menuitem"
              @click="handleLogout"
            >
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5M21 12H9" />
              </svg>

              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Mobile academic selector popover -->
    <transition name="qr-dropdown">
      <div
        v-if="showMobileContext"
        ref="contextRoot"
        class="qr-mobile-context-panel"
        role="dialog"
        aria-label="Academic context"
      >
        <div class="qr-context-heading">
          Academic Context
          <button
            type="button"
            aria-label="Close academic context"
            @click="showMobileContext = false"
          >
            &times;
          </button>
        </div>

        <AcademicContextSelector />
      </div>
    </transition>
  </header>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAcademicContextStore } from '@/stores/academicContextStore'
import AcademicContextSelector from '@/components/AcademicContextSelector.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false,
  },
  mobileSidebarOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'menu-toggle',
  'sidebar-toggle',
  'logout',
])

const auth = useAuthStore()
const academicContext = useAcademicContextStore()
const route = useRoute()

const showProfileMenu = ref(false)
const showMobileContext = ref(false)
const profileRoot = ref(null)
const contextRoot = ref(null)
const searchQuery = ref('')

const fullName = computed(() => {
  const firstName = auth.user?.first_name || ''
  const lastName = auth.user?.last_name || ''

  return `${firstName} ${lastName}`.trim() || 'Finance'
})

const userInitial = computed(() =>
  fullName.value.charAt(0).toUpperCase()
)

/*
  Retain the existing academic-context initialization.
*/
watch(
  () => auth.user?.id,
  (id) => {
    if (id) academicContext.init()
    else academicContext.clear()
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    showProfileMenu.value = false
    showMobileContext.value = false
  }
)

function submitSearch() {
  const query = searchQuery.value.trim()

  if (!query) return

  /*
    The UI is ready for a global search endpoint.

    Once the search API and results route are implemented,
    connect them here.

    For now we intentionally avoid navigating to
    nonexistent routes.
  */
}

function handleGlobalKeydown(event) {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === 'k'
  ) {
    event.preventDefault()

    document.querySelector('.qr-search input')?.focus()
  }

  if (event.key === 'Escape') {
    showProfileMenu.value = false
    showMobileContext.value = false
  }
}

function handleDocumentClick(event) {
  if (
    profileRoot.value &&
    !profileRoot.value.contains(event.target)
  ) {
    showProfileMenu.value = false
  }

  if (
    contextRoot.value &&
    !contextRoot.value.contains(event.target) &&
    !event.target.closest('.qr-mobile-context')
  ) {
    showMobileContext.value = false
  }
}

function handleLogout() {
  showProfileMenu.value = false
  emit('logout')
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('pointerdown', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  document.removeEventListener('pointerdown', handleDocumentClick)
})
</script>

<style scoped>
/* APP BAR */

.qr-appbar {
  position: relative;
  z-index: 50;
  width: 100%;
  height: 82px;
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 30px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
}

/* LEFT */

.qr-appbar-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 1;
}

.qr-greeting {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.qr-greeting-accent {
  width: 5px;
  height: 37px;
  background: #f97316;
  border-radius: 5px;
  flex-shrink: 0;
}

.qr-greeting h1 {
  min-width: 0;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* SEARCH */

.qr-search-wrap {
  flex: 1;
  max-width: 440px;
  min-width: 150px;
  margin-left: auto;
}

.qr-search {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  background: #f8faff;
  border: 1px solid #d4dfed;
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.qr-search:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.09);
}

.qr-search-icon {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
  color: #172d50;
}

.qr-search input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #0f172a;
}

.qr-search input::placeholder {
  color: #64748b;
}

.qr-search-shortcut {
  flex-shrink: 0;
  font-size: 11px;
  padding: 5px 8px;
  background: #eaf0f9;
  border-radius: 6px;
  color: #526581;
  font-family: inherit;
}

/* RIGHT */

.qr-appbar-right {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
}

.qr-context-desktop {
  display: flex;
  align-items: center;
  padding-left: 22px;
  border-left: 1px solid #d7dfeb;
}

/* PROFILE */

.qr-profile-root {
  position: relative;
  padding-left: 20px;
  border-left: 1px solid #d7dfeb;
}

.qr-avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  background: #0754b5;
  font-weight: 600;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.15s;
}

.qr-avatar:hover {
  background: #1d6de3;
}

.qr-avatar:focus-visible {
  outline: 3px solid #bfdbfe;
  outline-offset: 3px;
}

/* DROPDOWN */

.qr-profile-dropdown {
  position: absolute;
  top: calc(100% + 17px);
  right: 0;
  width: 240px;
  padding: 10px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.13);
  z-index: 100;
}

.qr-profile-details {
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 10px 8px;
}

.qr-profile-avatar {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  border-radius: 50%;
  color: #ffffff;
  background: #0754b5;
  font-size: 14px;
  font-weight: 700;
}

.qr-profile-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.qr-profile-info strong {
  font-size: 13px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qr-profile-info span {
  color: #64748b;
  font-size: 12px;
  margin-top: 2px;
}

.qr-dropdown-divider {
  height: 1px;
  background: #edf1f6;
  margin: 5px 0;
}

.qr-logout-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #334155;
  font-size: 13px;
  text-align: left;
}

.qr-logout-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.qr-logout-action svg {
  width: 18px;
  height: 18px;
}

/* MOBILE BUTTONS */

.qr-icon-button {
  display: none;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #1e293b;
  border-radius: 8px;
  cursor: pointer;
}

.qr-desktop-sidebar-toggle {
  display: flex;
  flex-shrink: 0;
}

.qr-icon-button:hover {
  background: #f1f5f9;
}

.qr-icon-button svg {
  width: 21px;
  height: 21px;
}

.qr-mobile-context-panel {
  display: none;
}

/* TRANSITIONS */

.qr-dropdown-enter-active,
.qr-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.qr-dropdown-enter-from,
.qr-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* RESPONSIVE */

@media (max-width: 1250px) {
  .qr-appbar {
    gap: 15px;
    padding: 0 20px;
  }

  .qr-search-wrap {
    max-width: 300px;
  }

  .qr-appbar-right {
    gap: 12px;
  }

  .qr-context-desktop {
    padding-left: 12px;
  }
}

@media (max-width: 1100px) {
  .qr-search-shortcut {
    display: none;
  }

  .qr-search-wrap {
    max-width: 230px;
  }

  .qr-greeting h1 {
    font-size: 17px;
  }
}

@media (max-width: 950px) {
  .qr-search-wrap {
    display: none;
  }

  .qr-context-desktop {
    border-left: none;
    padding-left: 0;
  }
}

@media (width < 48rem) {
  .qr-appbar {
    height: 66px;
    min-height: 66px;
    padding: 0 14px;
    gap: 10px;
  }

  .qr-appbar-left {
    gap: 10px;
    flex: 1;
  }

  .qr-desktop-sidebar-toggle {
    display: none;
  }

  .qr-mobile-menu,
  .qr-mobile-context {
    display: flex;
  }

  .qr-greeting {
    gap: 9px;
    flex: 1;
    min-width: 0;
  }

  .qr-greeting-accent {
    height: 28px;
    width: 4px;
  }

  .qr-greeting h1 {
    font-size: 15px;
    letter-spacing: -0.3px;
  }

  .qr-context-desktop {
    display: none;
  }

  .qr-appbar-right {
    gap: 8px;
  }

  .qr-profile-root {
    border-left: none;
    padding-left: 0;
  }

  .qr-avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .qr-mobile-context-panel {
    display: block;
    position: absolute;
    top: calc(100% + 6px);
    right: 12px;
    width: min(340px, calc(100vw - 24px));
    background: white;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
    z-index: 90;
  }

  .qr-context-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 13px;
    font-weight: 650;
  }

  .qr-context-heading button {
    border: none;
    background: transparent;
    font-size: 24px;
    color: #64748b;
    cursor: pointer;
  }
}

@media (max-width: 360px) {
  .qr-greeting h1 {
    font-size: 13px;
  }

  .qr-appbar {
    padding: 0 10px;
  }
}
</style>
