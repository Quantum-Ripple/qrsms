import Dashboard from './views/Dashboard.vue'
import StudentsPage from './views/StudentsPage.vue'
import StudentsDetail from './components/StudentsDetail.vue'
import CreateStudent from './components/CreateStudent.vue'
import TeachersPage from './views/TeachersPage.vue'
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
import CommunicationsPage from './views/CommunicationPage.vue'
import SettingsPage from './views/SettingsPage.vue'
import ParentDetails from './components/parents/ParentDetails.vue'

export default [
  { path: '', name: 'PrincipalDashboard', component: Dashboard },
  
  // Students
  { path: 'students', name: 'PrincipalStudents', component: StudentsPage },
  { path: 'students/create', name: 'CreateStudent', component: CreateStudent },
  { path: 'student/:id', name: 'StudentsDetail', component: StudentsDetail, props: true },

  // Teachers
  { path: 'teachers', name: 'PrincipalTeachers', component: TeachersPage },
  { path: 'teacher/:id', name: 'TeachersDetail', component: TeachersDetail, props: true },

  // Events
  { path: 'events', name: 'PrincipalEvents', component: EventsPage },
  { path: 'events/create', name: 'EventCreate', component: () => import('./components/events/EventCreate.vue') },
  { path: 'events/:id', name: 'EventDetail', component: EventDetail, props: true },

  // Finance
  { path: 'finance/overview', name: 'PrincipalFeeOverview', component: FeeOverview },
  { path: 'finance/transactions', name: 'PrincipalDetailedTransactions', component: DetailedTransactions },
  { path: 'finance/expenditure', name: 'PrincipalExpenditureSummary', component: ExpenditureSummary },
  { path: 'generate-invoice/:id', name: 'PrincipalGenerateInvoice', component: GenerateInvoice, props: true },

  // Reports
  { path: 'reports', name: 'PrincipalReports', component: ReportsPage },
  { path: 'student-reports', name: 'StudentReports', component: StudentsReport },
  { path: 'transactions', name: 'Transactions', component: Transactions },

  // Communications
  { path: 'communications', name: 'PrincipalCommunications', component: CommunicationsPage },

  // Parents
  { path: 'parents/:id', name: 'ParentDetails', component: ParentDetails, props: true },

  // Settings
  { path: 'settings', name: 'PrincipalSettings', component: SettingsPage },
]
