<template>
  <div class="p-4 sm:p-6 max-w-5xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">SMS messages</h1>
      <div class="flex items-center gap-4">
        <p v-if="wallet" class="text-gray-700">
          Balance: <strong>{{ wallet.balance }}</strong> credits
        </p>
        <button class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                @click="showTopUp = true">
          Top up
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="!campaigns.length" class="text-gray-500">No SMS messages sent yet.</div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-600">
          <tr>
            <th class="p-3">Date</th>
            <th class="p-3">Message</th>
            <th class="p-3">Audience</th>
            <th class="p-3">Recipients</th>
            <th class="p-3">Credits used</th>
            <th class="p-3">Status</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in campaigns" :key="c.id" class="border-t">
            <td class="p-3 whitespace-nowrap">{{ formatDate(c.created_at) }}</td>
            <td class="p-3 max-w-xs truncate">{{ c.body }}</td>
            <td class="p-3 capitalize">{{ c.target_audience }}</td>
            <td class="p-3">{{ c.recipient_count }}</td>
            <td class="p-3">{{ c.credits_used }}</td>
            <td class="p-3 capitalize">{{ c.status }}</td>
            <td class="p-3">
              <button class="text-blue-600 hover:underline"
                      @click="router.push({ name: 'PrincipalSmsCampaignDetail', params: { id: c.id } })">
                View →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <SmsTopUpModal v-model="showTopUp" @done="load" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as smsApi from '../../api/sms.js'
import SmsTopUpModal from './SmsTopUpModal.vue'

const router = useRouter()
const campaigns = ref([])
const wallet = ref(null)
const loading = ref(true)
const error = ref('')
const showTopUp = ref(false)

async function load() {
  try {
    const [list, w] = await Promise.all([smsApi.listCampaigns(), smsApi.getWallet()])
    campaigns.value = smsApi.rows(list)
    wallet.value = w
  } catch (err) {
    error.value = smsApi.errorText(err)
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>