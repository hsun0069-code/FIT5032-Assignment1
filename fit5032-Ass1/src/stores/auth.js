import { defineStore } from 'pinia'
import { sha256 } from './crypto'

const STORAGE_KEY = 'nfp_auth_users'
const SESSION_KEY = 'nfp_auth_session'
const loadUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
const saveUsers = (u) => localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
const sanitize = (s) => String(s).replace(/[<>\"'`]/g, (m) => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[m]))

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }),
  getters: { isAuthenticated: (s) => !!s.user },
  actions: {
    register({ name, email, password, role = 'member' }) {
      name = sanitize(name); email = sanitize(email.toLowerCase())
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email')
      if ((password || '').length < 6) throw new Error('Password too short')
      const users = loadUsers()
      if (users.find((u) => u.email === email)) throw new Error('Email already registered')
      users.push({ name, email, pass: sha256(password), role }); saveUsers(users); return true
    },
    login({ email, password }) {
      email = sanitize(email.toLowerCase())
      const u = loadUsers().find((x) => x.email === email && x.pass === sha256(password))
      if (!u) throw new Error('Invalid credentials')
      this.user = { name: u.name, email: u.email, role: u.role }
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.user))
    },
    logout() { this.user = null; localStorage.removeItem(SESSION_KEY) },
    seedAdmin() {
      const users = loadUsers()
      if (!users.find((u) => u.email === 'admin@nfp.org')) {
        users.push({ name: 'Admin', email: 'admin@nfp.org', pass: sha256('Admin123!'), role: 'admin' })
        saveUsers(users)
      }
    },
  },
})
