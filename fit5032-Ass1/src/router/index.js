import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Admin from '@/views/Admin.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },
  { path: '/resources', name: 'Resources', component: Resources },
  { path: '/resources/:id', name: 'ResourceDetail', component: ResourceDetail },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true, requiresRole: 'admin' } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'Home' }
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'Login' }
  if (to.meta.requiresRole && auth.user?.role !== to.meta.requiresRole) return { name: 'Home' }
  return true
})

export default router

