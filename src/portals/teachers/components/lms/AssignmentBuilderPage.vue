<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from './QuestionCard.vue'
import { postAssignment } from '../../api/lms'
import { useClassStore } from '@/stores/classStore'

const route = useRoute()
const router = useRouter()
const classStore = useClassStore()

const assignment = reactive({
  title: route.query.title || '',
  subject: route.query.subject || '',
  class_level: route.query.class_level || '',
  stream: route.query.stream || '',
  class_instance: route.query.class_instance || classStore.activeClass?.class_instance || '',
  due_date: route.query.due_date || '',
  questions: []
})

onMounted(() => {
  if (assignment.questions.length === 0) {
    addQuestion('multiple') 
  }
})

const addQuestion = (type) => {
  assignment.questions.push({
    id: crypto.randomUUID(),
    type,
    text: '',
    points: 1,
    options:
      type === 'multiple'
        ? [
            { id: crypto.randomUUID(), text: '', is_correct: false },
            { id: crypto.randomUUID(), text: '', is_correct: false }
          ]
        : [],
    correct_answer: null
  })
}

const removeQuestion = (index) => {
  assignment.questions.splice(index, 1)
}



const submitAssignment = async () => {

  for (const q of assignment.questions) {
    if (!q.text.trim()) {
      alert('Each question must have text')
      return
    }
    if (q.type === 'multiple') {
      if (q.options.some(o => !o.text.trim())) {
        alert('All options must have text')
        return
      }
    }
  }

  const payload = {
    ...assignment,
    questions: assignment.questions.map(q => ({
      id: q.id,
      type: q.type,
      text: q.text,
      points: q.points,
      correct_answer: q.correct_answer,
      options: q.type === 'multiple' ? q.options : undefined
    }))
  }

  try {
    //console.log(JSON.stringify(payload, null, 2))
    const response = await postAssignment(payload)
    
    alert('Assignment posted successfully!')
   
    router.push({ name: 'TeachersAssignmentsPage' })
  } catch (err) {
    console.error('Assignment submission failed:', err)
    alert('Failed to post assignment. Please try again.')
  }
}
</script>


<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Create Assignment</h2>


    <div class="mb-6">
      <p><strong>Title:</strong> {{ assignment.title }}</p>
      <p><strong>Subject:</strong> {{ assignment.subject }}</p>
      <p><strong>Class:</strong> {{ assignment.class_level_name }} – {{ assignment.stream_name }}</p>
      <p><strong>Deadline:</strong> {{ assignment.due_date }}</p>
    </div>

  
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Questions</h3>

      <QuestionCard
        v-for="(q, i) in assignment.questions"
        :key="q.id"
        :question="q"
        @remove="removeQuestion(i)"
        
      />
    </div>

    <button
  @click="addQuestion('multiple')"
     class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
     Add Question
   </button>


 
    <div class="mt-6 flex justify-end gap-3">
      <button
        @click="submitAssignment"
        class="px-4 py-2 bg-green-600 text-white rounded"
      >
        Post Assignment
      </button>
    </div>
  </div>
</template>
