// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  // ตั้งค่า Runtime Config สำหรับรับค่าจาก Environment (Docker/Server)
  runtimeConfig: {
    public: {
      mqttBrokerUrl: process.env.MQTT_BROKER_URL || 'ws://localhost:9001',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000'
    }
  },

  app: {
    head: {
      title: 'DevOps Monitor',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})