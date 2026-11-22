<template>
  <div class="p-6 max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800"></h2>
      <button
        @click="router.push({ name: 'PrincipalEvents' })"
        class="text-blue-600 hover:underline"
      >
        ← Back
      </button>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4">
      {{ successMessage }}
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </div>

    <!-- Create form -->
    <form @submit.prevent="createEvent" class="space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Title</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Enter announcement title"
          class="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
          required
        />
      </div>

      <!-- Message -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Message</label>
        <textarea
          v-model="form.message"
          placeholder="Write the announcement message here..."
          class="w-full border rounded-lg p-2 h-32 focus:ring focus:ring-blue-300"
          required
        ></textarea>
      </div>

      <!-- Target Audience -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Target Audience</label>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center space-x-2">
            <input type="radio" value="students" v-model="form.target_audience" />
            <span>Students</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="radio" value="teachers" v-model="form.target_audience" />
            <span>Teachers</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="radio" value="parents" v-model="form.target_audience" />
            <span>Parents</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="radio" value="finance" v-model="form.target_audience" />
            <span>Finance</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="radio" value="all" v-model="form.target_audience" />
            <span>All</span>
          </label>
        </div>
      </div>

      <!-- SMS option -->
      <div class="border rounded-lg p-4 bg-gray-50">
        <label class="flex items-center gap-2 font-medium text-gray-700">
          <input type="checkbox" v-model="sendSms" />
          Also send as SMS
        </label>

        <div v-if="sendSms" class="mt-4 space-y-3">
          <p v-if="form.target_audience === 'students'" class="text-sm text-amber-700">
            SMS can't be sent to students. Choose another audience.
          </p>

          <template v-else>
            <div>
              <label class="block text-sm text-gray-700 mb-1">SMS text</label>
              <textarea
                v-model="smsText"
                @input="smsEdited = true"
                class="w-full border rounded-lg p-2 h-24 text-sm focus:ring focus:ring-blue-300"
                placeholder="Keep it short. Every 160 characters costs one credit per recipient."
              ></textarea>
            </div>

            <p v-if="previewLoading" class="text-sm text-gray-500">Calculating cost...</p>
            <p v-else-if="previewError" class="text-sm text-red-600">{{ previewError }}</p>

            <div v-else-if="preview" class="text-sm text-gray-700 space-y-1">
              <p>Recipients: <strong>{{ preview.recipients }}</strong>
                <span v-if="preview.skipped_invalid_numbers || preview.skipped_duplicate_numbers" class="text-gray-500">
                  ({{ preview.skipped_invalid_numbers }} invalid and
                  {{ preview.skipped_duplicate_numbers }} duplicate numbers skipped)
                </span>
              </p>
              <p>SMS parts per message: <strong>{{ preview.parts_per_sms }}</strong></p>
              <p>Credits needed: <strong>{{ preview.credits_needed }}</strong></p>
              <p>Current balance: <strong>{{ preview.balance }}</strong></p>
              <p>Balance after sending:
                <strong :class="preview.sufficient ? '' : 'text-red-600'">{{ preview.balance_after }}</strong>
              </p>
              <p class="text-gray-500">Sender: {{ preview.sender_id }}</p>

              <div v-if="!preview.sufficient" class="bg-red-50 text-red-700 p-3 rounded mt-2">
                <p>Not enough credits. You need {{ preview.shortfall_credits }} more
                  (about KES {{ preview.shortfall_kes }}).</p>
                <button type="button" class="mt-2 bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700"
                        @click="showTopUp = true">
                  Top up credits
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Submit -->
      <div>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {{ loading ? 'Creating...' : sendSms ? 'Create and send SMS' : 'Create Announcement' }}
        </button>
      </div>
    </form>

    <SmsTopUpModal
      v-model="showTopUp"
      :suggested-amount="preview?.shortfall_kes || 0"
      @done="loadPreview"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as eventApi from '../../api/events.js'
import * as smsApi from '../../api/sms.js'
import SmsTopUpModal from './Smstopupmodal.vue'

import { useAuthStore } from '@/stores/authStore.js'
import { getErrorMessage } from '@/utils/apiError.js'

const auth = useAuthStore()

const router = useRouter()

// form data
const form = ref({
  title: '',
  message: '',
  target_audience: '',
})

// states
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// assume user info is stored in localStorage after login
const user = auth.user || {}
const school_id = user.school?.id || user.school_id

// ---------------------------------------------------------
// SMS option
// ---------------------------------------------------------
const sendSms = ref(false)
const smsText = ref('')
const smsEdited = ref(false) // once the principal edits the SMS text, stop copying the message into it
const preview = ref(null)
const previewLoading = ref(false)
const previewError = ref('')
const showTopUp = ref(false)

let timer = null
let requestId = 0

// SMS text follows the announcement message until the principal edits it
watch(() => form.value.message, (m) => {
  if (!smsEdited.value) smsText.value = m
})

watch([sendSms, smsText, () => form.value.target_audience], schedulePreview)

function smsPossible() {
  return sendSms.value && smsText.value.trim() && form.value.target_audience &&
    form.value.target_audience !== 'students'
}

function schedulePreview() {
  clearTimeout(timer)
  preview.value = null
  previewError.value = ''
  if (!smsPossible()) {
    previewLoading.value = false
    return
  }
  previewLoading.value = true
  timer = setTimeout(loadPreview, 500)
}

async function loadPreview() {
  if (!smsPossible()) return
  const myRequest = ++requestId
  previewLoading.value = true
  previewError.value = ''
  try {
    const data = await smsApi.previewSms({
      message: smsText.value,
      target_audience: form.value.target_audience,
    })
    if (myRequest === requestId) preview.value = data // ignore out-of-date answers
  } catch (err) {
    if (myRequest === requestId) previewError.value = smsApi.errorText(err)
  } finally {
    if (myRequest === requestId) previewLoading.value = false
  }
}

const canSubmit = computed(() => {
  if (loading.value) return false
  if (!sendSms.value) return true
  return !!preview.value && preview.value.sufficient && preview.value.recipients > 0 && !previewLoading.value
})

onBeforeUnmount(() => clearTimeout(timer))

// handle submit
async function createEvent() {
  if (!form.value.title || !form.value.message || !form.value.target_audience) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      title: form.value.title,
      message: form.value.message,
      target_audience: form.value.target_audience, // if backend expects comma-separated
      school: school_id,
    }
    console.log('Creating announcement with payload:', payload)

    const announcement = await eventApi.createEvent(payload)

    let campaign = null
    if (sendSms.value) {
      try {
        campaign = await smsApi.sendSmsCampaign({
          message: smsText.value,
          target_audience: form.value.target_audience,
          announcement: announcement.id,
        })
      } catch (smsErr) {
        // The announcement already exists. Say so clearly instead of pretending nothing happened.
        errorMessage.value = `The announcement was created, but the SMS was not sent: ${smsApi.errorText(smsErr)}`
        loadPreview()
        return
      }
    }

    successMessage.value = campaign
      ? `Announcement created and SMS queued for ${campaign.recipient_count} recipients.`
      : 'Announcement created successfully!'
    form.value = { title: '', message: '', target_audience: '' }
    sendSms.value = false
    smsText.value = ''
    smsEdited.value = false

    // after a short delay, show SMS delivery if we sent one, otherwise the list
    setTimeout(() => {
      if (campaign && router.hasRoute('PrincipalSmsCampaignDetail')) {
        router.push({ name: 'PrincipalSmsCampaignDetail', params: { id: campaign.id } })
      } else {
        router.push({ name: 'Events' })
      }
    }, 1500)
  } catch (err) {
    console.error('Failed to create announcement:', err)
    errorMessage.value = getErrorMessage(err, 'Error creating announcement.')
  } finally {
    loading.value = false
  }
}
</script>