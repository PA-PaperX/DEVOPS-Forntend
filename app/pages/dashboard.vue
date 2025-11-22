<template>
  <main class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-6xl px-6 py-10">
      <header class="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Monitor Dashboard</h1>
          <p class="text-sm text-slate-500">สถานะเซิร์ฟเวอร์และ IoT แบบ Real-time (Test Mode)</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1 rounded-full px-3 py-1"
            :class="isMqttConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
            <span class="h-2 w-2 rounded-full" :class="isMqttConnected ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            {{ isMqttConnected ? 'เชื่อมต่อระบบสำเร็จ' : 'ขาดการเชื่อมต่อ' }}
          </span>
          <span>อัปเดตล่าสุด: {{ lastUpdated }}</span>
        </div>
      </header>

      <section class="grid gap-6 md:grid-cols-3">
        <StatCard label="Temperature" colorClass="text-rose-600">
          <template #icon><FireIcon class="h-6 w-6 text-rose-500" /></template>
          {{ temp }} <span class="text-lg text-slate-400">°C</span>
        </StatCard>

        <StatCard label="Humidity" colorClass="text-sky-600">
          <template #icon><CloudIcon class="h-6 w-6 text-sky-500" /></template>
          {{ humidity }} <span class="text-lg text-slate-400">%</span>
        </StatCard>

        <StatCard label="Server Status" :colorClass="isOnline ? 'text-emerald-600' : 'text-rose-600'">
          <template #icon>
            <ServerIcon class="h-6 w-6" :class="isOnline ? 'text-emerald-500' : 'text-rose-500'" />
          </template>
          {{ isOnline ? 'ONLINE' : 'OFFLINE' }}
        </StatCard>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FireIcon, CloudIcon, ServerIcon } from '@heroicons/vue/24/solid'
import mqtt from 'mqtt'

const temp = ref(0)
const humidity = ref(0)
const isOnline = ref(false)
const isMqttConnected = ref(false)
const lastUpdated = ref('--:--')
let client: mqtt.MqttClient | null = null

const TOPIC_TEMP = 'devops/film/temp'
const TOPIC_HUMID = 'devops/film/humid'
const TOPIC_STATUS = 'devops/film/status'

onMounted(() => {
  client = mqtt.connect('ws://localhost:9001')

  client.on('connect', () => {
    console.log('✅ ต่อติดแล้วจ้า!')
    isMqttConnected.value = true
    client?.subscribe([TOPIC_TEMP, TOPIC_HUMID, TOPIC_STATUS])
  })

  client.on('message', (topic, message) => {
    const msg = message.toString()
    console.log(`📩 ได้รับข้อความ: ${topic} -> ${msg}`)
    
    lastUpdated.value = new Date().toLocaleTimeString('th-TH')

    if (topic === TOPIC_TEMP) temp.value = Number(msg)
    else if (topic === TOPIC_HUMID) humidity.value = Number(msg)
    else if (topic === TOPIC_STATUS) isOnline.value = (msg === '1' || msg === 'on')
  })
})

onUnmounted(() => {
  if (client) client.end()
})
</script>