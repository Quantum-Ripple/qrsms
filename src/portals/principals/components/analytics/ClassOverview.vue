<template>
  <div class="bg-white p-4 rounded-xl shadow">
    <h2 class="text-lg font-semibold mb-4">Class Overview</h2>

    <div class="grid grid-cols-2 gap-4">
      <div class="p-3 bg-gray-100 rounded">
        <p class="text-sm text-gray-500">Average Score</p>
        <p class="text-xl font-bold">{{ data.average_score }}</p>
      </div>

      <div class="p-3 bg-gray-100 rounded">
        <p class="text-sm text-gray-500">Students</p>
        <p class="text-xl font-bold">{{ data.student_count }}</p>
      </div>
    </div>
  </div>
</template>