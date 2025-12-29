<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center p-4">
 
    <p v-if="loading" class="text-gray-500">Loading questions...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>

    <div
      v-if="!loading && currentQuestion"
      class="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 mb-6 flex flex-col justify-between"
      style="min-height: 65vh; "
    >
    
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          Question {{ questionIndex + 1 }} / {{ questions.length }}
        </h2>

        <component
          :is="questionComponent"
          :question="currentQuestion"
          v-model="answers[currentQuestion.id]"
        />
      </div>
    </div>

  
    <div v-if="!loading && questions.length" class="w-full max-w-4xl flex justify-between">
      <button
        @click="prevQuestion"
        :disabled="questionIndex === 0"
        class="px-8 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 transition disabled:opacity-50"
      >
        Back
      </button>

      <button
        v-if="questionIndex < questions.length - 1"
        @click="nextQuestion"
        class="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
      >
        Next
      </button>

      <button
        v-else
        @click="submitAnswers"
        class="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import TrueFalse from './QuestionTypes/TrueFalse.vue';
import MultipleChoice from './QuestionTypes/MultipleChoice.vue';
import ShortAnswer from './QuestionTypes/ShortAnswer.vue';
import LongAnswer from './QuestionTypes/LongAnswer.vue';
import { getAssignments,submitAssignment } from '../../api/lms';



export default {
  components: { TrueFalse, MultipleChoice, ShortAnswer, LongAnswer },
  data() {
    return {
      questions: [],
      questionIndex: parseInt(this.$route.params.questionIndex),
      answers: {},
      loading: true,
      error: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.questionIndex] || null;
    },
    questionComponent() {
      if (!this.currentQuestion) return 'div';
      switch (this.currentQuestion.type) {
        case 'true_false':
          return 'TrueFalse';
        case 'multiple':
          return 'MultipleChoice';
        case 'essay':
          return 'LongAnswer';
        case 'short':
          return 'ShortAnswer';
        default:
          return 'div';
      }
    },
  },
  async created() {
    try {
      const assignmentId = this.$route.params.assignmentId;
      const allAssignments = await getAssignments();
      const assignment = allAssignments.find(a => a.id == assignmentId);

      if (!assignment) {
        this.error = 'Assignment not found';
        return;
      }

 
      this.questions = assignment.questions.sort((a, b) => a.order - b.order);

      this.questions.forEach(q => {
        if (q.type === 'multiple') this.$set(this.answers, q.id, []);
        else if (q.type === 'true_false') this.$set(this.answers, q.id, null);
        else this.$set(this.answers, q.id, '');
      });
    } catch (err) {
      console.error(err);
      this.error = 'Failed to load assignment';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    nextQuestion() {
      if (this.questionIndex < this.questions.length - 1) this.questionIndex++;
    },
    prevQuestion() {
      if (this.questionIndex > 0) this.questionIndex--;
    },

    async submitAnswers() {
  this.submitting = true;
  try {
    const assignmentId = this.$route.params.assignmentId;

 
    const answersList = Object.keys(this.answers).map(qId => {
      const question = this.questions.find(q => q.id == qId);
      if (!question) return null;

      if (question.type === 'multiple') {
       
        return { question: qId, selected_options: this.answers[qId], answer_text: null };
      } else {
        
        let ans = this.answers[qId];

       
        if (Array.isArray(ans)) {
          ans = ans.join(', ');  
        } else if (ans === null || ans === undefined) {
          ans = '';
        } else {
          ans = ans.toString();
        }

        return { question: qId, selected_options: null, answer_text: ans };
      }
    }).filter(Boolean);

    await submitAssignment(assignmentId, answersList);
    alert('Assignment submitted successfully!');
    this.$router.push({name: "Assignments"});
  } catch (err) {
    console.error("Failed to submit assignment:", err);
    alert('Failed to submit assignment. Check console for details.');
  } finally {
    this.submitting = false;
  }
}

  },
};
</script>
