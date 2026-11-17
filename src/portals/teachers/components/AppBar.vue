<template>
  <header class="qr-appbar">
    <!-- LEFT: Menu and greeting -->
    <div class="qr-appbar-left">
      <button
        type="button"
        class="qr-icon-button qr-desktop-sidebar-toggle"
        :aria-label="props.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!props.sidebarCollapsed"
        aria-controls="teachers-sidebar"
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
        aria-controls="teachers-sidebar-mobile"
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
          placeholder="Search students, assignments, results..."
          aria-label="Search"
          @keydown.enter="submitSearch"
        />

        <kbd class="qr-search-shortcut">Ctrl + K</kbd>
      </div>
    </div>

    <!-- RIGHT: Teaching class and profile -->
    <div class="qr-appbar-right">
      <div class="qr-context-desktop">
        <button
          type="button"
          class="qr-class-trigger qr-class-desktop"
          aria-label="Select class"
          aria-haspopup="dialog"
          aria-controls="teachers-class-panel"
          :aria-expanded="showClassMenu"
          @click="showClassMenu = !showClassMenu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="m2 10 10-6 10 6-10 6-10-6ZM6 13v5c3 3 9 3 12 0v-5M22 10v6" />
          </svg>
          <span class="qr-class-current">
            <strong>{{ classLabel }}</strong>
            <span v-if="activeClass?.subject">{{ activeClass.subject }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        class="qr-icon-button qr-mobile-context qr-class-trigger"
        :aria-label="'Select class: ' + classLabel"
        :title="classLabel"
        aria-haspopup="dialog"
        aria-controls="teachers-class-panel"
        :aria-expanded="showClassMenu"
        @click="showClassMenu = !showClassMenu"
      >
        <span class="qr-class-compact">{{ compactClassLabel }}</span>
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
                <span>Teacher</span>
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

    <!-- Teaching class and subject selector -->
    <transition name="qr-dropdown">
      <div
        v-if="showClassMenu"
        id="teachers-class-panel"
        ref="contextRoot"
        class="qr-class-panel"
        role="dialog"
        aria-label="Teaching class and subject"
      >
        <div class="qr-context-heading">
          Class &amp; Subject
          <button
            type="button"
            aria-label="Close class selector"
            @click="showClassMenu = false"
          >
            &times;
          </button>
        </div>

        <div v-if="classes.length" class="qr-class-options">
          <button
            v-for="(cls, index) in classes"
            :key="index"
            type="button"
            class="qr-class-option"
            :class="{ 'qr-class-option-active': isSelectedClass(cls) }"
            :aria-pressed="isSelectedClass(cls)"
            @click="selectClass(cls)"
          >
            <strong>{{ cls.class_level_name || cls.class_level }} {{ cls.stream_name || cls.stream }}</strong>
            <span v-if="cls.subject">{{ cls.subject }}</span>
          </button>
        </div>
        <p v-else class="qr-class-empty">No classes assigned.</p>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useClassStore } from '@/stores/classStore'

const props = defineProps({
  title: { type: String, default: '' },
  sidebarCollapsed: { type: Boolean, default: false },
  mobileSidebarOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['menu-toggle', 'sidebar-toggle', 'logout'])
const auth = useAuthStore()
const classStore = useClassStore()
const route = useRoute()

const showProfileMenu = ref(false)
const showClassMenu = ref(false)
const profileRoot = ref(null)
const contextRoot = ref(null)
const searchQuery = ref('')
const classes = computed(() => auth.user?.teaching_assignments || [])
const activeClass = computed(() => classStore.activeClass)

const fullName = computed(() => {
  const firstName = auth.user?.first_name || ''
  const lastName = auth.user?.last_name || ''
  return (firstName + ' ' + lastName).trim() || auth.user?.username || 'Teacher'
})
const userInitial = computed(() => fullName.value.charAt(0).toUpperCase())

const classLabel = computed(() => {
  if (!activeClass.value) return 'Select class'
  const grade = activeClass.value.class_level_name || activeClass.value.class_level || ''
  const stream = activeClass.value.stream_name || activeClass.value.stream || ''
  return (grade + ' ' + stream).trim()
})

const compactClassLabel = computed(() => {
  if (!activeClass.value) return 'Class'
  const grade = activeClass.value.class_level_name || activeClass.value.class_level || ''
  const stream = activeClass.value.stream_name || activeClass.value.stream || ''
  return String(grade).replace('Grade ', 'G') + String(stream).charAt(0)
})

function isSameClass(first, second) {
  if (!first || !second) return false
  if (first.class_instance && second.class_instance) {
    return String(first.class_instance) === String(second.class_instance)
  }
  return first.class_level === second.class_level && first.stream === second.stream
}

function isSelectedClass(cls) {
  return isSameClass(activeClass.value, cls) && activeClass.value?.subject === cls.subject
}

function selectClass(cls) {
  classStore.setClass(cls)
  showClassMenu.value = false
}

function loadClasses() {
  const saved = classStore.activeClass
  const isValid = saved && classes.value.some(cls => isSameClass(saved, cls))
  if (isValid) {
    classStore.setClass(saved)
  } else if (classes.value.length) {
    classStore.setClass(classes.value[0])
  } else {
    classStore.clearClass()
  }
}

watch(() => classStore.activeClass, () => { showClassMenu.value = false })
watch(() => auth.user?.teaching_assignments, loadClasses)
watch(() => route.fullPath, () => {
  showProfileMenu.value = false
  showClassMenu.value = false
})
watch(() => props.mobileSidebarOpen, (open) => {
  if (open) {
    showProfileMenu.value = false
    showClassMenu.value = false
  }
})

function submitSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
  // Connect the global search endpoint and results route when available.
}

function handleGlobalKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    document.querySelector('.qr-search input')?.focus()
  }
  if (event.key === 'Escape') {
    showProfileMenu.value = false
    showClassMenu.value = false
  }
}

function handleDocumentClick(event) {
  if (profileRoot.value && !profileRoot.value.contains(event.target)) {
    showProfileMenu.value = false
  }
  if (contextRoot.value && !contextRoot.value.contains(event.target) &&
    !event.target.closest('.qr-class-trigger')) {
    showClassMenu.value = false
  }
}

function handleLogout() {
  showProfileMenu.value = false
  showClassMenu.value = false
  emit('logout')
}

onMounted(() => {
  loadClasses()
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

.qr-class-desktop {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  max-width: 240px;
  padding: 0 12px;
  border: 1px solid #d4dfed;
  border-radius: 10px;
  background: #f8faff;
  color: #172d50;
  text-align: left;
  cursor: pointer;
}

.qr-class-desktop:hover {
  border-color: #3b82f6;
}

.qr-class-trigger:focus-visible,
.qr-class-option:focus-visible {
  outline: 3px solid #bfdbfe;
  outline-offset: 2px;
}

.qr-class-desktop svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.qr-class-current {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.qr-class-current strong,
.qr-class-current span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qr-class-current strong {
  font-size: 13px;
  font-weight: 600;
}

.qr-class-current span {
  color: #64748b;
  font-size: 11px;
}

.qr-class-compact {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qr-class-panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 12px;
  width: min(340px, calc(100vw - 24px));
  background: #ffffff;
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

.qr-class-options {
  max-height: min(280px, calc(100dvh - 160px));
  overflow-y: auto;
  overscroll-behavior: contain;
}

.qr-class-option {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #142746;
  text-align: left;
  cursor: pointer;
}

.qr-class-option strong {
  font-size: 13px;
  font-weight: 600;
}

.qr-class-option span,
.qr-class-empty {
  font-size: 12px;
  color: #64748b;
}

.qr-class-option:hover {
  background: #f1f5f9;
}

.qr-class-option-active,
.qr-class-option-active:hover {
  background: #eff6ff;
  color: #1266f1;
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
