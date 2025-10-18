import { defineStore } from 'pinia'
import { sha256 } from './crypto'
import { auth } from '@/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

// --- Local storage key name, unified management ---
const STORAGE_KEY = 'nfp_auth_users'     // Locally registered user table (array)
const SESSION_KEY = 'nfp_auth_session'   // Current session object

// --- 工具函数 ---
const loadUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
const saveUsers = (u) => localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
const sanitize = (s) =>
  String(s).replace(/[<>\"'`]/g, (m) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[m]))

// --- Administrator whitelist (can be changed as needed)---
const ADMIN_EMAILS = [
  'admin@staff.monash',   
  'admin@nfp.org',        
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'), // 统一用 SESSION_KEY 保存/读取
  }),

  getters: {
    isAuthenticated: (s) => !!s.user,
    isAdmin: (s) => !!s.user && s.user.role === 'admin',
  },

  actions: {
    // ======= Session read and write (shared between local and Firebase)=======
    _setSession(user) {
      this.user = user
      if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      else localStorage.removeItem(SESSION_KEY)
    },

    _roleOf(email) {
      return ADMIN_EMAILS.some((adm) => email?.startsWith(adm)) ? 'admin' : 'member'
    },

    // ======= Firebase Login/Register =======
    async firebaseRegister({ name, email, password }) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const role = this._roleOf(cred.user.email)
      const profileName = name?.trim() || cred.user.email.split('@')[0]
      this._setSession({ name: profileName, email: cred.user.email, role, provider: 'firebase' })
    },

    async firebaseLogin({ email, password }) {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const role = this._roleOf(cred.user.email)
      this._setSession({ name: cred.user.email.split('@')[0], email: cred.user.email, role, provider: 'firebase' })
    },

    async firebaseLogout() {
      await signOut(auth)
      this._setSession(null)
    },

    watchFirebaseAuth() {
      onAuthStateChanged(auth, (u) => {
        if (!u) {
          this._setSession(null)
          return
        }
        const role = this._roleOf(u.email)
        this._setSession({ name: u.email.split('@')[0], email: u.email, role, provider: 'firebase' })
      })
    },

    // ======= Local Login/Register（作业 B/C）=======
    register({ name, email, password, role = 'member' }) {
      name = sanitize(name)
      email = sanitize(email.toLowerCase())
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format')
      if ((password || '').length < 6) throw new Error('Password too short')

      const users = loadUsers()
      if (users.find((u) => u.email === email)) throw new Error('Email already registered')

      users.push({ name, email, pass: sha256(password), role })
      saveUsers(users)
      return true
    },

    login({ email, password }) {
      email = sanitize(email.toLowerCase())
      const u = loadUsers().find((x) => x.email === email && x.pass === sha256(password))
      if (!u) throw new Error('Invalid credentials')

      this._setSession({ name: u.name, email: u.email, role: u.role, provider: 'local' })
    },

    logout() {
      this._setSession(null)
    },

    // Seed a local admin when first visiting the Admin page
    seedAdmin() {
      const users = loadUsers()
      if (!users.find((u) => u.email === 'admin@staff.monash')) {
        users.push({ name: 'Admin', email: 'admin@staff.monash', pass: sha256('Admin123!'), role: 'admin' })
        saveUsers(users)
      }
    },
  },
})
