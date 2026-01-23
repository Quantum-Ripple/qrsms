import Dashboard from './views/Dashboard.vue'
import StudentsPage from './views/Students.vue'
import AttendancePage from './views/Attendance.vue'
import GradesPage from './views/Grades.vue'
import AnnouncementsPage from './views/Announcements.vue'

import PerformancePage from './views/Performance.vue'
import Settings from './views/Settings.vue'
import StudentsDetail from './components/StudentDetails.vue'
import CreateExam from './components/grades/CreateExam.vue'
import GradeDetails from './components/grades/GradeDetails.vue'
import ListGrades from './components/grades/ListGrades.vue'
import AddGrades from './components/grades/AddGrades.vue'
import EventDetail from './components/events/EventDetail.vue'
import MarkAttendance from './components/attendance/MarkAttendance.vue'
import EditAttendance from './components/attendance/EditAttendance.vue'
import AssignmentPage from './components/lms/AssignmentPage.vue'
import AssignmentBuilderPage from './components/lms/AssignmentBuilderPage.vue'
import ResultsPage from './components/lms/ResultsPage.vue'
import StudentAssignmentResponse from './components/lms/StudentAssignmentResponse.vue'

export default [
  {
    path: '',
    name: 'TeachersDashboard', 
    component: Dashboard,
  },
  {
    path: 'students',
    name: 'TeachersStudentsPage',
    component: StudentsPage,
  },
  {
    path: 'attendance',
    name: 'TeachersAttendancePage',
    component: AttendancePage,
  },
  {
    path: 'grades',
    name: 'TeachersGradesPage',
    component: GradesPage,
  },
  {
    path: 'announcements',
    name: 'TeachersAnnouncementsPage',
    component: AnnouncementsPage,
  },
  {
    path: 'assignments',
    name: 'TeachersAssignmentsPage',
    component: AssignmentPage,
  },
  {
    path: 'settings',
    name: 'TeachersSettings',
    component: Settings,
  },
  {
        path: 'student/:id',
        name: 'StudentsDetail',
        component: StudentsDetail,
      },
      
     
      {
        path: 'mark/attendance',
        name: 'MarkAttendance',
        component: MarkAttendance
      },
      {
        path: 'edit/attendance/:sessionId',
        name: 'EditAttendance',
        component: EditAttendance
      },
      
    
      {
        path: 'list-grades',
        name: 'ListGrades',
        component: ListGrades
      },
      {
        path: 'exams/create',
        name: 'CreateExam',
        component: CreateExam
      },
      {
        path: 'grade-details',
        name: 'GradeDetails',
        component: GradeDetails
      },
      {
        path: 'add/grades',
        name: 'AddGrades',
        component: AddGrades,
      },
      {
        path: 'announcements/:id',
        name: 'EventDetail',
        component: EventDetail
      },
  
   
     
      {
        path: 'results',
        name: 'ResultsPage',
        component: ResultsPage,
      },
      {
        path: 'create-assignment',
        name: 'AssignmentBuilder',
        component: AssignmentBuilderPage
      },
       {
        path: 'performance',
        name: 'PerformancePage',
        component: PerformancePage,
      },
      {
        path: '/assignments/:assignmentId/students/:studentId',
        name: 'StudentAssignmentResponse',
        component: StudentAssignmentResponse
      },

      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      },
]
