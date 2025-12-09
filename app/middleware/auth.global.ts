import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const auth = useAuthStore()
    
    if (!auth.isAuthenticated) {
      auth.initAuth()
    }

    if (!auth.isAuthenticated && to.path !== '/login') {
      return navigateTo('/login')
    }

    if (auth.isAuthenticated && to.path === '/login') {
      return navigateTo('/')
    }
  }
})