import { defineStore } from 'pinia'

const MOCK_USERS = [
  { username: 'admin', password: 'password', role: 'admin', name: 'Super Admin' },
  { username: 'user',  password: 'password', role: 'user',  name: 'General Staff' },
  { username: 'film',  password: '123',      role: 'admin', name: 'PaperX' }
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { username: string; role: 'admin' | 'user'; name: string } | null,
    isAuthenticated: false
  }),

  actions: {
    initAuth() {
      if (process.client) {
        const session = localStorage.getItem('user_session')
        if (session) {
          try {
            this.user = JSON.parse(session)
            this.isAuthenticated = true
          } catch (e) {
            this.logout() 
          }
        }
      }
    },

    login(username: string, password: string): boolean {
      const foundUser = MOCK_USERS.find(u => u.username === username && u.password === password)

      if (foundUser) {
        const sessionData = { 
          username: foundUser.username, 
          role: foundUser.role,
          name: foundUser.name
        }
        
        if (process.client) {
          localStorage.setItem('user_session', JSON.stringify(sessionData))
        }
        
        this.user = sessionData as any
        this.isAuthenticated = true
        
        navigateTo('/')
        return true
      } else {
        return false 
      }
    },

    logout() {
      if (process.client) {
        localStorage.removeItem('user_session')
      }
      this.user = null
      this.isAuthenticated = false
      return navigateTo('/login')
    }
  }
})