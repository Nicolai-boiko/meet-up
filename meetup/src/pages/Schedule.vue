<template>
  <div class="flex h-full -mx-6 -my-6 bg-white overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-72 border-r border-gray-200 flex flex-col bg-gray-50 shrink-0">
      <!-- Search -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Поиск</h3>
        <input
          v-model="search"
          type="text"
          placeholder="Название встречи..."
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      <!-- Users filter -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Участники</h3>
        <div class="relative">
          <button
            @click="showUserDropdown = !showUserDropdown"
            class="w-full border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between bg-white hover:border-blue-400 transition-colors"
          >
            <span class="truncate">
              {{ selectedUserIds.length ? `Выбрано: ${selectedUserIds.length}` : 'Все пользователи' }}
            </span>
            <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div
            v-if="showUserDropdown"
            class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
          >
            <label
              v-for="user in filterableUsers"
              :key="user.id"
              class="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                :checked="selectedUserIds.includes(user.id)"
                @change="toggleUser(user.id)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div
                v-if="user.avatar"
                class="w-5 h-5 rounded-full overflow-hidden shrink-0"
              >
                <img :src="user.avatar" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              >
                {{ userInitials(user) }}
              </div>
              <span class="truncate">{{ userDisplayName(user) }}</span>
            </label>
            <div v-if="filterableUsers.length === 0" class="px-3 py-2 text-sm text-gray-400">
              Загрузка...
            </div>
          </div>
        </div>
        <button
          v-if="selectedUserIds.length"
          @click="clearUsers"
          class="mt-2 text-xs text-blue-600 hover:underline"
        >
          Сбросить фильтр
        </button>
      </div>

      <!-- Legend -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Обозначения</h3>
        <div class="space-y-1.5 text-xs text-gray-500">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
            Организатор
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
            Участвуете
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-gray-300 shrink-0"></span>
            Ожидает ответа
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
            Другие встречи
          </div>
        </div>
      </div>

      <!-- Selected day meetings -->
      <div v-if="selectedDay" class="flex-1 overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {{ formatDayHeader(selectedDay) }}
          </h3>
          <button @click="selectedDay = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div v-if="selectedDayMeetings.length" class="space-y-2">
          <button
            v-for="m in selectedDayMeetings"
            :key="m.id"
            @click="openDetail(m)"
            class="w-full text-left p-3 rounded-lg border hover:bg-gray-100 transition-colors"
            :class="meetingBorderClass(m)"
          >
            <div class="text-sm font-medium text-gray-800 truncate">{{ m.title }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatTime(m.startTime) }} – {{ formatTime(m.endTime) }}
            </div>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs text-gray-500">{{ m.host?.name || 'Неизвестный' }}</span>
              <span v-if="m.room" class="text-xs text-blue-600">🎥</span>
              <span
                v-if="authUserId && isInvitedForDay(m)"
                class="text-xs bg-amber-100 text-amber-700 px-1 py-0.5 rounded"
              >
                Новое
              </span>
            </div>
          </button>
        </div>
        <div v-else class="text-center text-gray-400 text-sm py-8">
          Нет встреч на этот день
        </div>
      </div>

      <!-- No day selected -->
      <div v-else class="flex-1 flex items-center justify-center text-gray-400 text-sm p-4 text-center">
        Выберите день в календаре, чтобы увидеть встречи
      </div>
    </aside>

    <!-- Main Calendar -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <div class="flex items-center gap-3">
          <button @click="prevMonth" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <h2 class="text-lg font-bold text-gray-800 min-w-40 text-center">
            {{ monthLabel }}
          </h2>
          <button @click="nextMonth" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            @click="goToday"
            class="ml-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Сегодня
          </button>
        </div>
        <button
          @click="openCreate"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Новая встреча
        </button>
      </div>

      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 border-b border-gray-200 shrink-0">
        <div
          v-for="day in dayNames"
          :key="day"
          class="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
        <div
          v-for="(day, idx) in calendarDays"
          :key="idx"
          @click="selectDay(day)"
          class="border-r border-b border-gray-100 p-1.5 cursor-pointer hover:bg-blue-50/30 transition-colors relative"
          :class="[
            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50',
            isToday(day.date) ? 'bg-blue-50/60' : '',
            isSelectedDay(day.date) ? 'ring-2 ring-inset ring-blue-400' : '',
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
          <!-- Meeting dots -->
          <div v-if="day.meetings.length" class="mt-0.5 space-y-0.5">
            <div
              v-for="m in day.meetings.slice(0, 3)"
              :key="m.id"
              class="h-1.5 rounded-full"
              :class="meetingDotClass(m)"
              :title="m.title"
            ></div>
            <div v-if="day.meetings.length > 3" class="text-[10px] text-gray-400 pl-0.5">
              +{{ day.meetings.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-bold text-gray-800">
              {{ editingMeeting ? 'Редактирование' : viewMeeting ? 'Встреча' : 'Новая встреча' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- View mode (detail) -->
          <div v-if="viewMeeting && !editingMeeting" class="p-6 space-y-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ viewMeeting.title }}</h2>
              <p v-if="viewMeeting.description" class="text-gray-600 mt-2 whitespace-pre-wrap">{{ viewMeeting.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="bg-gray-50 rounded-lg p-3">
                <span class="text-gray-500 block text-xs uppercase tracking-wide mb-1">Начало</span>
                <span class="font-semibold text-gray-800">{{ formatDateTime(viewMeeting.startTime) }}</span>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <span class="text-gray-500 block text-xs uppercase tracking-wide mb-1">Конец</span>
                <span class="font-semibold text-gray-800">{{ formatDateTime(viewMeeting.endTime) }}</span>
              </div>
            </div>

            <!-- Room link -->
            <div v-if="viewMeeting.room" class="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span class="text-blue-600 text-xs uppercase tracking-wide">Видео-комната</span>
                <p class="font-semibold text-blue-800">{{ viewMeeting.room.title }}</p>
              </div>
              <router-link
                :to="`/room/${viewMeeting.room.slug}`"
                class="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Войти
              </router-link>
            </div>

            <!-- Participants by status -->
            <div>
              <h4 class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Участники
              </h4>
              <div class="space-y-2">
                <!-- Host -->
                <div
                  v-if="viewMeeting.host"
                  class="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full text-sm"
                >
                  <img v-if="viewMeeting.host?.avatar" :src="viewMeeting.host.avatar" class="w-5 h-5 rounded-full object-cover shrink-0" />
                  <div v-else class="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{{ userInitials(viewMeeting.host!) }}</div>
                  <span class="font-medium text-blue-800">{{ userDisplayName(viewMeeting.host) }}</span>
                  <span class="text-blue-500 text-xs">· Организатор</span>
                </div>

                <!-- Accepted -->
                <template v-if="acceptedParticipants.length">
                  <div class="text-xs text-gray-400 font-medium mt-1">Приняли</div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="p in acceptedParticipants"
                      :key="p.id"
                      class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm"
                    >
                      <img v-if="p.avatar" :src="p.avatar" class="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div v-else class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{{ userInitials(p) }}</div>
                      <span class="text-green-800">{{ userDisplayName(p) }}</span>
                    </div>
                  </div>
                </template>

                <!-- Invited -->
                <template v-if="invitedParticipants.length">
                  <div class="text-xs text-gray-400 font-medium mt-1">Ожидают ответа</div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="p in invitedParticipants"
                      :key="p.id"
                      class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm"
                    >
                      <img v-if="p.avatar" :src="p.avatar" class="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div v-else class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{{ userInitials(p) }}</div>
                      <span class="text-amber-700">{{ userDisplayName(p) }}</span>
                    </div>
                  </div>
                </template>

                <!-- Declined -->
                <template v-if="declinedParticipants.length">
                  <div class="text-xs text-gray-400 font-medium mt-1">Отказались</div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="p in declinedParticipants"
                      :key="p.id"
                      class="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm opacity-60"
                    >
                      <img v-if="p.avatar" :src="p.avatar" class="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div v-else class="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{{ userInitials(p) }}</div>
                      <span class="text-red-700 line-through">{{ userDisplayName(p) }}</span>
                    </div>
                  </div>
                </template>

                <span v-if="!viewMeeting.participants?.length" class="text-sm text-gray-400">Нет участников</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-2 border-t border-gray-200">
              <template v-if="authUserId && isMeetingHost(viewMeeting)">
                <button @click="openEdit(viewMeeting)" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                  Редактировать
                </button>
                <button @click="handleDelete(viewMeeting)" class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors">
                  Удалить
                </button>
              </template>
              <template v-else-if="authUserId && isMeetingParticipant(viewMeeting)">
                <button
                  @click="handleDecline(viewMeeting)"
                  class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors"
                >
                  Отказаться
                </button>
              </template>
              <template v-else-if="authUserId && isMeetingInvited(viewMeeting)">
                <button
                  @click="handleJoin(viewMeeting)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                >
                  Принять
                </button>
                <button
                  @click="handleDecline(viewMeeting)"
                  class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors"
                >
                  Отказаться
                </button>
              </template>
              <template v-else-if="authUserId">
                <button
                  @click="handleJoin(viewMeeting)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                >
                  Я пойду
                </button>
              </template>
            </div>
          </div>

          <!-- Edit/Create form -->
          <form v-else @submit.prevent="handleSave" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Название *</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="Название встречи"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Описание</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="О чём встреча..."
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Начало *</label>
                <input
                  v-model="form.startTime"
                  type="datetime-local"
                  required
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Конец *</label>
                <input
                  v-model="form.endTime"
                  type="datetime-local"
                  required
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <!-- Room linking -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Видео-комната</label>
              <select
                v-model="form.roomId"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option :value="null">Без комнаты</option>
                <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                  {{ room.title }} ({{ room.slug }})
                </option>
              </select>
            </div>

            <!-- Participant selector -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Пригласить участников</label>
              <div class="relative">
                <button
                  type="button"
                  @click="showParticipantDropdown = !showParticipantDropdown"
                  class="w-full border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between bg-white hover:border-blue-400 transition-colors"
                >
                  <span class="truncate">
                    {{ formParticipantIds.length ? `Выбрано: ${formParticipantIds.length}` : 'Выберите участников...' }}
                  </span>
                  <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <div
                  v-if="showParticipantDropdown"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto"
                >
                  <label
                    v-for="user in availableParticipants"
                    :key="user.id"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      :checked="formParticipantIds.includes(user.id)"
                      @change="toggleFormParticipant(user.id)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div
                      v-if="user.avatar"
                      class="w-5 h-5 rounded-full overflow-hidden shrink-0"
                    >
                      <img :src="user.avatar" class="w-full h-full object-cover" />
                    </div>
                    <div
                      v-else
                      class="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    >
                      {{ userInitials(user) }}
                    </div>
                    <span class="truncate">{{ userDisplayName(user) }}</span>
                  </label>
                  <div v-if="availableParticipants.length === 0" class="px-3 py-2 text-sm text-gray-400">
                    Нет доступных пользователей
                  </div>
                </div>
              </div>
            </div>

            <div v-if="timeError" class="text-amber-600 text-sm">{{ timeError }}</div>
            <div v-if="formError" class="text-red-500 text-sm">{{ formError }}</div>

            <div class="flex gap-2 pt-2">
              <button
                type="submit"
                :disabled="saving || !!timeError"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {{ saving ? 'Сохранение...' : 'Сохранить' }}
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useMeetupStore } from '../stores/meetup';
import { useAuthStore } from '../stores/auth';
import { useConfirm } from '../composables/useConfirm';
import apiClient from '../api';
import type { Meetup, Room, UserSummary, ParticipantInfo } from '../types';

const meetupStore = useMeetupStore();
const authStore = useAuthStore();
const { confirm } = useConfirm();

// ── Calendar state ──
const currentDate = ref(new Date());
const selectedDay = ref<Date | null>(null);
const showUserDropdown = ref(false);
const showParticipantDropdown = ref(false);
const search = ref('');

// ── Users ──
const usersList = ref<UserSummary[]>([]);
// Для фильтра в сайдбаре — исключаем текущего пользователя
const filterableUsers = computed(() =>
  usersList.value.filter((u) => u.id !== authUserId.value),
);

// Для формы создания — все кроме себя
const availableParticipants = computed(() =>
  usersList.value.filter((u) => u.id !== authUserId.value),
);

// Валидация времени
const timeError = computed(() => {
  if (!form.startTime || !form.endTime) return null;
  if (new Date(form.endTime) <= new Date(form.startTime)) {
    return 'Время окончания должно быть позже времени начала';
  }
  return null;
});

const selectedUserIds = computed({
  get: () => meetupStore.selectedUserIds,
  set: (ids) => meetupStore.setSelectedUsers(ids),
});

const authUserId = computed(() => (authStore.profile?.id ? Number(authStore.profile.id) : null));

// ── Modal state ──
const showModal = ref(false);
const viewMeeting = ref<Meetup | null>(null);
const editingMeeting = ref<Meetup | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);

const form = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  roomId: null as number | null,
});

const formParticipantIds = ref<number[]>([]);

// ── Rooms ──
const availableRooms = ref<Room[]>([]);

// ── Helpers ──
const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const monthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
});

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  meetings: Meetup[];
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  let start = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start = new Date(year, month, 1 + mondayOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: new Date(d),
      dayNumber: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      meetings: getMeetingsForDay(d),
    });
  }
  return days;
});

// Используем calendarItems где DECLINED уже отфильтрованы + поиск по названию
const filteredBySearch = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return meetupStore.calendarItems;
  return meetupStore.calendarItems.filter((m) =>
    m.title.toLowerCase().includes(q),
  );
});

function getMeetingsForDay(date: Date): Meetup[] {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return filteredBySearch.value.filter((m) => {
    const start = new Date(m.startTime);
    const end = new Date(m.endTime);
    return start < dayEnd && end > dayStart;
  });
}

const selectedDayMeetings = computed(() => {
  if (!selectedDay.value) return [];
  return getMeetingsForDay(selectedDay.value);
});

// ── Participant grouping for detail view ──
const acceptedParticipants = computed(() =>
  viewMeeting.value?.participants?.filter((p) => p.status === 'ACCEPTED') ?? [],
);
const invitedParticipants = computed(() =>
  viewMeeting.value?.participants?.filter((p) => p.status === 'INVITED') ?? [],
);
const declinedParticipants = computed(() =>
  viewMeeting.value?.participants?.filter((p) => p.status === 'DECLINED') ?? [],
);

// ── Date helpers ──
function isToday(d: Date): boolean {
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isSelectedDay(d: Date): boolean {
  return selectedDay.value?.toDateString() === d.toDateString();
}

function formatDayHeader(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function userDisplayName(u: UserSummary | { name: string; firstName?: string | null; lastName?: string | null }): string {
  const first = (u as any).firstName;
  const last = (u as any).lastName;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return u.name;
}

function userInitials(u: UserSummary): string {
  const f = u.firstName?.charAt(0)?.toUpperCase() ?? '';
  const l = u.lastName?.charAt(0)?.toUpperCase() ?? '';
  if (f || l) return `${f}${l}`;
  return u.name.charAt(0).toUpperCase();
}

// ── Meeting status checks ──
function isMeetingHost(m: Meetup): boolean {
  return authUserId.value !== null && m.hostId === authUserId.value;
}

function isMeetingParticipant(m: Meetup): boolean {
  return authUserId.value !== null && meetupStore.isParticipant(m, authUserId.value);
}

function isMeetingInvited(m: Meetup): boolean {
  return authUserId.value !== null && meetupStore.isInvited(m, authUserId.value);
}

function isInvitedForDay(m: Meetup): boolean {
  return authUserId.value !== null && meetupStore.isInvited(m, authUserId.value);
}

// ── Colors ──
function meetingDotClass(m: Meetup): string {
  if (authUserId.value && isMeetingHost(m)) return 'bg-blue-500';
  if (authUserId.value && isMeetingParticipant(m)) return 'bg-green-500';
  if (authUserId.value && isMeetingInvited(m)) return 'bg-gray-300';
  return 'bg-purple-500';
}

function meetingBorderClass(m: Meetup): string {
  if (authUserId.value && isMeetingHost(m)) return 'border-l-4 border-l-blue-500';
  if (authUserId.value && isMeetingParticipant(m)) return 'border-l-4 border-l-green-500';
  if (authUserId.value && isMeetingInvited(m)) return 'border-l-4 border-l-amber-400 opacity-70';
  return 'border-l-4 border-l-purple-500';
}

// ── Navigation ──
function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
}
function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
}
function goToday() {
  currentDate.value = new Date();
  selectedDay.value = new Date();
}
function selectDay(day: CalendarDay) {
  if (day.isCurrentMonth) selectedDay.value = day.date;
}

// ── User filter ──
function toggleUser(userId: number) {
  const idx = selectedUserIds.value.indexOf(userId);
  if (idx >= 0) {
    selectedUserIds.value = selectedUserIds.value.filter((id) => id !== userId);
  } else {
    selectedUserIds.value = [...selectedUserIds.value, userId];
  }
}
function clearUsers() {
  selectedUserIds.value = [];
  showUserDropdown.value = false;
}

// ── Form participant selector ──
function toggleFormParticipant(userId: number) {
  const idx = formParticipantIds.value.indexOf(userId);
  if (idx >= 0) {
    formParticipantIds.value = formParticipantIds.value.filter((id) => id !== userId);
  } else {
    formParticipantIds.value = [...formParticipantIds.value, userId];
  }
}

// ── Modal ──
function openCreate() {
  viewMeeting.value = null;
  editingMeeting.value = null;
  form.title = '';
  form.description = '';
  form.startTime = toLocalDateTimeStr(new Date());
  const end = new Date();
  end.setHours(end.getHours() + 1);
  form.endTime = toLocalDateTimeStr(end);
  form.roomId = null;
  formParticipantIds.value = [];
  formError.value = null;
  showModal.value = true;
}

function openDetail(m: Meetup) {
  viewMeeting.value = meetupStore.getMeetupById(m.id) ?? m;
  editingMeeting.value = null;
  showModal.value = true;
}

function openEdit(m: Meetup) {
  form.title = m.title;
  form.description = m.description ?? '';
  form.startTime = toLocalDateTimeStr(new Date(m.startTime));
  form.endTime = toLocalDateTimeStr(new Date(m.endTime));
  form.roomId = m.roomId;
  // Текущие INVITED + ACCEPTED участники
  formParticipantIds.value = (m.participants ?? [])
    .filter((p) => p.status !== 'DECLINED')
    .map((p) => p.id);
  formError.value = null;
  editingMeeting.value = m;
  viewMeeting.value = null;
  showModal.value = true;
}

function cancelEdit() {
  if (viewMeeting.value) {
    editingMeeting.value = null;
  } else {
    closeModal();
  }
}

function closeModal() {
  showModal.value = false;
  viewMeeting.value = null;
  editingMeeting.value = null;
  showParticipantDropdown.value = false;
}

async function handleSave() {
  if (!form.title || !form.startTime || !form.endTime) {
    formError.value = 'Название, начало и конец обязательны';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      roomId: form.roomId,
      participantIds: formParticipantIds.value,
    };

    if (editingMeeting.value) {
      await meetupStore.updateMeetup(editingMeeting.value.id, payload);
    } else {
      await meetupStore.createMeetup(payload);
    }
    closeModal();
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(m: Meetup) {
  const ok = await confirm('Удалить встречу?', `«${m.title}» будет удалена. Участники получат уведомление.`, 'danger');
  if (!ok) return;
  try {
    await meetupStore.deleteMeetup(m.id);
    closeModal();
  } catch (e: any) {
    console.error('Delete error:', e);
  }
}

async function handleJoin(m: Meetup) {
  try {
    await meetupStore.joinMeetup(m.id);
    viewMeeting.value = meetupStore.getMeetupById(m.id);
  } catch (e: any) {
    console.error('Join error:', e);
  }
}

async function handleDecline(m: Meetup) {
  try {
    await meetupStore.declineMeetup(m.id);
    viewMeeting.value = meetupStore.getMeetupById(m.id);
  } catch (e: any) {
    console.error('Decline error:', e);
  }
}

function toLocalDateTimeStr(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ── Data loading ──
async function loadUsers() {
  try {
    const { data } = await apiClient.get<UserSummary[]>('/users');
    usersList.value = data;
  } catch (e) {
    console.error('Failed to load users', e);
  }
}

async function loadRooms() {
  try {
    const { data } = await apiClient.get<Room[]>('/rooms');
    availableRooms.value = Array.isArray(data) ? data : [];
  } catch (e) {
    availableRooms.value = [];
  }
}

watch(selectedUserIds, () => {
  meetupStore.fetchAllForCalendar();
}, { deep: true });

onMounted(() => {
  meetupStore.fetchAllForCalendar();
  loadUsers();
  loadRooms();
});
</script>
