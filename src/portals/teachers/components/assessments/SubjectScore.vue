<template>

  <div class="space-y-6">

    <h2 class="text-xl font-bold">
      {{ subject }} Scores
    </h2>

    <div class="flex gap-4 items-center">

      <select
        v-model="selectedExam"
        class="border rounded px-3 py-2"
      >
        <option
          v-for="exam in exams"
          :key="exam.id"
          :value="exam.id"
        >
          {{ exam.name }}
        </option>
      </select>

    </div>


    <div
      v-if="students.length"
      class="overflow-x-auto border rounded"
    >

      <table class="min-w-full text-sm">

        <thead class="bg-gray-100">

          <tr>

            <th class="p-3">
              Student
            </th>

            <th class="p-3">
              Score (%)
            </th>

            <th class="p-3">
              Level
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="student in students"
            :key="student.id"
          >

            <td class="p-3 font-medium">
              {{ student.full_name }}
            </td>


            <td class="p-2">

              <input
                type="number"
                min="0"
                max="100"
                class="border rounded px-2 py-1 w-24"
                :value="getScore(student.id)"
                @input="updateScore(student.id, $event.target.value)"
              >

            </td>


            <td class="p-3 font-semibold text-blue-600">
              {{ getLevel(student.id) }}
            </td>

          </tr>

        </tbody>

      </table>

    </div>


    <div>

      <LoadingButton
        type="button"
        :loading="loading"
        loading-text="Saving..."
        @click="saveScores"
        class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Save Scores
      </LoadingButton>

    </div>

  </div>

</template>


<script setup>

import {
  ref,
  watch,
  onMounted,
  computed
} from "vue"

import { useClassStore } from "@/stores/classStore"
import { useToast } from "vue-toastification"

import { getExams } from "@/portals/teachers/api/Grades"
import studentsApi from "../../api/Students"

import {
  getSubjectScores,
  bulkSaveSubjectScores
} from "../../api/assessments"

import LoadingButton from "@/components/LoadingButton.vue"


const classStore = useClassStore()
const toast = useToast()


/* =========================
   STATE
========================= */

const exams = ref([])
const selectedExam = ref(null)

const students = ref([])
const scores = ref({})

const modifiedStudents = ref(new Set())

const loading = ref(false)


const subject = computed(
  () => classStore.activeClass?.subject
)


/* =========================
   PERFORMANCE LEVEL
========================= */

const levelFromScore = (score) => {

  score = Number(score)

  if (score >= 90) return "EE1"
  if (score >= 75) return "EE2"
  if (score >= 58) return "ME1"
  if (score >= 41) return "ME2"
  if (score >= 31) return "AE1"
  if (score >= 21) return "AE2"
  if (score >= 11) return "BE1"

  return "BE2"

}


/* =========================
   LOAD EXAMS
========================= */
const loadExams = async () => {

  const cls = classStore.activeClass

  if (!cls) return

  try {

    const all = await getExams()

    exams.value = all.filter(exam => {

      /*
       * NEW PRINCIPAL-CREATED EXAMS
       *
       * Match the teacher's class level against
       * the grades targeted by the exam.
       */
      if (
        Array.isArray(exam.target_class_levels) &&
        exam.target_class_levels.length
      ) {

        return exam.target_class_levels.some(
          levelId =>
            String(levelId) ===
            String(cls.class_level)
        )

      }

      /*
       * LEGACY EXAMS CREATED FOR A CLASS INSTANCE
       */
      if (
        cls.class_instance &&
        exam.class_instance
      ) {

        return (
          String(exam.class_instance) ===
          String(cls.class_instance)
        )

      }

      /*
       * LEGACY EXAMS CREATED FOR A CLASS LEVEL
       */
      if (exam.class_level) {

        return (
          String(exam.class_level) ===
          String(cls.class_level)
        )

      }

      return false

    })

    if (exams.value.length) {

      selectedExam.value = exams.value[0].id

    } else {

      selectedExam.value = null

    }

  } catch (error) {

    console.error(
      "Failed to load exams:",
      error
    )

    exams.value = []
    selectedExam.value = null

  }

}

/* =========================
   LOAD STUDENTS
========================= */

const loadStudents = async () => {

  const cls = classStore.activeClass

  if (!cls) return

  try {

    const res = await studentsApi.filter(
      cls.class_level,
      cls.stream
    )

    students.value =
      Array.isArray(res)
        ? res
        : res.results ?? []

  } catch (error) {

    console.error(
      "Failed to load students:",
      error
    )

  }

}


/* =========================
   LOAD SCORES
========================= */

const loadScores = async () => {

  if (
    !selectedExam.value ||
    !subject.value
  ) {
    return
  }


  try {

    const data = await getSubjectScores(
      selectedExam.value,
      subject.value
    )


    const map = {}


    data.forEach(score => {

      map[score.student] = score

    })


    scores.value = map

    /*
     * Loading fresh scores means we are
     * starting from a clean state.
     *
     * No students are considered modified
     * until the teacher edits something.
     */

    modifiedStudents.value.clear()

  } catch (error) {

    console.error(
      "Failed to load scores:",
      error
    )

  }

}


/* =========================
   GET SCORE
========================= */

const getScore = (studentId) => {

  const result = scores.value[studentId]

  return result?.score ?? ""

}


/* =========================
   GET LEVEL
========================= */

const getLevel = (studentId) => {

  const score = getScore(studentId)

  if (
    score === "" ||
    score === null ||
    score === undefined
  ) {
    return ""
  }

  return levelFromScore(score)

}


/* =========================
   UPDATE SCORE
========================= */

const updateScore = (studentId, score) => {

  scores.value[studentId] = {

    ...scores.value[studentId],

    student: studentId,

    exam: selectedExam.value,

    subject: subject.value,

    score

  }


  /*
   * Remember that this student was edited.
   *
   * Because this is a Set, the same student
   * can be edited multiple times but will
   * only be saved once.
   */

  modifiedStudents.value.add(studentId)

}


/* =========================
   SAVE SCORES
========================= */

const saveScores = async () => {

  /*
   * Nothing changed.
   */

  if (!modifiedStudents.value.size) {

    toast.info(
      "No score changes to save."
    )

    return

  }


  loading.value = true


  try {

    const scoresToSave = []


    /*
     * Only collect students that were
     * actually modified.
     */

    for (
      const studentId of modifiedStudents.value
    ) {

      const item = scores.value[studentId]

      if (!item) continue


      scoresToSave.push({

        student: Number(studentId),

        score: Number(item.score)

      })

    }


    /*
     * Build the payload expected by
     * BulkSubjectScoreSerializer.
     */

    const payload = {

      exam: Number(selectedExam.value),

      subject: subject.value,

      scores: scoresToSave

    }


    /*
     * ONE HTTP REQUEST
     *
     * Backend decides whether each score
     * should be created or updated.
     */

    const result =
      await bulkSaveSubjectScores(payload)


    /*
     * Clear the modified set only after
     * successful saving.
     */

    modifiedStudents.value.clear()


    toast.success(
      `${result.total} score${
        result.total === 1 ? "" : "s"
      } saved successfully!`
    )


    /*
     * Reload from backend so the UI reflects
     * the actual persisted data.
     */

    await loadScores()


  } catch (error) {

    console.error(
      "Failed to save scores:",
      error
    )

    toast.error(
      "Failed to save scores. Please try again."
    )

  } finally {

    loading.value = false

  }

}


/* =========================
   WATCH EXAM
========================= */

watch(
  selectedExam,
  async () => {

    await loadScores()

  }
)


/* =========================
   WATCH ACTIVE CLASS
========================= */

watch(
  () => classStore.activeClass,

  async (newCls) => {

    if (newCls) {

      await loadExams()

      await loadStudents()

    }

  },

  {
    immediate: true
  }
)


/* =========================
   INITIAL LOAD
========================= */

onMounted(
  async () => {

    if (classStore.activeClass) {

      await loadExams()

      await loadStudents()

    }

  }
)

</script>