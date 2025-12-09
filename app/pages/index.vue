<template>
  <div class="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">DevOps Monitor</h1>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-slate-500 text-sm">Welcome,</p>
          <span class="font-bold text-indigo-600 text-sm">{{ auth.user?.name }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase border border-slate-200 font-bold tracking-wider">
            {{ auth.user?.role }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
          <span class="relative flex h-2.5 w-2.5">
            <span v-if="store.isConnected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="store.isConnected ? 'bg-emerald-500' : 'bg-rose-500'"></span>
          </span>
          <span class="text-xs font-bold" :class="store.isConnected ? 'text-emerald-700' : 'text-rose-700'">
            {{ store.isConnected ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>

        <button 
          @click="auth.logout()"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm font-medium shadow-sm"
        >
          <ArrowRightStartOnRectangleIcon class="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FireIcon class="w-24 h-24 text-rose-500" />
        </div>
        <div class="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Temperature</div>
        <div class="flex items-baseline gap-2">
          <span class="text-6xl font-bold text-slate-800">{{ store.temp.toFixed(1) }}</span>
          <span class="text-2xl text-slate-400 font-medium">°C</span>
        </div>
        <div class="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div class="h-full bg-rose-500 transition-all duration-500" :style="{ width: `${Math.min(store.temp, 100)}%` }"></div>
        </div>
      </div>
      
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CloudIcon class="w-24 h-24 text-sky-500" />
        </div>
        <div class="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Humidity</div>
        <div class="flex items-baseline gap-2">
          <span class="text-6xl font-bold text-slate-800">{{ store.humidity.toFixed(1) }}</span>
          <span class="text-2xl text-slate-400 font-medium">%</span>
        </div>
        <div class="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div class="h-full bg-sky-500 transition-all duration-500" :style="{ width: `${Math.min(store.humidity, 100)}%` }"></div>
        </div>
      </div>
    </div>

    <div v-if="auth.user?.role === 'admin'" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <ShieldCheckIcon class="w-5 h-5 text-indigo-500" />
          <h3 class="font-semibold text-slate-700">System Logs (Admin Access)</h3>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter Date:</label>
          <input 
            type="date" 
            v-model="selectedDate"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>
      </div>

      <div class="h-80 overflow-y-auto p-0 font-mono text-sm">
        <table class="w-full text-left">
          <tbody class="divide-y divide-slate-50">
            <tr v-for="(log, i) in filteredLogs" :key="i" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-3 text-slate-400 w-32 whitespace-nowrap">{{ formatTime(log.timestamp) }}</td>
              <td class="px-6 py-3 w-24">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-100': log.type === 'info',
                    'bg-amber-50 text-amber-700 border border-amber-100': log.type === 'warn',
                    'bg-rose-50 text-rose-700 border border-rose-100': log.type === 'error'
                  }">
                  {{ log.type }}
                </span>
              </td>
              <td class="px-6 py-3 text-slate-600 w-full">{{ log.msg }}</td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="3" class="px-6 py-12 text-center text-slate-400">No logs found for this date.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <ShieldCheckIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-500 font-medium">Restricted Access</p>
      <p class="text-slate-400 text-sm">System logs are only available for Administrators.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMqttStore } from '~/stores/mqttStore'
import { useAuthStore } from '~/stores/authStore'
import { FireIcon, CloudIcon, ArrowRightStartOnRectangleIcon, ShieldCheckIcon } from '@heroicons/vue/24/solid'

const store = useMqttStore()
const auth = useAuthStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])

const formatTime = (ts) => {
  return new Date(ts).toLocaleTimeString('th-TH')
}

const filteredLogs = computed(() => {
  return store.logs.filter(log => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0]
    return logDate === selectedDate.value
  })
})

onMounted(() => {
  store.connect()
})
</script>