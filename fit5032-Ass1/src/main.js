import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia).use(router)

import { useAuthStore } from '@/stores/auth' 

// Ensure that an administrator account exists at startup (change it in stores/auth.js if you need a custom email address)
const auth = useAuthStore()
auth.watchFirebaseAuth()// Listen for Firebase sessions
auth.seedAdmin()// Local administrator seed (can be called when the Admin page is first visited)

app.mount('#app')


