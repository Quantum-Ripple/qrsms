<!--<template>
  <div class="p-6 space-y-8">
    
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-400">Performance Dashboard</h2>

      <div>
        <label class="font-semibold mr-2">Select Exam:</label>
        <select
          v-model="selectedExam"
          @change="loadPerformance"
          class="border px-2 py-1 rounded"
        >
          <option disabled value="">-- Choose Exam --</option>
          <option v-for="exam in exams" :key="exam.id" :value="exam.id">
            {{ exam.name }} ({{ exam.term }}, {{ exam.academic_year }})
          </option>
        </select>
      </div>
    </div>

    
    <div v-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="isLoading" class="text-gray-500">Loading performance data...</div>

    <div v-else>
      <div v-if="noGrades" class="text-center text-gray-500">
        No grades recorded for this exam yet.
      </div>

      <div v-else class="grid gap-6">
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-4">Score Distribution (Student Averages)</h3>
          <table class="min-w-full border border-gray-300 text-center">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 border">Range</th>
                <th class="px-4 py-2 border">Number of Students</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="range in sortedRanges" :key="range">
                <td class="px-4 py-2 border">{{ range }}</td>
                <td class="px-4 py-2 border">{{ scoreDistribution[range] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getExams, getExamGrades } from "../../api/Grades";
 import { useClassStore } from "@/stores/classStore"
import { watch } from "vue"

const classStore = useClassStore()

const exams = ref([]);
const selectedExam = ref("");
const isLoading = ref(false);
const error = ref("");
const scoreDistribution = ref({});
const noGrades = ref(true);

const classLevel = ref("")
const stream = ref("")

watch(
  () => classStore.activeClass,
  async (cls) => {
    if (!cls) return

    classLevel.value = cls.class_level
    stream.value = cls.stream

    await loadExams()
  },
  { immediate: true }
)

/*const loadActiveClass = () => {
  const active = JSON.parse(localStorage.getItem("activeClass") || "{}")
  classLevel.value = active.class_level
  stream.value = active.stream

}*/

const sortedRanges = computed(() => {
  const ranges = Object.keys(scoreDistribution.value).filter(k => k.includes("-"));
  return ranges.sort((a, b) => {
    const [amin] = a.split("-").map(Number);
    const [bmin] = b.split("-").map(Number);
    return bmin - amin;
  });
});

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};


const computeStudentDistributions = (grades) => {
  const byStudent = {};
  grades.forEach((g) => {
    const id = g.student_obj?.id;
    if (!id) return;
    if (!byStudent[id]) byStudent[id] = [];
    byStudent[id].push(toNum(g.score));
  });

  const averages = Object.values(byStudent).map(scores => {
    const sum = scores.reduce((a, b) => a + b, 0);
    return scores.length ? sum / scores.length : 0;
  });

  const dist = {};
  for (let i = 0; i < 10; i++) {
    const min = i * 10;
    const max = (i + 1) * 10;
    const label = `${min}-${max}`;
    dist[label] = averages.filter(avg => avg >= min && avg < max).length;
  }

  
  dist["90-100"] += dist["100"] || 0;
  delete dist["100"];

  scoreDistribution.value = dist;
};


const loadPerformance = async () => {
  if (!selectedExam.value) return;
  isLoading.value = true;
  error.value = "";
  noGrades.value = true;

  try {
    const grades = await getExamGrades(selectedExam.value);
    const rows = Array.isArray(grades) ? grades : (grades.results || grades.data || []);
    if (!rows.length) {
      noGrades.value = true;
      return;
    }

    noGrades.value = false;
    computeStudentDistributions(rows);
  } catch (err) {
    console.error(err);
    error.value = "Failed to load grades";
  } finally {
    isLoading.value = false;
  }
};


const loadExams = async () => {
  try {
    const res = await getExams();
    const list = Array.isArray(res) ? res : (res.results ?? []);
    console.log("Active class:", classLevel.value, stream.value)
console.log("All exams:", list)
    const filtered = list.filter(
        exam =>
          exam.class_level === classLevel.value &&
          exam.stream === stream.value
      )

      exams.value = filtered
      console.log("Filtered exams:", filtered)
    if (exams.value.length) {
      selectedExam.value = exams.value[exams.value.length - 1].id
      await loadPerformance()
    }
  } catch (err) {
    error.value = "Failed to load exams";
  }
};


</script>-->

<template>
  <div class="p-6 space-y-8">

    
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-slate-800">
        Performance
      </h2>

      <div>
        <label class="text-sm font-semibold mr-2">Assessment:</label>

        <select
          v-model="selectedExam"
          @change="loadPerformance"
          class="border rounded-lg px-3 py-1 text-sm"
        >
          <option disabled value="">Choose Exam</option>

          <option
            v-for="exam in exams"
            :key="exam.id"
            :value="exam.id"
          >
            {{ exam.name }} ({{ exam.term }}, {{ exam.academic_year }})
          </option>
        </select>
      </div>
    </div>



    <div v-if="error" class="text-red-600">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="text-gray-500">
      Loading performance data...
    </div>


    <div v-else>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div class="bg-white rounded-xl shadow p-5 text-center">
          <div class="text-xs text-gray-500">Students</div>
          <div class="text-2xl font-bold text-blue-700">
            {{ studentsCount }}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-5 text-center">
          <div class="text-xs text-gray-500">Class Average</div>
          <div class="text-2xl font-bold text-emerald-600">
            {{ classAverage.toFixed(1) }}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-5 text-center">
          <div class="text-xs text-gray-500">Highest Score</div>
          <div class="text-2xl font-bold text-indigo-600">
            {{ highestScore }}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-5 text-center">
          <div class="text-xs text-gray-500">Lowest Score</div>
          <div class="text-2xl font-bold text-rose-600">
            {{ lowestScore }}
          </div>
        </div>

      </div>



      <div class="bg-white rounded-xl shadow p-6">

        <h3 class="font-semibold mb-4 text-lg">
          Performance Levels
        </h3>

        <div
          v-for="(count, level) in levelDistribution"
          :key="level"
          class="flex items-center gap-4 mb-2"
        >

          <div class="w-12 font-semibold">
            {{ level }}
          </div>

          <div class="flex-1 bg-gray-200 rounded h-4 overflow-hidden">
            <div
              class="bg-emerald-500 h-full"
              :style="{ width: studentsCount ? (count / studentsCount * 100) + '%' : '0%' }"
            ></div>
          </div>

          <div class="w-6 text-sm text-gray-600">
            {{ count }}
          </div>

        </div>

      </div>


      <div class="bg-white rounded-xl shadow p-6">

        <h3 class="font-semibold mb-4 text-lg">
          Score Distribution
        </h3>

        <table class="w-full text-sm text-center border">

          <thead class="bg-slate-100">
            <tr>
              <th class="p-2 border">Range</th>
              <th class="p-2 border">Students</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="range in sortedRanges"
              :key="range"
            >
              <td class="border p-2">
                {{ range }}
              </td>

              <td class="border p-2">
                {{ scoreDistribution[range] }}
              </td>
            </tr>
          </tbody>

        </table>

      </div>

    </div>

  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted, onActivated } from "vue"
import { getExams, getExamGrades } from "../../api/Grades"
import { useClassStore } from "@/stores/classStore"

const classStore = useClassStore()

const exams = ref([])
const selectedExam = ref("")

const isLoading = ref(false)
const error = ref("")

const scoreDistribution = ref({})
const studentScores = ref([])

const classLevel = ref("")
const stream = ref("")


const ensureActiveClass = () => {
  if (!classStore.activeClass) {
    classStore.loadInitialClass()
  }
}


const syncFromActiveClass = async (cls) => {
  if (!cls) return

  classLevel.value = cls.class_level
  stream.value = cls.stream

  exams.value = []
  selectedExam.value = ""
  studentScores.value = []
  scoreDistribution.value = {}

  await loadExams()
}


watch(
  () => classStore.activeClass,
  async (cls) => {
    await syncFromActiveClass(cls)
  },
  { immediate: true }
)


const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}



const levelFromScore = (score) => {

  const value = Number(score)

  if (value >= 90) return "EE1"
  if (value >= 75) return "EE2"
  if (value >= 58) return "ME1"
  if (value >= 41) return "ME2"
  if (value >= 31) return "AE1"
  if (value >= 21) return "AE2"
  if (value >= 11) return "BE1"

  return "BE2"

}



const computeStudentDistributions = (grades) => {

  const byStudent = {}

  grades.forEach((g) => {

    const id = g.student_obj?.id

    if (!id) return

    if (!byStudent[id]) byStudent[id] = []

    byStudent[id].push(toNum(g.score))

  })


  const averages = Object.values(byStudent).map(scores => {

    const sum = scores.reduce((a, b) => a + b, 0)

    return scores.length ? sum / scores.length : 0

  })


  studentScores.value = averages


  const dist = {}

  for (let i = 0; i < 10; i++) {

    const min = i * 10
    const max = (i + 1) * 10

    const label = `${min}-${max}`

    dist[label] = averages.filter(avg =>
      avg >= min && avg < max
    ).length

  }


  dist["90-100"] += dist["100"] || 0
  delete dist["100"]

  scoreDistribution.value = dist

}



const studentsCount = computed(() => {
  return studentScores.value.length
})

const classAverage = computed(() => {

  if (!studentScores.value.length) return 0

  const sum = studentScores.value.reduce((a, b) => a + b, 0)

  return sum / studentScores.value.length

})

const highestScore = computed(() => {

  if (!studentScores.value.length) return 0

  return Math.max(...studentScores.value).toFixed(1)

})

const lowestScore = computed(() => {

  if (!studentScores.value.length) return 0

  return Math.min(...studentScores.value).toFixed(1)

})



const levelDistribution = computed(() => {

  const levels = {
    EE1: 0,
    EE2: 0,
    ME1: 0,
    ME2: 0,
    AE1: 0,
    AE2: 0,
    BE1: 0,
    BE2: 0
  }

  studentScores.value.forEach(score => {

    const level = levelFromScore(score)

    levels[level]++

  })

  return levels

})



const sortedRanges = computed(() => {

  const ranges = Object.keys(scoreDistribution.value)

  return ranges.sort((a, b) => {

    const [amin] = a.split("-").map(Number)
    const [bmin] = b.split("-").map(Number)

    return bmin - amin

  })

})



const loadPerformance = async () => {

  if (!selectedExam.value) return

  isLoading.value = true
  error.value = ""

  try {

    const grades = await getExamGrades(selectedExam.value)

    const rows = Array.isArray(grades)
      ? grades
      : (grades.results || grades.data || [])

    if (!rows.length) {

      studentScores.value = []
      scoreDistribution.value = {}

      return

    }

    computeStudentDistributions(rows)

  } catch (err) {

    console.error(err)

    error.value = "Failed to load grades"

  } finally {

    isLoading.value = false

  }

}



const loadExams = async () => {

  try {

    const res = await getExams()

    const list = Array.isArray(res)
      ? res
      : (res.results ?? [])

    const filtered = list.filter(exam =>
      exam.class_level === classLevel.value &&
      exam.stream === stream.value
    )

    exams.value = filtered

    if (exams.value.length) {
      selectedExam.value = exams.value[exams.value.length - 1].id
    } else {
      selectedExam.value = ""
    }

  } catch (err) {

    error.value = "Failed to load exams"

  }

}

watch(selectedExam, async (examId) => {
  if (!examId) return
  await loadPerformance()
})

onMounted(async () => {
  ensureActiveClass()
  if (classStore.activeClass) {
    await syncFromActiveClass(classStore.activeClass)
  }
})

onActivated(async () => {
  ensureActiveClass()
  await syncFromActiveClass(classStore.activeClass)
})
</script>
