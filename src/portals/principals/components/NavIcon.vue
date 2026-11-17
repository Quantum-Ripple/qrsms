
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0"
  >
    <template v-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </template>

    <template v-else-if="name === 'users' || name === 'parents'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </template>

    <template v-else-if="name === 'staff'">
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2M3 21h18" />
    </template>

    <template v-else-if="name === 'finance'">
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </template>

    <template v-else-if="name === 'attendance'">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18m-12 5 2 2 4-4" />
    </template>

    <template v-else-if="name === 'academics'">
      <path d="m2 10 10-6 10 6-10 6-10-6Z" />
      <path d="M6 13v5c3 3 9 3 12 0v-5M22 10v6" />
    </template>

    <template v-else-if="name === 'reports'">
      <path d="M4 20V11M10 20V4M16 20v-8M22 20V7" />
    </template>

    <template v-else-if="name === 'promotions'">
      <path d="m3 17 6-6 4 4 8-9M15 6h6v6" />
    </template>

    <template v-else-if="name === 'communications'">
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 1 1 21 11.5Z" />
    </template>

    <template v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </template>

    <template v-else-if="name === 'settings' || name === 'configurations'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.9 1.9-.06-.06A1.7 1.7 0 0 0 16 18.4a1.7 1.7 0 0 0-1 .94V21h-2.7v-.09a1.7 1.7 0 0 0-1-1.57 1.7 1.7 0 0 0-1.84.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.9 16a1.7 1.7 0 0 0-.94-1H5.5v-2.7h.09a1.7 1.7 0 0 0 1.57-1 1.7 1.7 0 0 0-.34-1.84l-.06-.06 1.9-1.9.06.06A1.7 1.7 0 0 0 10.5 7a1.7 1.7 0 0 0 1-.94V4.5h2.7v.09a1.7 1.7 0 0 0 1 1.57 1.7 1.7 0 0 0 1.84-.34l.06-.06 1.9 1.9-.06.06A1.7 1.7 0 0 0 18.4 9.5a1.7 1.7 0 0 0 .94 1H21v2.7h-.09A1.7 1.7 0 0 0 19.4 15Z"
        transform="translate(-.25 -.25) scale(.96)"
      />
    </template>

    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </template>

    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>

    <template v-else-if="name === 'close'">
      <path d="M5 5l14 14M19 5 5 19" />
    </template>

    <template v-else-if="name === 'chevron'">
      <path d="m9 18 6-6-6-6" />
    </template>

    <template v-else-if="name === 'more'">
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </template>

    <template v-else>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4m0 4h.01" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>
