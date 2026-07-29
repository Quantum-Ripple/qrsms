<template>
  <div class="space-y-6">


    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">
          Rubric Assessment
        </h1>
      </div>

      <div class="flex items-center gap-2">

        <span
          v-if="dirty"
          class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
        >
          Unsaved changes
        </span>

        <button
          @click="saveScores"
          :disabled="!canSave || saving"
          class="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span v-if="saving">Saving...</span>
          <span v-else>Save Scores</span>
        </button>

      </div>
    </div>

    <div
      v-if="message.text"
      :class="[
        'rounded-lg border px-4 py-3 text-sm',
        message.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      ]"
    >
      {{ message.text }}
    </div>


    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">

  
      <div class="rounded-xl border bg-white p-4 shadow-sm">

        <label class="mb-2 block text-sm font-semibold text-slate-700">
          Select Exam
        </label>

        <select
          v-model="selectedExam"
          :disabled="loading.exams || exams.length === 0"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        >

          <option :value="null" disabled>
            {{ loading.exams ? "Loading exams..." : "Choose exam" }}
          </option>

          <option
            v-for="exam in exams"
            :key="exam.id"
            :value="exam.id"
          >
            {{ exam.name }}
          </option>

        </select>

      </div>


      <div class="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">

        <label class="mb-2 block text-sm font-semibold text-slate-700">
          Add Substrand to Rubric Table
        </label>

        <div class="flex flex-col gap-2 sm:flex-row">

          <select
            v-model="selectedSubstrand"
            :disabled="loading.substrands || substrands.length === 0 || !selectedExam"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          >

            <option :value="null" disabled>
              {{ loading.substrands ? "Loading substrands..." : "Choose substrand" }}
            </option>

            <option
              v-for="sub in availableSubstrands"
              :key="sub.id"
              :value="sub"
            >
              {{ sub.name }}
            </option>

          </select>

          <button
            @click="addSubstrand"
            :disabled="!selectedSubstrand"
            class="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>

        </div>


        <div
          class="mt-3 flex flex-wrap gap-2"
          v-if="substrandsInTable.length"
        >

          <div
            v-for="sub in substrandsInTable"
            :key="sub.id"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
          >

            <span>{{ sub.name }}</span>

            <button
              @click="removeSubstrand(sub.id)"
              class="text-slate-500 transition hover:text-red-600"
            >
              ✕
            </button>

          </div>

        </div>

      </div>

    </div>


    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Students
        </div>
        <div class="mt-1 text-2xl font-bold text-slate-800">
          {{ students.length }}
        </div>
      </div>

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Substrands
        </div>
        <div class="mt-1 text-2xl font-bold text-slate-800">
          {{ substrandsInTable.length }}
        </div>
      </div>

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Completed Cells
        </div>
        <div class="mt-1 text-2xl font-bold text-slate-800">
          {{ completedCells }}/{{ totalCells }}
        </div>
      </div>

    </div>


    <div class="rounded-xl border bg-white shadow-sm">

      <div
        v-if="loading.students || loading.scores"
        class="p-8 text-center text-sm text-slate-500"
      >
        Loading rubric data...
      </div>

      <div
        v-else-if="!selectedExam"
        class="p-8 text-center text-sm text-slate-500"
      >
        Select an exam to begin.
      </div>

      <div
        v-else-if="students.length === 0"
        class="p-8 text-center text-sm text-slate-500"
      >
        No students found for the selected class.
      </div>

      <div
        v-else-if="substrandsInTable.length === 0"
        class="p-8 text-center text-sm text-slate-500"
      >
        Add at least one substrand to start entering rubric levels.
      </div>


      <div v-else class="overflow-x-auto">

        <table class="min-w-full border-separate border-spacing-0 text-sm">

          <thead class="bg-slate-100">

            <tr>

              <th class="sticky left-0 z-20 border-b bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700">
                Student
              </th>

              <th
                v-for="sub in substrandsInTable"
                :key="sub.id"
                class="border-b px-4 py-3 text-center font-semibold text-slate-700 min-w-[160px]"
              >
                {{ sub.name }}
              </th>

              <th class="border-b px-4 py-3 text-center font-semibold text-slate-700 min-w-[90px]">
                Done
              </th>

              <th class="sticky right-0 z-20 border-b bg-slate-100 px-4 py-3 text-center font-semibold text-slate-700 min-w-[90px]">
                Total
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="student in students"
              :key="student.id"
              class="odd:bg-white even:bg-slate-50 hover:bg-blue-50/40"
            >

              <td class="sticky left-0 z-10 border-b bg-inherit px-4 py-3 font-medium text-slate-800">

                <div>{{ student.full_name }}</div>

                <div class="text-xs text-slate-500">
                  {{ student.admission_number || "No admission no." }}
                </div>

              </td>


              <td
                v-for="sub in substrandsInTable"
                :key="sub.id"
                class="border-b px-3 py-2"
              >

                <select
                  class="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  :value="getCellValue(student.id, sub.id)"
                  @change="updateCell(student.id, sub.id, $event.target.value)"
                >

                  <option value="">-- Select --</option>

                  <option
                    v-for="level in performanceLevels"
                    :key="level"
                    :value="level"
                  >
                    {{ level }}
                  </option>

                </select>

              </td>


              <td class="border-b px-4 py-3 text-center font-medium text-slate-700">
                {{ studentCompletedCount(student.id) }}/{{ substrandsInTable.length }}
              </td>


              <td class="sticky right-0 z-10 border-b bg-inherit px-4 py-3 text-center font-bold text-blue-700">
                {{ totals[student.id] || 0 }}
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>



    <div class="rounded-xl border bg-white p-4 shadow-sm">

      <div class="mb-3 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-800">
            Performance Guide
          </h2>
          <p class="text-xs text-slate-500">
            Point equivalents used for totals.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">

        <div
          v-for="level in performanceLevels"
          :key="level"
          class="rounded-lg border bg-slate-50 px-3 py-2 text-center"
        >

          <div class="font-semibold text-slate-800">
            {{ level }}
          </div>

          <div class="text-xs text-slate-500">
            {{ levelPoints[level] }} pts
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { useClassStore } from "@/stores/classStore"
import { getExams } from "@/portals/teachers/api/Grades"
import studentsApi from "../../api/Students.js"

import {
  getSubStrands,
  getRubricScores,
  bulkSaveRubricScores
} from "../../api/assessments"

const classStore = useClassStore()



const exams = ref([])
const selectedExam = ref(null)

const substrands = ref([])
const selectedSubstrand = ref(null)
const substrandsInTable = ref([])

const students = ref([])
const rubricScores = ref({})

const loading = ref({
  exams: false,
  substrands: false,
  students: false,
  scores: false
})

const saving = ref(false)
const dirty = ref(false)

const message = ref({
  type: "",
  text: ""
})



const performanceLevels = [
  "EE1","EE2","ME1","ME2","AE1","AE2","BE1","BE2"
]

const levelPoints = {
  EE1:8,
  EE2:7,
  ME1:6,
  ME2:5,
  AE1:4,
  AE2:3,
  BE1:2,
  BE2:1
}


const showMessage = (type,text)=>{
  message.value={type,text}
  setTimeout(()=>{
    message.value={type:"",text:""}
  },3500)
}


const availableSubstrands = computed(()=>{
  const used=new Set(substrandsInTable.value.map(s=>s.id))
  return substrands.value.filter(s=>!used.has(s.id))
})

const totalCells = computed(()=>{
  return students.value.length * substrandsInTable.value.length
})

const completedCells = computed(()=>{
  let count=0
  students.value.forEach(student=>{
    substrandsInTable.value.forEach(sub=>{
      const key=`${student.id}_${sub.id}`
      if(rubricScores.value[key]?.performance_level) count++
    })
  })
  return count
})

const totals = computed(()=>{
  const result={}
  students.value.forEach(student=>{
    let sum=0
    substrandsInTable.value.forEach(sub=>{
      const key=`${student.id}_${sub.id}`
      const score=rubricScores.value[key]
      if(score?.performance_level){
        sum+=levelPoints[score.performance_level]??0
      }
    })
    result[student.id]=sum
  })
  return result
})

const canSave = computed(()=>{
  return !!selectedExam.value && substrandsInTable.value.length>0 && dirty.value
})


const normalizeScores=(scores=[])=>{
  const map={}
  scores.forEach(score=>{
    const key=`${score.student}_${score.substrand}`
    map[key]=score
  })
  rubricScores.value=map
}


const loadExams=async()=>{
  const cls=classStore.activeClass
  if(!cls) return

  loading.value.exams=true
  try{

    const all=await getExams()

    exams.value=all.filter(e=>{
      if (cls.class_instance && e.class_instance) {
        return String(e.class_instance)===String(cls.class_instance)
      }

      return e.class_level===cls.class_level &&
        e.stream===cls.stream
    })

    selectedExam.value=exams.value.length?exams.value[0].id:null

  }catch(err){
    console.error(err)
    showMessage("error","Failed to load exams")
  }finally{
    loading.value.exams=false
  }
}



const loadSubStrands = async () => {
  const cls = classStore.activeClass
  if (!cls) return

  loading.value.substrands = true
  try {
    const data = await getSubStrands(cls.subject, cls.class_instance)
    substrands.value = Array.isArray(data) ? data : data.results ?? []
  } catch (err) {
    console.error(err)
    showMessage("error", "Failed to load substrands")
  } finally {
    loading.value.substrands = false
  }
}


const loadStudentsAndScores=async()=>{

  if(!selectedExam.value){
    students.value=[]
    rubricScores.value={}
    substrandsInTable.value=[]
    return
  }

  const cls=classStore.activeClass
  if(!cls) return

  loading.value.students=true
  loading.value.scores=true

  try{

    const res=await studentsApi.filter(cls.class_level,cls.stream,cls.subject)
    students.value=Array.isArray(res)?res:res.results??[]

    const scores=await getRubricScores(selectedExam.value)

    normalizeScores(scores)

    const usedSubstrandIds=[
      ...new Set(scores.map(s=>String(s.substrand)))
    ]

    substrandsInTable.value=substrands.value.filter(s=>
      usedSubstrandIds.includes(String(s.id))
    )

    dirty.value=false

  }catch(err){
    console.error(err)
    showMessage("error","Failed to load rubric data")
  }finally{
    loading.value.students=false
    loading.value.scores=false
  }
}


const addSubstrand=()=>{
  if(!selectedSubstrand.value) return

  const exists=substrandsInTable.value.some(
    s=>s.id===selectedSubstrand.value.id
  )

  if(exists) return

  substrandsInTable.value.push(selectedSubstrand.value)
  selectedSubstrand.value=null
  dirty.value=true
}

const removeSubstrand=(id)=>{
  substrandsInTable.value=
    substrandsInTable.value.filter(s=>s.id!==id)
  dirty.value=true
}

const getCellValue=(studentId,substrandId)=>{
  const key=`${studentId}_${substrandId}`
  return rubricScores.value[key]?.performance_level ?? ""
}

const updateCell = (studentId, substrandId, level) => {

  const key = `${studentId}_${substrandId}`

  if (!level) {
    delete rubricScores.value[key]
  } else {

    rubricScores.value[key] = {
      student: studentId,
      substrand: substrandId,
      exam: selectedExam.value,
      performance_level: level
    }

  }

  dirty.value = true
}

const studentCompletedCount=(studentId)=>{
  let count=0
  substrandsInTable.value.forEach(sub=>{
    const key=`${studentId}_${sub.id}`
    if(rubricScores.value[key]?.performance_level) count++
  })
  return count
}



const saveScores = async () => {

  if (!selectedExam.value) return

  saving.value = true

  try {

    const scoresArray = Object.values(rubricScores.value)
      .filter(s => s.student && s.substrand && s.performance_level)
      .map(s => ({
        student: s.student,
        substrand: s.substrand,
        performance_level: s.performance_level
      }))

    await bulkSaveRubricScores({
      exam: selectedExam.value,
      scores: scoresArray
    })

    showMessage("success", "Scores saved successfully")
    dirty.value = false

  } catch (err) {

    console.error("Error saving rubric scores:", err)
    showMessage("error", "Failed to save scores")

  } finally {

    saving.value = false

  }

}



watch(selectedExam,async()=>{
  await loadStudentsAndScores()
})

watch(()=>classStore.activeClass,async(newCls)=>{
  if(newCls){
    await loadSubStrands()
    await loadExams()
    await loadStudentsAndScores()
  }
})



onMounted(async()=>{
  await loadSubStrands()
  await loadExams()
  if(selectedExam.value){
    await loadStudentsAndScores()
  }
})
</script>