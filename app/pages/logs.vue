<template>
  <main class="min-h-screen bg-slate-50 pb-20 font-sans">
    <div class="mx-auto max-w-6xl px-6 py-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">System Logs</h1>
          <p class="text-slate-500 text-sm">Monitor system events and error tracking</p>
        </div>
        
        <div class="flex items-center gap-3">
          <NuxtLink to="/dashboard" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm text-sm font-medium">
             <ChartBarIcon class="h-4 w-4" />
             Back to Dashboard
          </NuxtLink>

          <button 
            @click="exportLogs" 
            class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all shadow-sm text-sm font-medium"
          >
            <ArrowDownTrayIcon class="h-4 w-4" />
            Export CSV
          </button>
          <button 
            @click="clearLogs" 
            class="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg hover:bg-rose-100 transition-all shadow-sm text-sm font-medium"
          >
            <TrashIcon class="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            v-model="filter.search"
            type="text"
            placeholder="Search via message or ID..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder:text-slate-500"
          />
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button 
            v-for="lvl in ['ALL', 'INFO', 'DATA', 'WARNING', 'ERROR']" 
            :key="lvl"
            @click="filter.level = lvl === 'ALL' ? '' : lvl.toLowerCase()"
            class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap"
            :class="getFilterButtonClass(lvl)"
          >
            {{ lvl }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <ClientOnly>
          <template #fallback>
            <div class="p-8 text-center text-slate-400 flex flex-col items-center">
              <svg class="animate-spin h-5 w-5 text-indigo-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading system logs...</span>
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th class="px-6 py-4 font-semibold">Timestamp</th>
                  <th class="px-6 py-4 font-semibold">Level</th>
                  <th class="px-6 py-4 font-semibold">Message</th>
                  <th class="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <template v-if="filteredLogs.length > 0">
                  <template v-for="log in filteredLogs" :key="log.id">
                    <tr class="hover:bg-slate-50/80 transition-colors group">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col">
                          <span class="text-sm font-medium text-slate-700">{{ formatTime(log.timestamp).time }}</span>
                          <span class="text-xs text-slate-400">{{ formatTime(log.timestamp).date }}</span>
                        </div>
                      </td>

                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                          :class="getLevelBadgeClass(log.level)"
                        >
                          {{ log.level.toUpperCase() }}
                        </span>
                      </td>

                      <td class="px-6 py-4">
                        <p class="text-sm text-slate-600 truncate max-w-md" :title="log.message">
                          {{ log.message }}
                        </p>
                      </td>

                      <td class="px-6 py-4 text-right">
                        <button 
                          @click="toggleDetails(log)" 
                          class="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline decoration-2 underline-offset-2"
                        >
                          {{ log.showDetails ? 'Close' : 'View Details' }}
                        </button>
                      </td>
                    </tr>

                    <tr v-if="log.showDetails" class="bg-slate-50/50 animate-fadeIn">
                      <td colspan="4" class="px-6 py-4">
                        <div class="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner border border-slate-800">
                          <div class="flex justify-between mb-2 border-b border-slate-700 pb-2">
                            <span class="text-slate-500">LOG ID: #{{ log.id }}</span>
                            <span class="text-indigo-400">Stack Trace / Payload</span>
                          </div>
                          <pre>{{ log.details || 'No additional details provided.' }}</pre>
                        </div>
                      </td>
                    </tr>
                  </template>
                </template>

                <tr v-else>
                  <td colspan="4" class="px-6 py-16 text-center">
                    <div class="flex flex-col items-center justify-center text-slate-400">
                      <InboxIcon class="h-12 w-12 mb-2 text-slate-300" />
                      <p class="text-lg font-medium text-slate-500">No logs found</p>
                      <p class="text-sm">Try adjusting your filters, start simulation, or connect MQTT.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <span class="text-xs text-slate-500">Showing {{ filteredLogs.length }} events</span>
            <button @click="loadMore" class="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Load older logs
            </button>
          </div>
        </ClientOnly>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  InboxIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

// Setup Router
const router = useRouter()

// State
const logs = ref([])
const filter = ref({
  level: '',
  search: ''
})

// --- DATA LOADING (LocalStorage) ---
const loadLogsFromStorage = () => {
  const stored = localStorage.getItem('system_logs')
  if (stored) {
    try {
      logs.value = JSON.parse(stored)
    } catch (e) {
      console.error("Error parsing logs", e)
      logs.value = []
    }
  } else {
    logs.value = []
  }
}

onMounted(() => {
  // Auth Check: ถ้าไม่ได้ล็อกอิน ดีดกลับหน้า Login
  if (localStorage.getItem('isAuthenticated') !== 'true') {
    router.push('/')
    return
  }

  // Load logs
  loadLogsFromStorage()
  
  // Listen for storage changes
  window.addEventListener('storage', loadLogsFromStorage)
  window.addEventListener('local-storage-update', loadLogsFromStorage)
})

onUnmounted(() => {
  window.removeEventListener('storage', loadLogsFromStorage)
  window.removeEventListener('local-storage-update', loadLogsFromStorage)
})

// Corrected Search Logic
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchLevel = filter.value.level === '' || log.level === filter.value.level
    
    // เตรียมคำค้นหา
    const searchTerm = filter.value.search.toLowerCase().trim()
    const searchId = searchTerm.replace('#', '')

    // ค้นหาใน Message OR Details OR ID
    const matchSearch = 
         log.message.toLowerCase().includes(searchTerm) ||
         (log.details && log.details.toLowerCase().includes(searchTerm)) ||
         log.id.toString().includes(searchId)

    return matchLevel && matchSearch
  })
})

// Utilities
function formatTime(ts) {
  const d = new Date(ts)
  return {
    time: d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  }
}

// Styling Logic
function getLevelBadgeClass(level) {
  switch (level) {
    case 'error': return 'bg-rose-50 text-rose-700 border-rose-100'
    case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'info': return 'bg-sky-50 text-sky-700 border-sky-100'
    case 'data': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    default: return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

function getFilterButtonClass(lvl) {
  const target = lvl === 'ALL' ? '' : lvl.toLowerCase()
  if (filter.value.level === target) {
    return 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
  }
  return 'bg-slate-100 text-slate-500 hover:bg-slate-200'
}

// Actions
function toggleDetails(log) {
  log.showDetails = !log.showDetails
}

function loadMore() {
  alert('In a real app, this would fetch archived logs from the backend.')
}

function exportLogs() {
  const data = filteredLogs.value.map(l => ({
    Time: new Date(l.timestamp).toISOString(),
    Level: l.level.toUpperCase(),
    Message: l.message,
    Details: l.details
  }))
  
  const csvContent = "data:text/csv;charset=utf-8," 
    + ["Time,Level,Message,Details"].join(",") + "\n"
    + data.map(e => Object.values(e).join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `system_logs_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
}

function clearLogs() {
  if (confirm('Are you sure you want to clear session logs?')) {
    logs.value = []
    localStorage.removeItem('system_logs')
    window.dispatchEvent(new Event('local-storage-update'))
  }
}
</script>

<style scoped>
/* Custom Scrollbar for Pre tag */
pre::-webkit-scrollbar {
  height: 8px;
}
pre::-webkit-scrollbar-track {
  background: #1e293b;
}
pre::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}
</style>