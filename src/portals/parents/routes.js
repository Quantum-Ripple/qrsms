import Dashboard from './views/Dashboard.vue'
import StudentsPage from './views/Students.vue'

import AttendancePage from './views/Attendance.vue'
import GradesPage from './views/Grades.vue'
import AnnouncementsPage from './views/Announcements.vue'
import Settings from './views/Settings.vue'
import FeeStatements from './components/Finance/FeeStatements.vue'
import FeeStructure from './components/Finance/FeeStructure.vue'
import FeeSummary from './components/Finance/FeeSummary.vue'
import OnlinePayment from './components/Finance/OnlinePayment.vue'

import NotesPage from './views/Notes.vue'
import AssignmentsPage from './views/Assignment.vue'
import AssignmentAttempt from './components/lms/AssignmentAttempt.vue'
import AssignmentResults from './components/lms/AssignmentResults.vue'



import EventDetail from './components/events/EventDetail.vue'
import Assessment from './views/Assessment.vue'



export default [
 
  { path: '', name: 'ParentDashboard', component: Dashboard },

  // Students
  { path: 'students', name: 'ParentStudent', component: StudentsPage },

  // Assignments
  { path: 'assignments', name: 'ParentAssignments', component: AssignmentsPage },
  { path: 'notes', name: 'ParentNotes', component: NotesPage },

  // Attendance
  { path: 'attendance', name: 'ParentAttendance', component: AttendancePage },

  // Grades
  { path: 'grades', name: 'ParentGrade', component: GradesPage },
  { path: 'assessments', name: 'ParentAssessment', component: Assessment },

  // Announcements
  { path: 'announcements', name: 'ParentAnnouncements', component: AnnouncementsPage },

  // Events
  { path: 'event-details/:id', name: 'ParentEventDetail', component: EventDetail, props: true },

  // Finance nested routes
  {
    path: 'finance',
    name: 'ParentFinance',
    redirect: { name: 'ParentFeeSummary' }, // default subpage
    children: [
      { path: 'overview', name: 'ParentFeeSummary', component: FeeSummary },
      { path: 'fee-structure', name: 'ParentFeeStructure', component: FeeStructure },
      { path: 'fee-statement', name: 'ParentFeeStatements', component: FeeStatements },
      { path: 'online-payment', name: 'ParentOnlinePayment', component: OnlinePayment },
    ],
  },


  { path: "assignments", name: "ParentAssignments", component: AssignmentsPage },
  { path: "assignments/:id/attempt", name: "ParentAssignmentAttempt", component: AssignmentAttempt },
  { path: "assignments/:id/result", name: "ParentAssignmentResult", component: AssignmentResults },
  // Settings
  { path: 'settings', name: 'ParentSettings', component: Settings },
]
