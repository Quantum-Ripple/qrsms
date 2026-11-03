<template>
  <div class="p-4 sm:p-6 max-w-4xl mx-auto">
    <button class="text-blue-600 hover:underline mb-4"
            @click="router.push({ name: 'PrincipalSmsCampaigns' })">
      ← All SMS messages
    </button>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else-if="stats" class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-5">
        <p class="text-gray-800 whitespace-pre-line">{{ stats.campaign.body }}</p>
        <p class="text-sm text-gray-500 mt-3">
          Sent {{ formatDate(stats.campaign.created_at) }} to
          <span class="capitalize">{{ stats.campaign.target_audience }}</span>
          as {{ stats.campaign.sender_name }} · Status:
          <span class="capitalize font-medium">{{ stats.campaign.status }}</span>
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div class="bg-white rounded-xl shadow-md p-4">
          <p class="text-2xl font-bold">{{ stats.total }}</p><p class="text-sm text-gray-500">Recipients</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4">
          <p class="text-2xl font-bold text-green-600">{{ stats.delivered }}</p><p class="text-sm text-gray-500">Delivered</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4">
          <p class="text-2xl font-bold text-red-600">{{ stats.failed }}</p><p class="text-sm text-gray-500">Failed</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4">
          <p class="text-2xl font-bold text-amber-600">{{ pending }}</p><p class="text-sm text-gray-500">Pending</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4">
          <p class="text-2xl font-bold">{{ stats.delivery_rate }}%</p><p class="text-sm text-gray-500">Delivery rate</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-5 text-sm text-gray-700">
        <p>Credits reserved: <strong>{{ stats.campaign.credits_reserved }}</strong>
          · Returned (not sent): <strong>{{ stats.campaign.credits_released }}</strong>
          · Used: <strong>{{ stats.campaign.credits_used }}</strong></p>
        <ul v-if="stats.failure_reasons.length" class="mt-3 list-disc pl-5">
          <li v-for="r in stats.failure_reasons" :key="r.failure_reason">
            {{ r.failure_reason }}: {{ r.count }}
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-xl shadow-md p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-800">Recipients</h3>
          <select v-model="statusFilter" class="border rounded-lg p-1.5 text-sm">
            <option value="">All</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="unreachable">Unreachable</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left text-gray-600">
              <tr><th class="p-2">Phone</th><th class="p-2">Status</th><th class="p-2">Note</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in recipients" :key="r.id" class="border-t">
                <td class="p-2">{{ r.phone }}</td>
                <td class="p-2 capitalize">{{ r.status }}</td>
                <td class="p-2 text-gray-500">{{ r.failure_reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as smsApi from '../../api/sms.js'

const route = useRoute()
const router = useRouter()

const stats = ref(null)
const recipients = ref([])
const statusFilter = ref('')
const loading = ref(true)
const error = ref('')
let timer = null

const pending = computed(() => (stats.value ? stats.value.queued + stats.value.sent + stats.value.unknown : 0))

async function load() {
  try {
    stats.value = await smsApi.getCampaignStats(route.params.id)
    recipients.value = smsApi.rows(await smsApi.getCampaignRecipients(route.params.id, statusFilter.value))
  } catch (err) {
    error.value = smsApi.errorText(err)
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

watch(statusFilter, load)

onMounted(() => {
  load()
  // Refresh every 5 seconds until sending is finished and nothing is pending.
  timer = setInterval(() => {
    if (stats.value && stats.value.campaign.status === 'completed' && pending.value === 0) return
    load()
  }, 5000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>