import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../api/Auth'
import LoginPage from '../views/Login.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Settings from '../views/Settings.vue'
import AnnouncementsPage from '../views/Announcements.vue'
import NotesPage from '../views/Notes.vue'
import PerformancePage from '../views/Performance.vue'
import EventDetail from '../components/events/EventDetail.vue'
import Assignments from '../views/Assignments.vue'
import AssignmentStart from '../components/lms/AssignmentStart.vue';
import QuestionPage from '../components/lms/QuestionPage.vue';



const routes = [
  {
    path: '/',
    redirect: '/login', 
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
      },
      
      {
        path: 'announcements',
        name: 'AnnouncementsPage',
        component: AnnouncementsPage,
      },
      {
        path: 'notes',
        name: 'NotesPage',
        component: NotesPage,
      },
      {
        path: '/assignments/:id/start',
        name: 'AssignmentStart',
        component: AssignmentStart,
        props: true,  
     },
     {
    path: '/assignments/:assignmentId/questions/:questionIndex',
    name: 'QuestionPage',
    component: QuestionPage,
    props: true, 
  },
    
      {
        path: 'performance',
        name: 'PerformancePage',
        component: PerformancePage,
      },
      {
        path: 'assignments',
        name: 'Assignments',
        component: Assignments
      },
     
      {
        path: 'announcements/:id',
        name: 'EventDetail',
        component: EventDetail
      },
    
    
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = Auth.isAuthenticated()

   if (!to.meta.public && !isAuthenticated) {
    next('/login') }

    if (to.path === '/login' && isAuthenticated) {
    next('/dashboard') 
  } else {
    next()
  }
})

export default router