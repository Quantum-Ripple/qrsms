import Dashboard from './views/Dashboard.vue'
import StudentsPage from './views/Students.vue'
import AssignmentsPage from './views/Assignments.vue'
import AttendancePage from './views/Attendance.vue'
import GradesPage from './views/Grades.vue'
import AnnouncementsPage from './views/Announcements.vue'
import Settings from './views/Settings.vue'

// Finance components
import FeeStatements from './components/Finance/FeeStatements.vue'
import FeeStructure from './components/Finance/FeeStructure.vue'
import FeeSummary from './components/Finance/FeeSummary.vue'
import OnlinePayment from './components/Finance/OnlinePayment.vue'

// Event
import EventDetail from './components/events/EventDetail.vue'

export default [
  // Base dashboard
  { path: '', name: 'ParentDashboard', component: Dashboard },

  // Students
  { path: 'students', name: 'ParentStudent', component: StudentsPage },

  // Assignments
  { path: 'assignments', name: 'ParentAssignments', component: AssignmentsPage },

  // Attendance
  { path: 'attendance', name: 'ParentAttendance', component: AttendancePage },

  // Grades
  { path: 'grades', name: 'ParentGrade', component: GradesPage },

  // Announcements
  { path: 'announcements', name: 'ParentAnnouncements', component: AnnouncementsPage },

  // Events
  { path: 'event-details/:id', name: 'EventDetail', component: EventDetail, props: true },

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

  // Settings
  { path: 'settings', name: 'ParentSettings', component: Settings },
]
