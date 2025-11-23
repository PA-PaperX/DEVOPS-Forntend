<template>
  <main class="min-h-screen bg-slate-50 pb-20">
    <nav class="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div class="mx-auto max-w-6xl px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="bg-indigo-600 p-2 rounded-lg">
            <ServerIcon class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">DevOps Monitor</h1>
            <p class="text-xs text-slate-500">Real-time IoT Dashboard</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <NuxtLink to="/logs" class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
            <ClipboardDocumentListIcon class="h-4 w-4" />
            View Logs
          </NuxtLink>

          <button 
            @click="toggleSimulation"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="isSimulation ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            <BeakerIcon class="h-4 w-4" />
            {{ isSimulation ? 'Simulation ON' : 'Simulation OFF' }}
          </button>

          <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <span class="relative flex h-2.5 w-2.5">
              <span v-if="isMqttConnected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isMqttConnected ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            </span>
            <span class="text-xs font-semibold" :class="isMqttConnected ? 'text-emerald-700' : 'text-rose-700'">
              {{ isMqttConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
      </div>
    </nav>

    <div class="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Temperature" class="relative overflow-hidden">
          <template #icon>
            <FireIcon class="h-6 w-6 text-rose-500" :class="{'animate-pulse': temp > 35}" />
          </template>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold text-slate-800">{{ temp.toFixed(1) }}</span>
            <span class="text-sm text-slate-400 font-medium">°C</span>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
            <div class="h-full bg-rose-500 transition-all duration-500" :style="{ width: `${Math.min(temp, 50) * 2}%` }"></div>
          </div>
        </StatCard>

        <StatCard label="Humidity">
          <template #icon><CloudIcon class="h-6 w-6 text-sky-500" /></template>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold text-slate-800">{{ humidity.toFixed(1) }}</span>
            <span class="text-sm text-slate-400 font-medium">%</span>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
            <div class="h-full bg-sky-500 transition-all duration-500" :style="{ width: `${humidity}%` }"></div>
          </div>
        </StatCard>

        <StatCard label="System Status">
          <template #icon>
            <CpuChipIcon class="h-6 w-6" :class="isOnline ? 'text-emerald-500' : 'text-slate-400'" />
          </template>
          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold" :class="isOnline ? 'text-emerald-600' : 'text-slate-500'">
              {{ isOnline ? 'ONLINE' : 'STANDBY' }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Last Update: {{ lastUpdated }}</p>
        </StatCard>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Temperature History</h3>
          <div class="h-64 w-full">
            <ClientOnly fallback-tag="div" fallback="Loading Chart...">
              <Line :data="tempChartData" :options="chartOptions" />
            </ClientOnly>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Humidity History</h3>
          <div class="h-64 w-full">
            <ClientOnly fallback-tag="div" fallback="Loading Chart...">
              <Line :data="humidChartData" :options="chartOptions" />
            </ClientOnly>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { FireIcon, CloudIcon, ServerIcon, CpuChipIcon, BeakerIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/solid'
import mqtt from 'mqtt'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// State
const temp = ref(0)
const humidity = ref(0)
const isOnline = ref(false)
const isMqttConnected = ref(false)
const isSimulation = ref(false)
const lastUpdated = ref('--:--')
let client: mqtt.MqttClient | null = null
let simInterval: any = null

// Data Storage
const maxDataPoints = 20
const labels = ref<string[]>(Array(maxDataPoints).fill(''))
const tempData = ref<number[]>(Array(maxDataPoints).fill(0))
const humidData = ref<number[]>(Array(maxDataPoints).fill(0))

// Config
const TOPIC_TEMP = 'devops/film/temp'
const TOPIC_HUMID = 'devops/film/humid'
const TOPIC_STATUS = 'devops/film/status'

// --- LOGGING SYSTEM ---
function saveSystemLog(level: string, message: string, details: string = '') {
  try {
    const newLog = {
      id: Date.now(),
      timestamp: Date.now(),
      level, // 'info', 'warning', 'error', 'data'
      message,
      details
    }
    const existingLogs = JSON.parse(localStorage.getItem('system_logs') || '[]')
    existingLogs.unshift(newLog)
    
    // เก็บเยอะขึ้นหน่อยเพราะมี Data เข้ามาด้วย (100 logs)
    const limitedLogs = existingLogs.slice(0, 100) 
    localStorage.setItem('system_logs', JSON.stringify(limitedLogs))
    
    // Trigger update for other tabs/components
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('local-storage-update'))
  } catch (e) {
    console.error('Failed to save log', e)
  }
}

// --- Chart Options ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: '#f3f4f6' },
    },
    x: { 
      grid: { display: false },
      ticks: {
        autoSkip: true,
        maxTicksLimit: 20,
        callback(value: any, index: number, ticks: any) {
          const labels = (this as any).chart.data.labels
          const currentLabel = labels[value] as string
          if (!currentLabel) return ''
          const currentMinute = currentLabel.slice(0, 5)
          if (index === 0) return currentMinute
          const prevLabel = labels[value - 1] as string
          const prevMinute = prevLabel ? prevLabel.slice(0, 5) : ''
          if (currentMinute !== prevMinute) {
            return currentMinute
          }
          return ''
        }
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      intersect: false,
      mode: 'index',
      callbacks: {
        title(items: any) {
          const item = items[0]
          return item.label || ''
        }
      }
    }
  },
  elements: {
    line: { tension: 0.4, borderWidth: 2 },
    point: { radius: 0, hoverRadius: 4 }
  }
}

const tempChartData = computed(() => ({
  labels: [...labels.value], 
  datasets: [{
    label: 'Temperature',
    data: [...tempData.value],
    borderColor: '#f43f5e',
    backgroundColor: (ctx: any) => {
      const canvas = ctx.chart.ctx;
      const gradient = canvas.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.2)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');
      return gradient;
    },
    fill: true
  }]
}))

const humidChartData = computed(() => ({
  labels: [...labels.value],
  datasets: [{
    label: 'Humidity',
    data: [...humidData.value],
    borderColor: '#0ea5e9',
    backgroundColor: (ctx: any) => {
      const canvas = ctx.chart.ctx;
      const gradient = canvas.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
      gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
      return gradient;
    },
    fill: true
  }]
}))

const updateChart = (t: number, h: number) => {
  const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  
  const newLabels = [...labels.value, now]
  const newTemp = [...tempData.value, t]
  const newHumid = [...humidData.value, h]

  if (newLabels.length > maxDataPoints) {
    newLabels.shift()
    newTemp.shift()
    newHumid.shift()
  }

  labels.value = newLabels
  tempData.value = newTemp
  humidData.value = newHumid
}

const toggleSimulation = () => {
  isSimulation.value = !isSimulation.value
  if (isSimulation.value) {
    if (client) client.end()
    isMqttConnected.value = false
    startSimulation()
  } else {
    stopSimulation()
    connectMqtt()
  }
}

const startSimulation = () => {
  saveSystemLog('info', 'Simulation Mode Started', 'User manually activated simulation')
  
  simInterval = setInterval(() => {
    const simTemp = 28 + Math.random() * 5 - 2.5
    const simHumid = 60 + Math.random() * 10 - 5
    
    temp.value = simTemp
    humidity.value = simHumid
    isOnline.value = true
    lastUpdated.value = new Date().toLocaleTimeString('th-TH')
    
    // Check High Temp in Simulation
    if (simTemp > 35) {
       saveSystemLog('warning', `High Temp Simulation: ${simTemp.toFixed(1)}°C`)
    }
    
    // Log Data Stream in Simulation (เพื่อให้เห็น Log ไหล)
    saveSystemLog('data', `Sim Update: T:${simTemp.toFixed(1)}°C / H:${simHumid.toFixed(1)}%`)
    
    updateChart(simTemp, simHumid)
  }, 2000) 
}

const stopSimulation = () => {
  if (simInterval) clearInterval(simInterval)
  saveSystemLog('info', 'Simulation Mode Stopped', 'User deactivated simulation')
}

const connectMqtt = () => {
  const brokerUrl = 'ws://localhost:9001' 
  client = mqtt.connect(brokerUrl)

  client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker')
    isMqttConnected.value = true
    saveSystemLog('info', 'MQTT Connected', `Broker: ${brokerUrl}`)
    client?.subscribe([TOPIC_TEMP, TOPIC_HUMID, TOPIC_STATUS])
  })
  
  client.on('offline', () => {
    if (isMqttConnected.value) {
       saveSystemLog('error', 'MQTT Connection Lost', 'Client became offline')
    }
    isMqttConnected.value = false
  })

  client.on('message', (topic, message) => {
    const msg = message.toString()
    lastUpdated.value = new Date().toLocaleTimeString('th-TH')

    if (topic === TOPIC_TEMP) {
      const val = Number(msg)
      temp.value = val
      
      // >>> LOG EVERY DATA POINT <<<
      saveSystemLog('data', `Temp Update: ${val.toFixed(1)}°C`, `Topic: ${topic}`)

      // LOG ALERT: High Temperature
      if (val > 35) {
        saveSystemLog('warning', `High Temperature Detected: ${val}°C`, `Threshold: 35°C`)
      }
      
      updateChart(temp.value, humidity.value)
    }
    else if (topic === TOPIC_HUMID) {
      const val = Number(msg)
      humidity.value = val
      
      // >>> LOG EVERY DATA POINT <<<
      saveSystemLog('data', `Humid Update: ${val.toFixed(1)}%`, `Topic: ${topic}`)

      updateChart(temp.value, humidity.value)
    }
    else if (topic === TOPIC_STATUS) {
      isOnline.value = (msg === '1' || msg === 'on')
      saveSystemLog('info', `System Status Changed`, `New Status: ${isOnline.value ? 'ONLINE' : 'OFFLINE'}`)
    }
  })

  client.on('close', () => { isMqttConnected.value = false })
}

onMounted(() => {
  connectMqtt()
})

onUnmounted(() => {
  if (client) client.end()
  stopSimulation()
})
</script>