<template>
  <div class="bg-white p-4 rounded-xl shadow">
    <h2 class="text-lg font-semibold mb-4">Top Students</h2>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b">
          <th>#</th>
          <th>Name</th>
          <th>Score</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(student, index) in data" :key="student.student__id">
          <td>{{ index + 1 }}</td>
          <td>
            {{ student.student__first_name }} {{ student.student__last_name }}
          </td>
          <td>{{ student.avg_score }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>