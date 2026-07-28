<template>

<div class="space-y-6">

<h2 class="text-xl font-bold">{{ subject }} Scores</h2>

<div class="flex gap-4 items-center">

<select v-model="selectedExam" class="border rounded px-3 py-2">

<option v-for="exam in exams" :key="exam.id" :value="exam.id">
{{ exam.name }}
</option>

</select>

</div>


<div v-if="students.length" class="overflow-x-auto border rounded">

<table class="min-w-full text-sm">

<thead class="bg-gray-100">

<tr>
<th class="p-3">Student</th>
<th class="p-3">Score (%)</th>
<th class="p-3">Level</th>
</tr>

</thead>

<tbody>

<tr v-for="student in students" :key="student.id">

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
@input="updateScore(student.id,$event.target.value)"
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

<button
@click="saveScores"
class="bg-blue-600 text-white px-6 py-2 rounded"
>
Save Scores
</button>

</div>

</div>

</template>


<script setup>

import { ref, watch, onMounted, computed } from "vue"
import { useClassStore } from "@/stores/classStore"
import { useToast } from "vue-toastification"
import { getExams } from "@/portals/teachers/api/Grades"
import studentsApi from "../../api/Students"

import {
getSubjectScores,
createSubjectScore,
updateSubjectScore
} from "../../api/assessments"


const classStore = useClassStore()
const toast = useToast()

const exams = ref([])
const selectedExam = ref(null)

const students = ref([])
const scores = ref({})

const subject = computed(() => classStore.activeClass?.subject)


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


const loadExams = async () => {

const cls = classStore.activeClass
if (!cls) return

const all = await getExams()

exams.value = all.filter(e =>
e.class_level === cls.class_level &&
e.stream === cls.stream
)

if (exams.value.length)
selectedExam.value = exams.value[0].id

}


const loadStudents = async () => {

const cls = classStore.activeClass
if (!cls) return

try {
  const res = await studentsApi.filter(cls.class_level,cls.stream)
  students.value = Array.isArray(res) ? res : res.results ?? []
  //console.log("students", students.value)
} catch (error) {
  console.error("Failed to load students:", error)
}

}


const loadScores = async () => {

if (!selectedExam.value || !subject.value) return

const data = await getSubjectScores(selectedExam.value, subject.value)

const map = {}

data.forEach(s=>{
map[s.student] = s
})

scores.value = map

}


const getScore = (studentId) => {
return scores.value[studentId]?.score ?? ""
}


const getLevel = (studentId) => {

const score = getScore(studentId)

if (!score) return ""

return levelFromScore(score)

}


const updateScore = (studentId,score) => {

scores.value[studentId] = {
...scores.value[studentId],
student: studentId,
exam: selectedExam.value,
subject: subject.value,
score
}

}


const saveScores = async () => {

        for (const studentId in scores.value){

        const item = scores.value[studentId]

        if(item.id){
        await updateSubjectScore(item.id,item)
        toast.success("Score updated Successfully!")
        }else{
        await createSubjectScore(item)
        toast.success("Score saved Successfully!")
        }

        }

}


watch(selectedExam, async ()=>{
await loadScores()
})

watch(() => classStore.activeClass, async (newCls) => {
  if (newCls) {
    await loadExams()
    await loadStudents()
  }
}, { immediate: true })


onMounted(async ()=>{
  // Initial load if activeClass is already set
  if (classStore.activeClass) {
    await loadExams()
    await loadStudents()
  }
})

</script>