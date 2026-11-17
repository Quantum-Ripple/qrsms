<template>
  <nav
    class="qr-bottom-bar"
    aria-label="Parent mobile navigation"
  >
    <div class="qr-bottom-inner">
      <router-link
        v-for="item in navigation"
        :key="item.label"
        :to="item.route"
        class="qr-bottom-item"
        :class="{ 'qr-bottom-active': isActive(item) }"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <span
          v-if="isActive(item)"
          class="qr-active-indicator"
        ></span>

        <svg
          class="qr-bottom-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            v-for="(path, index) in item.paths"
            :key="index"
            :d="path"
          />
        </svg>

        <span class="qr-bottom-label">
          {{ item.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navigation = [
  {
    "label": "Home",
    "route": {
      "name": "ParentDashboard"
    },
    "paths": [
      "m3 10 9-7 9 7",
      "M5 9v12h14V9",
      "M9 21v-7h6v7"
    ]
  },
  {
    "label": "Fees",
    "route": {
      "name": "ParentFeeSummary"
    },
    "paths": [
      "M12 2C7 2 3 4 3 7s4 5 9 5 9-2 9-5-4-5-9-5Z",
      "M3 7v5c0 3 4 5 9 5s9-2 9-5V7",
      "M3 12v5c0 3 4 5 9 5s9-2 9-5v-5"
    ]
  },
  {
    "label": "Assessments",
    "route": {
      "name": "ParentAssessment"
    },
    "paths": [
      "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2",
      "M10 3h4a1 1 0 0 1 1 1v2H9V4a1 1 0 0 1 1-1Z",
      "M9 13h6M9 17h4"
    ]
  },
  {
    "label": "Inbox",
    "route": {
      "name": "ParentAnnouncements"
    },
    "paths": [
      "M3 10v4h4l12 5V5L7 10H3Z",
      "M7 14l2 7h3l-2-6M22 9v6"
    ]
  }
]

function isActive(item) {
  return route.matched.some(
    (record) => record.name === item.route.name
  )
}
</script>

<style scoped>
.qr-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;

  display: none;

  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid #e2e8f0;

  padding-bottom: env(safe-area-inset-bottom, 0px);

  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.qr-bottom-inner {
  display: flex;
  align-items: stretch;
  justify-content: space-around;

  height: 64px;
  padding: 0 8px;
}

.qr-bottom-item {
  position: relative;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;

  min-width: 0;
  min-height: 44px;

  text-decoration: none;
  color: #64748b;

  transition: color 0.15s ease;
}

.qr-bottom-item:hover {
  color: #1e293b;
}

.qr-bottom-active {
  color: #2563eb;
}

.qr-active-indicator {
  position: absolute;
  top: 0;

  width: 27px;
  height: 3px;

  background: #3b82f6;
  border-radius: 0 0 4px 4px;
}

.qr-bottom-icon {
  width: 22px;
  height: 22px;
}

.qr-bottom-label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.qr-bottom-active .qr-bottom-label {
  font-weight: 650;
}

.qr-bottom-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -4px;
  border-radius: 8px;
}

@media (width < 48rem) {
  .qr-bottom-bar {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qr-bottom-item {
    transition: none;
  }
}
</style>
