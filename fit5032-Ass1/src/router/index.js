// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Resources from '@/views/Resources.vue'
import ResourceDetail from '@/views/ResourceDetail.vue'
import Admin from '@/views/Admin.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'Home', component: Home },

  // Only accessible to guests (redirected to Home if logged in)
  { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },

  // Public resources
  { path: '/resources', name: 'Resources', component: Resources },
  {
    path: '/resources/:id',
    name: 'ResourceDetail',
    component: ResourceDetail,
    props: true, // <ResourceDetail :id="route.params.id" />
  },

  // Administrators only
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: { template: '<div class="container py-5"><h2>404 Not Found</h2></div>' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Access is not allowed if logged in guestOnly (login/register)
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'Home' }
  }

  // Login required
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // With back jump: return to the original destination after successful login
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Administrator required
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
    
    if (!auth.isAdmin) {
      return { name: 'Home' }
    }
  }

  return true
})

export default router
