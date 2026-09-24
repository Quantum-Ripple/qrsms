<template>
  <div class="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 text-gray-800 text-sm sm:text-base">

    <button
      @click="goBack"
      class="text-sm text-blue-600 hover:underline"
    >
      ← Back to Attendance Management
    </button>

    <h2 class="text-xl sm:text-2xl font-semibold text-gray-800">
      {{ classDisplayName || 'Class Roll Call' }}
    </h2>

    <div class="flex flex-wrap gap-2 sm:gap-3 items-center">
      <select v-model="range" class="border px-2 py-2 rounded w-full sm:w-auto">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="custom">Custom</option>
      </select>

      <input
        v-if="range === 'custom'"
        type="date"
        v-model="from"
        class="border px-2 py-2 rounded w-full sm:w-auto"
      />
      <input
        v-if="range === 'custom'"
        type="date"
        v-model="to"
        class="border px-2 py-2 rounded w-full sm:w-auto"
      />

      <button
        @click="loadAttendance"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto transition"
      >
        Apply
      </button>

      <button
        @click="exportToExcel"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full sm:w-auto transition ml-auto"
      >
        Export to Excel
      </button>
    </div>

    <input
      type="text"
      v-model="search"
      class="border px-3 py-2 w-full mt-2 rounded text-sm sm:text-base"
      placeholder="Search student or status..."
    />

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <div class="overflow-x-auto mt-3">
      <table class="w-full border text-xs sm:text-sm md:text-base">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-2 py-1">Student</th>
            <th class="border px-2 py-1">Admission</th>
            <th class="border px-2 py-1" v-for="day in days" :key="day">
              {{ day }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="s in filteredStudents"
            :key="s.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="openStudentProfile(s)"
          >
            <td class="border px-2 py-1">{{ s.full_name }}</td>
            <td class="border px-2 py-1">{{ s.admission_number }}</td>

            <td class="border px-2 py-1 text-center" v-for="day in days" :key="day">
              <component
                :is="getStatusIcon(s.id, day)"
                class="w-4 h-4 sm:w-5 sm:h-5 mx-auto"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as attendanceApi from "../../api/attendance";
import { fetchRollCall } from "../../api/attendance";
import PresentIcon from "../../../teachers/components/icons/PresentIcon.vue";
import AbsentIcon from "../../../teachers/components/icons/AbsentIcon.vue";
import DocumentIcon from "../../../teachers/components/icons/UnavailableIcon.vue";
import LateIcon from "../../../teachers/components/icons/LateIcon.vue";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { useToast } from "vue-toastification";

const toast = useToast();

export default {
  props: {
    classInstanceId: { type: [String, Number], required: true },
  },

  data() {
    return {
      range: "daily",
      students: [],
      attendance: [],
      days: [],
      search: "",
      from: "",
      to: "",
      classDisplayName: "",
      errorMessage: "",
    };
  },

  computed: {
    filteredStudents() {
      const t = this.search.toLowerCase();
      return this.students.filter(
        (s) =>
          s.full_name.toLowerCase().includes(t) ||
          s.admission_number.toLowerCase().includes(t)
      );
    },
  },

  methods: {
    async loadRoster() {
      // The roll-call endpoint needs a date, but active enrollment
      // doesn't change day to day, so "today" is just used to pull
      // the current class roster — actual per-day status below comes
      // from the sessions grid, not from this call.
      try {
        const data = await fetchRollCall(
          this.classInstanceId,
          new Date().toISOString().split("T")[0]
        );
        this.classDisplayName = data.class_instance;
        this.students = data.students.map((s) => ({
          id: s.student_id,
          full_name: s.name,
          admission_number: s.admission_number,
        }));
      } catch (err) {
        console.error("Failed to load class roster:", err);
        toast.error("Failed to load class roster");
        this.errorMessage = "Could not load this class's roster.";
      }
    },

    computeDateRange() {
      const today = new Date();
      let from, to;

      if (this.range === "daily") {
        from = to = today;
      } else if (this.range === "weekly") {
        const day = today.getDay();
        const diffToMon = day === 0 ? 6 : day - 1;
        from = new Date(today);
        from.setDate(today.getDate() - diffToMon);
        to = today;
      } else if (this.range === "monthly") {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = today;
      } else if (this.range === "custom") {
        from = new Date(this.from);
        to = new Date(this.to);
      }

      const dates = [];
      const current = new Date(from);
      while (current <= to) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
          dates.push(current.toISOString().split("T")[0]);
        }
        current.setDate(current.getDate() + 1);
      }

      return dates;
    },

    async loadAttendance() {
      try {
        this.errorMessage = "";
        const dateRange = this.computeDateRange();

        const res = await attendanceApi.getAttendanceRecords({
          class_instance: this.classInstanceId,
        });

        this.attendance = res.filter((a) => dateRange.includes(a.date));
        this.days = dateRange;
      } catch (err) {
        toast.error("Failed to load attendance");
        console.error("Failed to load attendance:", err);
        this.errorMessage = "Could not load attendance for this range.";
      }
    },

    getStatusIcon(studentId, date) {
      const session = this.attendance.find((a) => a.date === date);
      if (!session) return DocumentIcon;

      const rec = session.records.find((r) => r.student === studentId);
      if (!rec) return DocumentIcon;

      switch (rec.status) {
        case "PRESENT":
          return PresentIcon;
        case "ABSENT":
          return AbsentIcon;
        case "LATE":
          return LateIcon;
        case "EXCUSED":
          return DocumentIcon;
        default:
          return DocumentIcon;
      }
    },

    getStatusText(studentId, date) {
      const session = this.attendance.find((a) => a.date === date);
      if (!session) return "N/A";

      const rec = session.records.find((r) => r.student === studentId);
      if (!rec) return "N/A";

      return rec.status;
    },

    exportToExcel() {
      const wsData = [["Student", "Admission #", ...this.days]];

      this.filteredStudents.forEach((s) => {
        const row = [
          s.full_name,
          s.admission_number,
          ...this.days.map((d) => this.getStatusText(s.id, d)),
        ];
        wsData.push(row);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `${this.classDisplayName || "attendance"}.xlsx`
      );
    },

    openStudentProfile(student) {
      this.$router.push({
        name: "StudentAttendanceProfile",
        params: { studentId: student.id },
        query: { fromClass: this.classInstanceId },
      });
    },

    goBack() {
      this.$router.push({ name: "PrincipalAttendanceManagement" });
    },
  },

  async mounted() {
    await this.loadRoster();
    await this.loadAttendance();
  },
};
</script>