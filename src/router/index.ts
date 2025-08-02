import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

// GitHub Pages需要使用子路径，所以使用环境变量或默认值
const base = import.meta.env.BASE_URL || '/qiaoshi-stickman-web/';

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/device',
      name: 'device',
      component: () => import('../views/DeviceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/device/:id',
      name: 'deviceDetail',
      component: () => import('../views/DeviceDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: () => import('../views/ContactsView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router