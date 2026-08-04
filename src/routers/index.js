import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../api/Auth'

import LoginPage from '../views/LoginPage.vue'
import PrivacyPage from '../views/privacy.vue'
import TermsPage from '../views/terms.vue'

import StudentRoutes from '../portals/students/routes'
import TeacherRoutes from '../portals/teachers/routes'
import PrincipalRoutes from '../portals/principals/routes'
import FinanceRoutes from '../portals/finance/routes'
import ParentRoutes from '../portals/parents/routes'


const ROLE_TO_PORTAL_PATH = {
  student: '/student',
  teacher: '/teachers',
  principal: '/principal',
  admin: '/principal',
  finance: '/finance',
  parent: '/parent',
}

const PORTAL_PREFIX_TO_ROLE = {
  student: 'student',
  teachers: 'teacher',
  principal: 'principal',
  finance: 'finance',
  parent: 'parent',
}

function normalizeRole(role) {
  return (role || '').toString().toLowerCase()
}

function getPortalPrefix(path) {
  const firstSegment = (path || '').split('/').filter(Boolean)[0]
  return firstSegment || ''
}

function getPortalPathForUser(user) {
  const role = normalizeRole(user?.role)
  return ROLE_TO_PORTAL_PATH[role] || null
}

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { public: true }
  },
  {
    path: '/privacy',
    name: 'PrivacyPolicy',
    component: PrivacyPage,
    meta: { public: true }
  },
  {
    path: '/terms',
    name: 'TermsOfUse',
    component: TermsPage,
    meta: { public: true }
  },
  {
    path: '/student',
    name: 'StudentPortal',
    component: () => import('../portals/students/layouts/DashboardLayout.vue'),
    children: StudentRoutes,
    meta: { requiresAuth: true, portalRole: 'student' }
  },
  {
    path: '/teachers',
    name: 'TeacherPortal',
    component: () => import('../portals/teachers/layouts/DashboardLayout.vue'),
    children: TeacherRoutes,
    meta: { requiresAuth: true, portalRole: 'teacher' }
  },
  {
    path: '/principal',
    name: 'PrincipalPortal',
    component: () => import('../portals/principals/layouts/DashboardLayout.vue'),
    children: PrincipalRoutes,
    meta: { requiresAuth: true, portalRole: 'principal' }
  },
    {
    path: '/finance',
    name: 'FinancePortal',
    component: () => import('../portals/finance/layouts/DashboardLayout.vue'),
    children: FinanceRoutes,
    meta: { requiresAuth: true, portalRole: 'finance' }
  },
  {
    path: '/parent',
    name: 'ParentPortal',
    component: () => import('../portals/parents/layouts/DashboardLayout.vue'),
    children: ParentRoutes,
    meta: { requiresAuth: true, portalRole: 'parent' }
  }
]



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


router.beforeEach((to, from, next) => {
  const isAuthenticated = Auth.isAuthenticated()
  const user = Auth.getUser()
  const userPortalPath = getPortalPathForUser(user)
  const requestedPortalPrefix = getPortalPrefix(to.path)
  const requestedPortalRole = PORTAL_PREFIX_TO_ROLE[requestedPortalPrefix]

  if (to.meta.public) {
    if (isAuthenticated && (to.path === '/' || to.path === '/login') && userPortalPath) {
      return next(userPortalPath)
    }
    return next()
  }

  if (!isAuthenticated) {
    return next('/login')
  }

  if (!userPortalPath) {
    Auth.logout()
    return next('/login')
  }

  if (requestedPortalRole) {
    const normalizedUserRole = normalizeRole(user?.role)
    const expectedPortalPath = ROLE_TO_PORTAL_PATH[normalizedUserRole]

    if (!expectedPortalPath) {
      Auth.logout()
      return next('/login')
    }

    if (!to.path.startsWith(expectedPortalPath)) {
      return next(expectedPortalPath)
    }
  }

  next()
})

export default router
