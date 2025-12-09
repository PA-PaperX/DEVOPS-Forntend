export default defineNuxtConfig({
  future: {
    compatibilityVersion: 5
  },

  devtools: {
    enabled: true
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon'
  ],

  css: [
    '@/assets/css/main.css'
  ],

  tailwindcss: {
    viewer: false
  },

  vite: {
    define: {
      'process.env': {}
    }
  }
})
