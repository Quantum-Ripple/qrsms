<template>
  <aside
    class="qr-sidebar"
    :id="mobile ? 'students-sidebar-mobile' : 'students-sidebar'"
    :class="{
      'qr-sidebar--mobile': mobile,
      'qr-sidebar--desktop': !mobile,
      'qr-sidebar--collapsed': collapsed && !mobile,
    }"
  >
    <!-- BRAND HEADER -->
    <div class="qr-brand">
      <div class="qr-brand-content">
        <div class="qr-logo">
          <svg viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <path
              d="M45 26A18 18 0 1 0 12 36"
              stroke="white"
              stroke-width="5.5"
              stroke-linecap="round"
            />
            <path
              d="M7 43C18 33 27 35 36 40C42 44 46 45 51 42"
              stroke="#f97316"
              stroke-width="5"
              stroke-linecap="round"
            />
            <path
              d="M12 48C23 41 32 43 39 47"
              stroke="#bfdbfe"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <div class="qr-brand-text">
          <strong>Quantum Ripple</strong>
          <span>School System</span>
        </div>
      </div>

      <button
        v-if="mobile"
        type="button"
        class="qr-close"
        aria-label="Close menu"
        @click="$emit('close')"
      >
        &times;
      </button>
    </div>

    <!-- SCHOOL -->
    <div class="qr-school-section">
      <div class="qr-school-card">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="qr-school-icon"
        >
          <path d="M3 21h18M5 21V9l7-5 7 5v12" />
          <path d="M9 21v-6h6v6M9 10h.01M15 10h.01" />
          <path d="M2 11l10-8 10 8" />
        </svg>

        <span class="qr-school-name">
          {{ title || 'Your School' }}
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="qr-school-chevron"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>

    <!-- MAIN NAVIGATION -->
    <nav class="qr-navigation" aria-label="Student navigation">
      <div
        v-for="item in items"
        :key="item.label"
        class="qr-nav-group"
      >
        <!-- EXPANDABLE MENU -->
        <button
          v-if="item.children?.length"
          type="button"
          class="qr-nav-item"
          :class="{ 'qr-nav-active': isGroupActive(item) }"
          :aria-label="collapsed ? item.label : undefined"
          :title="collapsed ? item.label : undefined"
          :aria-expanded="openSubmenu === item.label"
          @click="handleGroupClick(item.label)"
        >
          <svg
            class="qr-nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              v-for="(path, index) in getIcon(item.label)"
              :key="index"
              :d="path"
            />
          </svg>

          <span class="qr-nav-label">{{ item.label }}</span>

          <svg
            class="qr-nav-chevron"
            :class="{ 'qr-rotate': openSubmenu === item.label }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>

        <!-- STANDARD MENU -->
        <router-link
          v-else
          :to="item.route"
          class="qr-nav-item"
          :class="{ 'qr-nav-active': isActive(item.route) }"
          :aria-label="collapsed ? item.label : undefined"
          :title="collapsed ? item.label : undefined"
          :aria-current="isActive(item.route) ? 'page' : undefined"
          @click="$emit('navigate')"
        >
          <svg
            class="qr-nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              v-for="(path, index) in getIcon(item.label)"
              :key="index"
              :d="path"
            />
          </svg>

          <span class="qr-nav-label">{{ item.label }}</span>
        </router-link>

        <!-- CHILD ROUTES -->
        <div
          v-if="item.children?.length && openSubmenu === item.label"
          class="qr-submenu"
        >
          <router-link
            v-for="sub in item.children"
            :key="sub.label"
            :to="sub.route"
            class="qr-submenu-item"
            :class="{ 'qr-submenu-active': isActive(sub.route) }"
            :aria-current="isActive(sub.route) ? 'page' : undefined"
            :title="collapsed ? item.label : undefined"
            @click="$emit('navigate')"
          >
            {{ sub.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- FOOTER -->
    <div class="qr-sidebar-footer">
      <div class="qr-footer-divider"></div>

      <button
        type="button"
        class="qr-logout"
        @click="$emit('logout')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        </svg>

        <span>Logout</span>
      </button>

      <!-- Decorative brand waves -->
      <svg
        class="qr-footer-waves"
        viewBox="0 0 280 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 12C70 29 125 70 205 57C238 51 260 43 280 35V70H0Z"
          fill="#f97316"
        />
        <path
          d="M0 63C83 81 179 65 280 22V70H0Z"
          fill="#2563eb"
        />
        <path
          d="M0 69C95 73 190 65 280 52V70H0Z"
          fill="#1d4ed8"
        />
      </svg>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  mobile: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['navigate', 'logout', 'close', 'expand'])

const route = useRoute()
const openSubmenu = ref(null)

function isActive(target) {
  if (!target?.name) return false

  return route.matched.some(
    (record) => record.name === target.name
  )
}

function isGroupActive(item) {
  return item.children?.some(
    (child) => isActive(child.route)
  ) ?? false
}

function toggleSubmenu(label) {
  openSubmenu.value =
    openSubmenu.value === label ? null : label
}

function handleGroupClick(label) {
  if (props.collapsed && !props.mobile) {
    openSubmenu.value = label
    emit('expand')
    return
  }

  toggleSubmenu(label)
}

function syncActiveGroup() {
  const activeGroup = props.items.find(isGroupActive)

  if (activeGroup) {
    openSubmenu.value = activeGroup.label
  }
}

watch(
  () => [route.fullPath, props.items],
  syncActiveGroup,
  { immediate: true }
)

/*
  SVG icons.
  No external icon package required.
*/
const icons = {
  "Dashboard": [
    "m3 10 9-7 9 7",
    "M5 9v12h14V9",
    "M9 21v-7h6v7"
  ],
  "Assignments": [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z",
    "M14 2v6h6M8 13h8M8 17h6"
  ],
  "Notes": [
    "M4 3h6a2 2 0 0 1 2 2v16a3 3 0 0 0-3-3H3V3h1Z",
    "M20 3h-6a2 2 0 0 0-2 2v16a3 3 0 0 1 3-3h6V3h-1Z"
  ],
  "Announcements": [
    "M3 10v4h4l12 5V5L7 10H3Z",
    "M7 14l2 7h3l-2-6M22 9v6"
  ],
  "Settings": [
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M19 12a7 7 0 0 0-.2-1.8L21 8l-3-3-2.2 2.2A7 7 0 0 0 14 7V4h-4v3a7 7 0 0 0-1.8.2L6 5 3 8l2.2 2.2A7 7 0 0 0 5 12c0 .6.1 1.2.2 1.8L3 16l3 3 2.2-2.2A7 7 0 0 0 10 17v3h4v-3a7 7 0 0 0 1.8-.2L18 19l3-3-2.2-2.2c.1-.6.2-1.2.2-1.8Z"
  ],
  "Virtual Labs": [
    "M9 3h6M10 3v6l-6 10a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3",
    "M7 15h10M10 18h.01M14 17h.01"
  ]
}

function getIcon(label) {
  return icons[label] || icons.Dashboard
}
</script>

<style scoped>
/* MAIN SIDEBAR */

.qr-sidebar {
  width: 280px;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
  color: #0f172a;
  transition: width 0.2s ease, min-width 0.2s ease;
}

.qr-sidebar--desktop {
  display: none;
}

@media (min-width: 48rem) {
  .qr-sidebar--desktop {
    display: flex;
  }
}

.qr-sidebar--mobile {
  width: min(280px, 85vw);
  min-width: 0;
  transition: none;
}

.qr-sidebar--collapsed {
  width: 76px;
  min-width: 76px;
}

.qr-sidebar--collapsed .qr-brand {
  justify-content: center;
  padding: 0 12px;
}

.qr-sidebar--collapsed .qr-brand-text,
.qr-sidebar--collapsed .qr-school-name,
.qr-sidebar--collapsed .qr-school-chevron,
.qr-sidebar--collapsed .qr-nav-label,
.qr-sidebar--collapsed .qr-nav-chevron,
.qr-sidebar--collapsed .qr-submenu,
.qr-sidebar--collapsed .qr-logout span {
  display: none;
}

.qr-sidebar--collapsed .qr-school-section {
  padding-right: 10px;
  padding-left: 10px;
}

.qr-sidebar--collapsed .qr-school-card {
  justify-content: center;
  gap: 0;
  padding: 0;
}

.qr-sidebar--collapsed .qr-navigation {
  padding-right: 8px;
  padding-left: 8px;
}

.qr-sidebar--collapsed .qr-nav-item {
  justify-content: center;
  gap: 0;
  padding: 0;
}

.qr-sidebar--collapsed .qr-sidebar-footer {
  padding-right: 10px;
  padding-left: 10px;
}

.qr-sidebar--collapsed .qr-logout {
  width: 100%;
  justify-content: center;
  gap: 0;
  padding: 0;
}

/* BRAND HEADER */

.qr-brand {
  height: 86px;
  min-height: 86px;
  background: linear-gradient(
    115deg,
    #0754b5 0%,
    #0c4eaa 65%,
    #164c9e 100%
  );
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 38px;
}

.qr-brand-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qr-logo {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.qr-logo svg {
  width: 100%;
  height: 100%;
}

.qr-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  white-space: nowrap;
}

.qr-brand-text strong {
  color: white;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.qr-brand-text span {
  color: #eff6ff;
  font-size: 14px;
  margin-top: 2px;
}

.qr-close {
  color: white;
  font-size: 26px;
  line-height: 1;
}

/* SCHOOL SECTION */

.qr-school-section {
  padding: 15px 14px 20px;
  flex-shrink: 0;
}

.qr-school-card {
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 15px;
  border: 1px solid #d6dfeb;
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.qr-school-icon {
  width: 24px;
  height: 24px;
  color: #142746;
  flex-shrink: 0;
}

.qr-school-name {
  font-size: 15px;
  font-weight: 650;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qr-school-chevron {
  width: 17px;
  height: 17px;
  color: #243852;
  flex-shrink: 0;
}

/* NAVIGATION */

.qr-navigation {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 14px 16px;
  scrollbar-width: thin;
  scrollbar-color: #d6deea transparent;
}

.qr-navigation::-webkit-scrollbar {
  width: 4px;
}

.qr-navigation::-webkit-scrollbar-thumb {
  background: #d6deea;
  border-radius: 10px;
}

.qr-nav-group {
  margin-bottom: 2px;
}

.qr-nav-item {
  width: 100%;
  min-height: 44px;
  padding: 0 18px 0 23px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-radius: 9px;
  background: transparent;
  color: #142746;
  text-align: left;
  text-decoration: none;
  font-size: 15px;
  font-weight: 450;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.qr-nav-item:hover:not(.qr-nav-active) {
  background: #f1f5f9;
}

.qr-nav-active {
  background: #1266f1;
  color: #ffffff;
  font-weight: 550;
}

.qr-nav-active:hover {
  background: #075de2;
  color: #ffffff;
}

.qr-nav-icon {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
}

.qr-nav-label {
  flex: 1;
}

.qr-nav-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.qr-rotate {
  transform: rotate(90deg);
}

/* SUBMENUS */

.qr-submenu {
  margin: 5px 0 7px 34px;
  padding-left: 12px;
  border-left: 1px solid #e2e8f0;
}

.qr-submenu-item {
  display: block;
  padding: 10px 12px;
  margin-bottom: 2px;
  font-size: 13px;
  color: #64748b;
  border-radius: 7px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.qr-submenu-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.qr-submenu-active {
  color: #1266f1;
  background: #eff6ff;
  font-weight: 600;
}

/* FOOTER */

.qr-sidebar-footer {
  position: relative;
  min-height: 164px;
  flex-shrink: 0;
  padding: 0 24px;
  background: #ffffff;
  overflow: hidden;
}

.qr-footer-divider {
  height: 1px;
  width: 100%;
  background: #d6dfeb;
  margin-bottom: 18px;
}

.qr-logout {
  position: relative;
  z-index: 2;
  height: 45px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 13px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 450;
  color: #142746;
  cursor: pointer;
  border-radius: 8px;
}

.qr-logout:hover {
  background: #f1f5f9;
}

.qr-logout svg {
  width: 21px;
  height: 21px;
}

.qr-footer-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  pointer-events: none;
}

/* SMALL SCREENS */

@media (max-height: 700px) {
  .qr-sidebar-footer {
    min-height: 100px;
  }

  .qr-footer-waves {
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qr-nav-item,
  .qr-submenu-item,
  .qr-nav-chevron {
    transition: none;
  }
}
</style>
