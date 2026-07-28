<template>
  <div>

    <div class="grid grid-cols-7 text-xs sm:text-sm text-gray-500 mb-2 px-1">
      <div
        v-for="day in days"
        :key="day"
        class="text-center font-semibold tracking-wide"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">

      <div
        v-for="day in calendarDays"
        :key="day.key"
        @click="day.date && $emit('selectDay', day.date)"
        class="relative min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 transition cursor-pointer flex flex-col"
        :class="[
          day.isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 text-gray-400',
          day.isToday ? 'ring-2 ring-blue-500 z-10' : ''
        ]"
      >

        <div class="flex justify-between items-center mb-1">
          <span class="text-[10px] sm:text-xs font-semibold">
            {{ day.day }}
          </span>

          <span
            v-if="day.isToday"
            class="w-1.5 h-1.5 rounded-full bg-blue-500"
          ></span>
        </div>

        <div class="flex-1 space-y-1 overflow-hidden">

          <div
            v-for="event in day.events.slice(0,2)"
            :key="event.id"
            class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md text-white truncate font-medium"
            :style="{ backgroundColor: event.categoryColor }"
          >
            {{ event.title }}
          </div>

          <div
            v-if="day.events.length > 2"
            class="text-[10px] text-gray-500 font-medium"
          >
            +{{ day.events.length - 2 }} more
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: Number,
  month: Number,
  events: {
    type: Array,
    default: () => []
  }
})

const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const today = new Date()

const eventsByDate = computed(() => {
  const map = {}

  for (const e of props.events) {
    if (!e.date) continue

    if (!map[e.date]) map[e.date] = []
    map[e.date].push(e)
  }

  return map
})

const calendarDays = computed(() => {
  const firstDay = new Date(props.year, props.month, 1)
  const startOffset = firstDay.getDay()
  const startDate = new Date(props.year, props.month, 1 - startOffset)

  const daysArray = []

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)

    const year = d.getFullYear()
    const month = d.getMonth()

    const dateStr =
      `${year}-${String(month + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const isCurrentMonth = month === props.month
    const isToday =
      d.toDateString() === today.toDateString()

    daysArray.push({
      key: dateStr,
      day: d.getDate(),
      date: dateStr,
      isCurrentMonth,
      isToday,
      events: eventsByDate.value[dateStr] || []
    })
  }

  return daysArray
})
</script>