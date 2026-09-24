<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      <!-- HEADER -->
      <div
        v-if="data"
        class="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex items-center gap-4">
          <div>
            <button
              class="mb-1 text-xs font-medium text-gray-400 transition hover:text-[#006600]"
              @click="goBack"
            >
              ← Students
            </button>

            <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {{ data.student.first_name }}
              {{ data.student.last_name }}
            </h1>

            <p class="mt-1 text-sm text-gray-500">
              {{ data.student.admission_number }}

              <span v-if="data.student.class_level_name">
                · {{ data.student.class_level_name }}
              </span>

              <span v-if="data.student.stream_name">
                · {{ data.student.stream_name }}
              </span>
            </p>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="printResultSlip"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200
                   bg-white px-4 py-2.5 text-sm font-medium text-gray-700
                   shadow-sm transition hover:bg-gray-50"
          >
            🖨
            Print
          </button>

          <button
            @click="downloadResultSlip"
            :disabled="generatingPdf"
            class="inline-flex items-center gap-2 rounded-xl bg-[#006600]
                   px-5 py-2.5 text-sm font-semibold text-white shadow-sm
                   transition hover:bg-[#005500] disabled:cursor-not-allowed
                   disabled:opacity-60"
          >
            {{ generatingPdf ? 'Preparing...' : 'Generate Result Slip' }}
          </button>
        </div>
      </div>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm"
      >
        <div
          class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full
                 border-2 border-[#006600] border-t-transparent"
        ></div>

        <p class="text-sm text-gray-500">
          Loading student performance...
        </p>
      </div>


      <!-- ERROR -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-red-100 bg-red-50 p-5
               text-sm text-red-700"
      >
        {{ error }}
      </div>


      <template v-else-if="data">

        <!-- ================================================== -->
        <!-- SUMMARY CARDS (all-time, across exams)            -->
        <!-- ================================================== -->

        <div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <!-- OVERALL -->
          <div
            class="col-span-2 rounded-2xl bg-[#006600] p-5 text-white
                   shadow-sm sm:p-6 lg:col-span-1"
          >
            <p class="text-[11px] font-medium uppercase tracking-wider text-white/60">
              Overall Average
            </p>

            <div class="mt-3 flex items-end gap-1">
              <span class="text-4xl font-bold tracking-tight sm:text-5xl">
                {{ data.overall_average }}
              </span>

              <span class="mb-2 text-sm text-white/50">
                /100
              </span>
            </div>

            <p class="mt-2 text-xs text-white/60">
              Across {{ data.exams.length }}
              {{ data.exams.length === 1 ? 'examination' : 'examinations' }}
            </p>
          </div>


          <!-- EXAMS -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Examinations
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-900">
              {{ data.exams.length }}
            </p>

            <p class="mt-2 text-xs text-gray-400">
              Recorded assessments
            </p>
          </div>


          <!-- BEST EXAM -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Best Exam
            </p>

            <p class="mt-3 text-3xl font-bold text-gray-900">
              {{ bestExam ? bestExam.average_score : '—' }}
            </p>

            <p
              v-if="bestExam"
              class="mt-2 truncate text-xs text-gray-400"
            >
              {{ bestExam.exam_name }}
            </p>
          </div>


          <!-- STRONGEST SUBJECT (all-time) -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Strongest Subject
            </p>

            <p class="mt-3 truncate text-lg font-bold text-gray-900">
              {{ strongestSubject?.subject_display || '—' }}
            </p>

            <p
              v-if="strongestSubject"
              class="mt-2 text-xs text-gray-400"
            >
              Average {{ strongestSubject.average }}
            </p>
          </div>

        </div>


        <!-- ================================================== -->
        <!-- TREND (all exams) + SUBJECTS (selected exam)      -->
        <!-- ================================================== -->

        <div class="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-5">

          <!-- TREND -->
          <section
            class="rounded-2xl border border-gray-200 bg-white p-5
                   shadow-sm sm:p-6 lg:col-span-3"
          >

            <div class="mb-6">
              <h2 class="text-lg font-bold text-gray-900">
                Performance trend
              </h2>

              <p class="mt-1 text-xs text-gray-400">
                Average score across examinations
              </p>
            </div>


            <div
              v-if="data.exams.length > 1"
              class="flex h-56 items-end gap-3 sm:gap-5"
            >

              <div
                v-for="exam in data.exams"
                :key="exam.exam_id"
                class="flex h-full min-w-0 flex-1 flex-col
                       items-center justify-end"
              >

                <span class="mb-2 text-xs font-bold text-gray-700">
                  {{ exam.average_score }}
                </span>

                <div
                  class="w-full max-w-12 rounded-t-xl transition-all"
                  :class="
                    exam.average_score >= 70
                      ? 'bg-[#006600]'
                      : exam.average_score >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  "
                  :style="{
                    height: Math.max(exam.average_score, 5) + '%'
                  }"
                ></div>

                <span
                  class="mt-3 w-full truncate text-center text-[11px] text-gray-400"
                >
                  {{ exam.exam_name }}
                </span>

              </div>

            </div>

            <div
              v-else
              class="flex h-56 items-center justify-center text-sm text-gray-400"
            >
              Not enough exams recorded yet to show a trend.
            </div>

          </section>


          <!-- SUBJECTS (for the selected exam, not blended) -->
          <section
            class="rounded-2xl border border-gray-200 bg-white p-5
                   shadow-sm sm:p-6 lg:col-span-2"
          >

            <div class="mb-5 flex items-center justify-between gap-3">
              <h2 class="text-lg font-bold text-gray-900">
                Subject performance
              </h2>

              <select
                v-model="selectedExamId"
                class="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5
                       text-xs font-medium text-gray-600 focus:outline-none
                       focus:ring-2 focus:ring-[#006600]/30"
              >
                <option
                  v-for="exam in data.exams"
                  :key="exam.exam_id"
                  :value="exam.exam_id"
                >
                  {{ exam.exam_name }}
                </option>
              </select>
            </div>

            <div v-if="selectedExamSubjects.length" class="space-y-4">

              <div
                v-for="(subject, index) in selectedExamSubjects"
                :key="subject.subject"
              >

                <div class="mb-1.5 flex items-center justify-between gap-3">

                  <span class="truncate text-sm text-gray-700">
                    {{ subject.subject_display }}
                  </span>

                  <span class="shrink-0 text-sm font-bold tabular-nums">
                    {{ subject.score }}
                  </span>

                </div>

                <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">

                  <div
                    class="h-full rounded-full transition-all"
                    :class="
                      index === 0
                        ? 'bg-[#006600]'
                        : subject.score >= 70
                          ? 'bg-green-500'
                          : subject.score >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                    "
                    :style="{
                      width: Math.min(subject.score, 100) + '%'
                    }"
                  ></div>

                </div>

              </div>

            </div>

            <p v-else class="text-sm text-gray-400">
              No subject scores recorded for this exam.
            </p>

          </section>

        </div>


        <!-- ================================================== -->
        <!-- EXAMINATION PERFORMANCE (comparison, unchanged)   -->
        <!-- ================================================== -->

        <section
          class="mb-5 overflow-hidden rounded-2xl border border-gray-200
                 bg-white shadow-sm"
        >

          <div class="border-b border-gray-100 p-5 sm:p-6">
            <h2 class="text-lg font-bold text-gray-900">
              Examination performance
            </h2>
          </div>

          <div class="divide-y divide-gray-100">

            <div
              v-for="(exam, index) in [...data.exams].reverse()"
              :key="exam.exam_id"
              class="flex items-center gap-4 px-5 py-4 sm:px-6"
            >

              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center
                       rounded-xl bg-[#eff6ef] text-xs font-bold text-[#006600]"
              >
                {{ data.exams.length - index }}
              </div>

              <div class="min-w-0 flex-1">

                <p class="truncate text-sm font-semibold text-gray-800">
                  {{ exam.exam_name }}
                </p>

                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-[#006600]"
                    :style="{
                      width: Math.min(exam.average_score, 100) + '%'
                    }"
                  ></div>
                </div>

              </div>

              <div class="text-right">
                <p class="text-lg font-bold tabular-nums text-gray-900">
                  {{ exam.average_score }}
                </p>
                <p class="text-[11px] text-gray-400">
                  average
                </p>
              </div>

            </div>

          </div>

        </section>


        <!-- ================================================== -->
        <!-- DETAILED RESULTS (already per-exam, unchanged)    -->
        <!-- ================================================== -->

        <section
          class="overflow-hidden rounded-2xl border border-gray-200
                 bg-white shadow-sm"
        >

          <div class="border-b border-gray-100 p-5 sm:p-6">
            <h2 class="text-lg font-bold text-gray-900">
              Detailed results
            </h2>
          </div>

          <div class="overflow-x-auto">

            <table class="w-full text-sm">

              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                    Examination
                  </th>
                  <th class="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Subject
                  </th>
                  <th class="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-6">
                    Score
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100">

                <template
                  v-for="(exam, examIndex) in data.exams"
                  :key="'detail-' + (exam.exam_id || examIndex)"
                >

                  <tr
                    v-for="(subject, subjectIndex) in exam.subjects || []"
                    :key="(exam.exam_id || examIndex) + '-' + (subject.subject || subject.subject_display || subjectIndex)"
                    class="transition hover:bg-gray-50"
                  >
                    <td class="px-5 py-3 font-medium text-gray-800 sm:px-6">
                      {{ exam.exam_name }}
                    </td>
                    <td class="px-4 py-3 text-gray-600">
                      {{ subject.subject_display }}
                    </td>
                    <td class="px-5 py-3 text-right font-bold tabular-nums text-gray-900 sm:px-6">
                      {{ subject.score }}
                    </td>
                  </tr>

                  <tr class="bg-[#fafcf9]">
                    <td colspan="2" class="px-5 py-3 text-xs font-semibold text-gray-500 sm:px-6">
                      {{ exam.exam_name }} average
                    </td>
                    <td class="px-5 py-3 text-right font-bold text-[#006600] sm:px-6">
                      {{ exam.average_score }}
                    </td>
                  </tr>

                </template>

              </tbody>

            </table>

          </div>

        </section>

      </template>

    </div>


    <!-- ====================================================== -->
    <!-- RESULT SLIP (now reflects the SELECTED exam)          -->
    <!-- ====================================================== -->

    <div
      v-if="data"
      ref="resultSlipRef"
      class="fixed -left-[100000px] top-0 w-[210mm] min-h-[297mm]
             bg-white px-[17mm] py-[16mm] text-gray-900"
    >

      <!-- SCHOOL HEADER -->

      <div class="pb-8 text-center">

        <img
          v-if="schoolLogoUrl"
          :src="schoolLogoUrl"
          class="mx-auto mb-4 max-h-20 max-w-28 object-contain"
        />

        <h1 class="text-2xl font-bold tracking-wide">
          {{ schoolName }}
        </h1>

        <p class="mt-5 text-sm font-bold uppercase tracking-[0.25em] text-[#006600]">
          Student Result Slip
        </p>

        <p v-if="selectedExam" class="mt-1 text-xs font-semibold text-gray-500">
          {{ selectedExam.exam_name }}
        </p>

        <div class="mx-auto mt-3 h-1 w-20 rounded-full bg-[#006600]"></div>

      </div>


      <!-- STUDENT INFORMATION -->

      <div class="grid grid-cols-4 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5">

        <div>
          <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Student</p>
          <p class="mt-1 text-sm font-semibold">
            {{ data.student.first_name }} {{ data.student.last_name }}
          </p>
        </div>

        <div>
          <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Admission No.</p>
          <p class="mt-1 text-sm font-semibold">{{ data.student.admission_number }}</p>
        </div>

        <div>
          <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Class</p>
          <p class="mt-1 text-sm font-semibold">{{ data.student.class_level_name || '—' }}</p>
        </div>

        <div>
          <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Date</p>
          <p class="mt-1 text-sm font-semibold">{{ todayFormatted }}</p>
        </div>

      </div>


      <!-- EXAM AVERAGE (selected exam, not all-time blend) -->

      <div class="my-7 flex justify-center">

        <div class="w-44 rounded-2xl border border-[#006600] bg-[#f3f8f3] px-8 py-6 text-center">
          <p class="text-4xl font-bold text-[#006600]">
            {{ selectedExam?.average_score ?? '—' }}
          </p>
          <p class="mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">
            {{ selectedExam ? selectedExam.exam_name + ' Average' : 'Exam Average' }}
          </p>
        </div>

      </div>


      <!-- SUBJECTS (selected exam only) -->

      <div class="mb-7">

        <div class="border-b border-gray-300 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#006600]">
          Subject Performance
        </div>

        <table class="w-full border-collapse">
          <thead>
            <tr class="text-[9px] uppercase tracking-wider text-gray-400">
              <th class="px-2 py-3 text-left">Subject</th>
              <th class="px-2 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="subject in selectedExamSubjects"
              :key="'slip-subject-' + subject.subject"
              class="border-b border-gray-100"
            >
              <td class="px-2 py-2.5 text-xs">{{ subject.subject_display }}</td>
              <td class="px-2 py-2.5 text-right text-xs font-bold">{{ subject.score }}</td>
            </tr>
          </tbody>
        </table>

      </div>


      <!-- EXAMS (all-time comparison — kept) -->

      <div>

        <div class="border-b border-gray-300 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#006600]">
          Examination Summary
        </div>

        <table class="w-full border-collapse">
          <thead>
            <tr class="text-[9px] uppercase tracking-wider text-gray-400">
              <th class="px-2 py-3 text-left">Examination</th>
              <th class="px-2 py-3 text-right">Average</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="exam in data.exams"
              :key="'slip-exam-' + exam.exam_id"
              class="border-b border-gray-100"
            >
              <td class="px-2 py-2.5 text-xs">{{ exam.exam_name }}</td>
              <td class="px-2 py-2.5 text-right text-xs font-bold">{{ exam.average_score }}</td>
            </tr>
          </tbody>
        </table>

      </div>


      <!-- SIGNATURES -->

      <div class="mt-28 grid grid-cols-2 gap-20">
        <div class="text-center">
          <div class="mb-2 border-t border-gray-700"></div>
          <p class="text-[9px] uppercase tracking-wider text-gray-500">Class Teacher</p>
        </div>
        <div class="text-center">
          <div class="mb-2 border-t border-gray-700"></div>
          <p class="text-[9px] uppercase tracking-wider text-gray-500">Principal</p>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="mt-12 text-center text-[8px] text-gray-400">
        Generated electronically on {{ todayFormatted }}
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jsPDF } from 'jspdf'
import { getStudentPerformance } from '../../api/Grades.js'
import { useAuthStore } from '../../../../stores/authStore.js'


/*
|--------------------------------------------------------------------------
| Props / Emits
|--------------------------------------------------------------------------
*/

const auth = useAuthStore()

const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['back'])

const route = useRoute()
const router = useRouter()


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const data = ref(null)
const loading = ref(false)
const error = ref('')
const generatingPdf = ref(false)
const resultSlipRef = ref(null)

// Which exam is currently selected for the "Subject performance" panel
// and the Result Slip. Defaults to whichever exam the user drilled in
// from (?exam=... in the route), falling back to the most recent exam.
const selectedExamId = ref(null)


/*
|--------------------------------------------------------------------------
| School Information
|--------------------------------------------------------------------------
*/

const schoolName = computed(() => {
  return auth.user?.school_name || 'Your School Name'
})

const schoolLogoUrl = ref('')


/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})


/*
|--------------------------------------------------------------------------
| Student Initials
|--------------------------------------------------------------------------
*/

const studentInitials = computed(() => {
  if (!data.value?.student) {
    return 'ST'
  }
  const first = data.value.student.first_name?.charAt(0) || ''
  const last = data.value.student.last_name?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
})


/*
|--------------------------------------------------------------------------
| Selected Exam
|--------------------------------------------------------------------------
|
| The single exam currently driving the "Subject performance" panel
| and the Result Slip. Falls back to the most recent exam if the
| selected id isn't found (e.g. on first load before selection settles).
|
*/

const selectedExam = computed(() => {
  if (!data.value?.exams?.length) {
    return null
  }
  return (
    data.value.exams.find(
      (e) => String(e.exam_id) === String(selectedExamId.value)
    ) || data.value.exams[data.value.exams.length - 1]
  )
})


/*
|--------------------------------------------------------------------------
| Selected Exam's Subjects
|--------------------------------------------------------------------------
|
| Raw per-subject scores for the selected exam ONLY. This is what
| "Subject performance" and the Result Slip should use — never the
| all-time subjectAverages blend below, which mixes different exams
| together and misrepresents a single exam's results.
|
*/

const selectedExamSubjects = computed(() => {
  if (!selectedExam.value?.subjects) {
    return []
  }
  return [...selectedExam.value.subjects].sort(
    (a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)
  )
})


/*
|--------------------------------------------------------------------------
| Subject Averages (all-time, across every exam)
|--------------------------------------------------------------------------
|
| This blends a subject's score across every exam the student has sat.
| Kept intentionally for the "Strongest Subject" all-time comparison
| card — but must NEVER be used to represent a single exam's results.
|
| Example:
|
| Mathematics:
|   CAT 1     80
|   Mid Term  84
|   End Term  88
|
| Average = 84
|
*/

const subjectAverages = computed(() => {
  if (!data.value?.exams?.length) {
    return []
  }

  const totals = {}

  for (const exam of data.value.exams) {
    if (!exam.subjects) continue

    for (const subject of exam.subjects) {
      if (!totals[subject.subject]) {
        totals[subject.subject] = {
          subject: subject.subject,
          subject_display: subject.subject_display,
          sum: 0,
          count: 0,
        }
      }
      totals[subject.subject].sum += Number(subject.score) || 0
      totals[subject.subject].count += 1
    }
  }

  return Object.values(totals)
    .map((subject) => ({
      ...subject,
      average:
        subject.count > 0
          ? Math.round((subject.sum / subject.count) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.average - a.average)
})


/*
|--------------------------------------------------------------------------
| Strongest / Weakest Subject (all-time)
|--------------------------------------------------------------------------
*/

const strongestSubject = computed(() => subjectAverages.value[0] || null)

const weakestSubject = computed(() => {
  if (!subjectAverages.value.length) return null
  return subjectAverages.value[subjectAverages.value.length - 1]
})


/*
|--------------------------------------------------------------------------
| Best / Lowest Examination
|--------------------------------------------------------------------------
*/

const bestExam = computed(() => {
  if (!data.value?.exams?.length) return null
  return [...data.value.exams].sort(
    (a, b) => Number(b.average_score || 0) - Number(a.average_score || 0)
  )[0]
})

const lowestExam = computed(() => {
  if (!data.value?.exams?.length) return null
  return [...data.value.exams].sort(
    (a, b) => Number(a.average_score || 0) - Number(b.average_score || 0)
  )[0]
})


/*
|--------------------------------------------------------------------------
| Load Student Performance
|--------------------------------------------------------------------------
*/

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getStudentPerformance(props.studentId)
    data.value = response

    // Default the selected exam: prefer the one we navigated in with
    // (?exam=... from ClassResultsView), else fall back to most recent.
    const exams = response.exams || []
    const fromRoute = exams.find(
      (e) => String(e.exam_id) === String(route.query.exam)
    )
    selectedExamId.value = fromRoute
      ? fromRoute.exam_id
      : exams[exams.length - 1]?.exam_id ?? null

  } catch (err) {
    console.error('Failed to load student performance:', err)
    error.value = 'Could not load student performance.'
  } finally {
    loading.value = false
  }
}


/*
|--------------------------------------------------------------------------
| Generate Result Slip PDF (for the selected exam)
|--------------------------------------------------------------------------
*/

const downloadResultSlip = async () => {
  if (!data.value || !selectedExam.value) {
    return
  }

  generatingPdf.value = true
  error.value = ''

  try {
    const student = data.value.student
    const exams = data.value.exams || []
    const subjects = selectedExamSubjects.value || []

    const admissionNumber = student?.admission_number || 'student'
    const fullName = `${student?.first_name || ''} ${student?.last_name || ''}`.trim()

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const green = [0, 102, 0]
    const dark = [31, 41, 55]
    const gray = [107, 114, 128]
    const lightGray = [243, 244, 246]
    const border = [229, 231, 235]

    let y = 18

    // SCHOOL HEADER
    doc.setFillColor(...green)
    doc.rect(0, 0, pageWidth, 7, 'F')

    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(21)
    doc.text(schoolName.value || 'Your School Name', pageWidth / 2, y + 5, { align: 'center' })

    y += 11

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...green)
    doc.text('STUDENT RESULT SLIP', pageWidth / 2, y + 4, { align: 'center' })

    y += 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...gray)
    doc.text(selectedExam.value.exam_name, pageWidth / 2, y + 4, { align: 'center' })

    y += 8

    doc.setFillColor(...green)
    doc.roundedRect(pageWidth / 2 - 10, y, 20, 1.5, 0.75, 0.75, 'F')

    y += 10

    // STUDENT INFORMATION
    doc.setFillColor(...lightGray)
    doc.setDrawColor(...border)
    doc.roundedRect(15, y, pageWidth - 30, 28, 3, 3, 'FD')

    const infoY = y + 8
    const col1 = 20, col2 = 68, col3 = 116, col4 = 160

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gray)
    doc.text('STUDENT', col1, infoY)
    doc.text('ADMISSION NO.', col2, infoY)
    doc.text('CLASS', col3, infoY)
    doc.text('DATE', col4, infoY)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...dark)
    doc.text(fullName || '—', col1, infoY + 7)
    doc.text(admissionNumber || '—', col2, infoY + 7)
    doc.text(student?.class_level_name || '—', col3, infoY + 7)
    doc.text(todayFormatted.value, col4, infoY + 7)

    y += 38

    // EXAM AVERAGE (selected exam)
    doc.setFillColor(243, 248, 243)
    doc.setDrawColor(...green)
    doc.roundedRect(pageWidth / 2 - 25, y, 50, 31, 4, 4, 'FD')

    doc.setTextColor(...green)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(23)
    doc.text(String(selectedExam.value.average_score ?? '—'), pageWidth / 2, y + 14, { align: 'center' })

    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.text(
      `${selectedExam.value.exam_name.toUpperCase()} AVERAGE`,
      pageWidth / 2,
      y + 23,
      { align: 'center' }
    )

    y += 42

    // SUBJECT PERFORMANCE (selected exam only)
    doc.setTextColor(...green)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('SUBJECT PERFORMANCE', 15, y)

    doc.setDrawColor(...border)
    doc.line(15, y + 3, pageWidth - 15, y + 3)

    y += 10

    doc.setFillColor(...lightGray)
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F')

    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'bold')
    doc.text('SUBJECT', 19, y)
    doc.text('SCORE', pageWidth - 19, y, { align: 'right' })

    y += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...dark)

    subjects.forEach((subject) => {
      if (y > 255) {
        doc.addPage()
        y = 20
      }

      doc.text(String(subject.subject_display || subject.subject || '—'), 19, y)

      doc.setFont('helvetica', 'bold')
      doc.text(String(subject.score ?? '—'), pageWidth - 19, y, { align: 'right' })
      doc.setFont('helvetica', 'normal')

      doc.setDrawColor(...border)
      doc.line(15, y + 3, pageWidth - 15, y + 3)

      y += 7
    })

    y += 9

    // EXAMINATION SUMMARY (all-time comparison — kept)
    if (y > 235) {
      doc.addPage()
      y = 20
    }

    doc.setTextColor(...green)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('EXAMINATION SUMMARY', 15, y)

    doc.setDrawColor(...border)
    doc.line(15, y + 3, pageWidth - 15, y + 3)

    y += 10

    doc.setFillColor(...lightGray)
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F')

    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'bold')
    doc.text('EXAMINATION', 19, y)
    doc.text('AVERAGE', pageWidth - 19, y, { align: 'right' })

    y += 7

    doc.setFontSize(8)
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'normal')

    exams.forEach((exam) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }

      doc.text(String(exam.exam_name || '—'), 19, y)

      doc.setFont('helvetica', 'bold')
      doc.text(String(exam.average_score ?? '—'), pageWidth - 19, y, { align: 'right' })
      doc.setFont('helvetica', 'normal')

      doc.setDrawColor(...border)
      doc.line(15, y + 3, pageWidth - 15, y + 3)

      y += 7
    })

    // SIGNATURES
    y = Math.max(y + 25, pageHeight - 45)

    doc.setDrawColor(...dark)
    doc.line(25, y, 85, y)
    doc.line(pageWidth - 85, y, pageWidth - 25, y)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    doc.text('Class Teacher', 55, y + 5, { align: 'center' })
    doc.text('Principal', pageWidth - 55, y + 5, { align: 'center' })

    // FOOTER
    doc.setFontSize(6.5)
    doc.setTextColor(156, 163, 175)
    doc.text(
      `Generated electronically on ${todayFormatted.value}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    )

    doc.save(`result_slip_${admissionNumber}_${selectedExam.value.exam_id}.pdf`)

  } catch (err) {
    console.error('Failed to generate result slip:', err)
    error.value = 'Could not generate the result slip. Please try again.'
  } finally {
    generatingPdf.value = false
  }
}


/*
|--------------------------------------------------------------------------
| Print Result Slip
|--------------------------------------------------------------------------
*/

const printResultSlip = async () => {
  if (!resultSlipRef.value) return
  await nextTick()
  window.print()
}


/*
|--------------------------------------------------------------------------
| Back
|--------------------------------------------------------------------------
*/

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  if (route.query?.classLevelId) {
    router.push({
      name: 'ClassResults',
      params: { classLevelId: route.query.classLevelId },
      query: { exam: route.query.exam },
    })
    return
  }

  router.push({ name: 'PrincipalDashboard' })
}


/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/

onMounted(() => {
  load()
})
</script>