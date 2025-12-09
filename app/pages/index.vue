<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <ServerIcon class="h-7 w-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-slate-800">DevOps Monitor</h1>
        <p class="text-slate-500 text-sm mt-1">Please sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-2">Username</label>
          <input 
            v-model="form.username" 
            type="text" 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            placeholder="admin"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-2">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            placeholder="1234"
          />
        </div>

        <div v-if="errorMsg" class="text-xs text-rose-600 font-medium text-center bg-rose-50 py-2 rounded-lg">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          class="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-md shadow-indigo-200 transition-all"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ServerIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const form = ref({ username: '', password: '' })
const errorMsg = ref('')

onMounted(() => {
  // แก้ไข: จากเดิมที่เช็คเพื่อเด้งเข้า Dashboard
  // เปลี่ยนเป็น "ล้างค่าทิ้ง" เพื่อบังคับล็อกอินใหม่ทุกครั้งที่เข้าหน้านี้
  localStorage.removeItem('isAuthenticated')
})

const handleLogin = () => {
  if (form.value.username === 'admin' && form.value.password === '1234') {
    localStorage.setItem('isAuthenticated', 'true')
    router.push('/dashboard')
  } else {
    errorMsg.value = 'Invalid username or password'
    form.value.password = ''
  }
}
</script>