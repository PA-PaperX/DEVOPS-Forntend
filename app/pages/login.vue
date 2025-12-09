<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
      
      <div class="text-center mb-8">
        <div class="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-white">
            <path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800">DevOps Monitor</h1>
        <p class="text-slate-500 text-sm mt-2">Secure Access Gateway</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <div v-if="errorMsg" class="bg-rose-50 text-rose-600 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Username</label>
          <input 
            v-model="form.username" 
            type="text" 
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
            placeholder="e.g. admin"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
            placeholder="••••••••"
            required
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isLoading ? 'Verifying...' : 'Sign In' }}
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-100 text-center">
        <p class="text-[10px] text-slate-300">
          Hint: admin/password, user/password
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'

const auth = useAuthStore()
const isLoading = ref(false)
const errorMsg = ref('')

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  errorMsg.value = ''
  isLoading.value = true
  
  await new Promise(r => setTimeout(r, 800))

  const success = auth.login(form.username, form.password)
  
  if (!success) {
    errorMsg.value = 'Invalid username or password'
    isLoading.value = false
    form.password = ''
  }
}
</script>