import Dashboard from './views/Dashboard.vue'
import StudentsPage from './views/StudentsPage.vue'
import StudentsDetail from './components/StudentsDetail.vue'
import CreateStudent from './components/CreateStudent.vue'
import TeachersPage from './views/TeachersPage.vue'
import OtherStaffPage from './views/OtherStaff.vue'
import CreateOtherStaff from './components/CreateOtherStaff.vue'
import OtherStaffDetail from './components/OtherStaffDetail.vue'
import TeachersDetail from './components/TeachersDetail.vue'
import EventsPage from './views/EventsPage.vue'
import EventDetail from './components/events/EventDetail.vue'
import FinancePage from './views/Finance.vue'
import FeeOverview from './views/Finance.vue'
import DetailedTransactions from './components/finance/DetailedTransactions.vue'
import ExpenditureSummary from './components/finance/ExpenditureSummary.vue'
import GenerateInvoice from './components/finance/GenerateInvoice.vue'
import ReportsPage from './views/ReportsPage.vue'
import StudentsReport from './components/reports/StudentsReport.vue'
import Transactions from './components/reports/Transactions.vue'
import CommunicationsPage from './views/EventsPage.vue'
import SettingsPage from './views/SettingsPage.vue'
import ParentDetails from './components/parents/ParentDetails.vue'
import Academics from './views/Academics.vue'
import CreateTeacher from './components/CreateTeacher.vue'
import Configuration from './views/Configurations.vue'
import Promotions from './views/Promotions.vue'
import Calender from './views/Calender.vue'
import AttendancePage from './views/Attendance.vue'
import AttendanceSessionDetail from './views/AttendanceSessionDetail.vue'


export default [
  { path: '', name: 'PrincipalDashboard', component: Dashboard },
  
  // Students
  { path: 'students', name: 'PrincipalStudents', component: StudentsPage },
  { path: 'students/create', name: 'CreateStudent', component: CreateStudent },
  { path: 'student/:id', name: 'PrincipalStudentDetail', component: StudentsDetail, props: true },

  // Teachers
  { path: 'teachers', name: 'PrincipalTeachers', component: TeachersPage },
  { path: 'other-staff', name: 'PrincipalOtherStaff', component: OtherStaffPage },
  { path: 'other-staff/create', name: 'PrincipalCreateOtherStaff', component: CreateOtherStaff },
  { path: 'other-staff/:id', name: 'OtherStaffDetail', component: OtherStaffDetail, props: true },
  { path: 'teacher/:id', name: 'TeachersDetail', component: TeachersDetail, props: true },
   {path: 'teachers/create',name: 'PrincipalCreateTeacher',component: CreateTeacher},

  // Events
  { path: 'pr/events', name: 'PrincipalEvents', component: EventsPage },
  { path: 'pr/events/create', name: 'EventCreate', component: () => import('./components/events/EventCreate.vue') },
  { path: 'pr/events/:id', name: 'PrincipalEventDetail', component: EventDetail, props: true },

  // Finance
  { path: 'principal/finance/overview', name: 'PrincipalFeeOverview', component: FeeOverview },
  { path: 'principal/finance/transactions', name: 'PrincipalDetailedTransactions', component: DetailedTransactions },
  { path: 'principal/finance/expenditure', name: 'PrincipalExpenditureSummary', component: ExpenditureSummary },
  { path: 'principal/generate-invoice/:id', name: 'PrincipalGenerateInvoice', component: GenerateInvoice, props: true },

  // Reports
  { path: 'principal/reports', name: 'PrincipalReports', component: ReportsPage },
  { path: 'principal/student-reports', name: 'StudentReports', component: StudentsReport },
  { path: 'principal/transactions', name: 'Transactions', component: Transactions },

  // Attendance
  { path: 'attendance', name: 'PrincipalAttendance', component: AttendancePage },
  { path: 'attendance/:id', name: 'PrincipalAttendanceSessionDetail', component: AttendanceSessionDetail, props: true },

  // Communications
  { path: 'pr/communications', name: 'PrincipalCommunications', component: CommunicationsPage },

  // Parents
  { path: 'pr/parents/:id', name: 'ParentDetails', component: ParentDetails, props: true },

  // Settings
  { path: 'pr/settings', name: 'PrincipalSettings', component: SettingsPage },

  { path: 'academics', name: 'Academics', component: Academics },
  { path: 'configurations', name: 'Configurations', component: Configuration },
  { path: 'promotions', name: 'Promotions', component: Promotions },
  { path: 'principal/calendar', name: 'PrincipalCalendar', component: Calender },
]
