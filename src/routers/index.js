import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../api/Auth'

import PortalSelector from '../views/PortalSelector.vue'
import LoginPage from '../views/LoginPage.vue'

import StudentRoutes from '../portals/students/routes'
import TeacherRoutes from '../portals/teachers/routes'
import PrincipalRoutes from '../portals/principals/routes'
import FinanceRoutes from '../portals/finance/routes'
import ParentRoutes from '../portals/parents/routes'

const routes = [
  {
    path: '/',
    name: 'PortalSelector',
    component: PortalSelector,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { public: true }
  },
  {
    path: '/student',
    name: 'StudentPortal',
    component: () => import('../portals/students/layouts/DashboardLayout.vue'),
    children: StudentRoutes,
  },
  {
    path: '/teachers',
    name: 'TeacherPortal',
    component: () => import('../portals/teachers/layouts/DashboardLayout.vue'),
    children: TeacherRoutes,
  },
  {
    path: '/principal',
    name: 'PrincipalPortal',
    component: () => import('../portals/principals/layouts/DashboardLayout.vue'),
    children: PrincipalRoutes
  },
    {
    path: '/finance',
    name: 'FinancePortal',
    component: () => import('../portals/finance/layouts/DashboardLayout.vue'),
    children: FinanceRoutes
  },
  {
    path: '/parent',
    name: 'ParentPortal',
    component: () => import('../portals/parents/layouts/DashboardLayout.vue'),
    children: ParentRoutes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = Auth.isAuthenticated()
  const user = Auth.getUser()

  if (to.meta.public) {
    return next()
  }

  if (!isAuthenticated) {
    return next('/login')
  }

  if (to.meta.role && user?.role !== to.meta.role) {
    return next('/')
  }

  next()
})

export default router
