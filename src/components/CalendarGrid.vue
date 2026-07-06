<script setup lang="ts">
interface CalendarDay {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  meetings: Array<{ id: number; title: string; hostId: number }>
}

const props = defineProps<{
  days: CalendarDay[]
  selectedDate: Date | null
  today: Date
  authUserId?: number | null
  meetingDotClass: (m: { hostId: number }) => string
}>()

const emit = defineEmits<{
  selectDay: [day: CalendarDay]
}>()

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function isToday(d: Date) {
  return d.toDateString() === props.today.toDateString()
}
function isSelected(d: Date) {
  return props.selectedDate?.toDateString() === d.toDateString()
}
</script>

<template>
  <div class="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
    <div
      v-for="(day, idx) in days"
      :key="idx"
      @click="emit('selectDay', day)"
      class="border-r border-b border-gray-100 p-1.5 cursor-pointer hover:bg-blue-50/30 transition-colors relative"
      :class="[
        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50',
        isToday(day.date) ? 'bg-blue-50/60' : '',
        isSelected(day.date) ? 'ring-2 ring-inset ring-blue-400' : '',
      ]"
    >
      <span
        class="inline-flex items-center justify-center w-7 h-7 text-sm rounded-full"
        :class="[
          isToday(day.date) ? 'bg-blue-600 text-white font-bold' : 'text-gray-700',
          !day.isCurrentMonth ? 'text-gray-300' : '',
        ]"
      >
        {{ day.dayNumber }}
      </span>
      <div v-if="day.meetings.length" class="mt-0.5 space-y-0.5">
        <div
          v-for="m in day.meetings.slice(0, 3)"
          :key="m.id"
          class="h-1.5 rounded-full"
          :class="meetingDotClass(m)"
          :title="m.title"
        />
        <div v-if="day.meetings.length > 3" class="text-[10px] text-gray-400 pl-0.5">
          +{{ day.meetings.length - 3 }}
        </div>
      </div>
    </div>
  </div>
</template>
