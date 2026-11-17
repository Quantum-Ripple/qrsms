<template>
  <nav
    class="qr-bottom-bar"
    aria-label="Finance mobile navigation"
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
    label: 'Home',
    route: { name: 'FinanceDashboard' },
    paths: [
      'm3 10 9-7 9 7',
      'M5 9v12h14V9',
      'M9 21v-7h6v7',
    ],
  },
  {
    label: 'Payments',
    route: { name: 'FinancePayments' },
    paths: [
      'M3 10h18M7 15h2m2 0h2',
      'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
    ],
  },
  {
    label: 'Invoices',
    route: { name: 'FinanceInvoices' },
    paths: [
      'M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z',
      'M9 8h6M9 12h6',
    ],
  },
  {
    label: 'Transport',
    route: { name: 'TransportBilling' },
    paths: [
      'M5 17h14M6 17v2h2v-2m8 0v2h2v-2',
      'M5 17l1-7h12l1 7M8 10l1.5-4h5L16 10',
      'M8 14h.01M16 14h.01',
    ],
  },
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
