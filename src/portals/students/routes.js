import DashboardLayout from './layouts/DashboardLayout.vue'
import Dashboard from './views/Dashboard.vue'
import AnnouncementsPage from './views/Announcements.vue'
import NotesPage from './views/Notes.vue'
import PerformancePage from './views/Performance.vue'
import Assignments from './views/Assignments.vue'
import Settings from './views/Settings.vue'
import EventDetail from './components/events/EventDetail.vue'
import AssignmentStart from './components/lms/AssignmentStart.vue'
import QuestionPage from './components/lms/QuestionPage.vue'
import Simulations from './views/Simulations.vue'

export default [
  {
    path: '',
    name: 'StudentDashboard',
    component: Dashboard,
  },
  {
    path: 'announcements',
    name: 'StudentAnnouncements',
    component: AnnouncementsPage,
  },
  {
    path: 'announcements/:id',
    name: 'StudentEventDetail',
    component: EventDetail,
    props: true,
  },
  {
    path: 'virtual lab',
    name: 'StudentSimulations',
    component: Simulations,
  },
   {
    path: 'notes',
    name: 'StudentNotes',
    component: NotesPage,
  },
  {
    path: 'performance',
    name: 'StudentPerformance',
    component: PerformancePage,
  },
  {
    path: 'assignments',
    name: 'StudentAssignments',
    component: Assignments,
  },
  {
    path: 'assignments/:id/start',
    name: 'StudentAssignmentStart',
    component: AssignmentStart,
    props: true,
  },
  {
    path: 'assignments/:assignmentId/questions/:questionIndex',
    name: 'StudentQuestionPage',
    component: QuestionPage,
    props: true,
  },
  {
    path: 'settings',
    name: 'StudentSettings',
    component: Settings,
  },
]
