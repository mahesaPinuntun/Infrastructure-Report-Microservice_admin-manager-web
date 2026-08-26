<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
    <div class="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
      <h2 class="text-2xl font-bold mb-6 text-center text-blue-400">Portal Login Admin & Manager</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Pilih Role</label>
          <select v-model="role" class="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="ADMIN">Administrator</option>
            <option value="INFRASTRUCTURE_MANAGER">Infrastructure Manager</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email Alamat</label>
          <input v-model="email" type="email" required class="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 font-semibold p-2 rounded transition-colors">
          Masuk
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const role = ref('ADMIN');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    error.value = '';
    await authStore.login(email.value, password.value, role.value);
    if (role.value === 'ADMIN') router.push('/admin');
    else router.push('/manager');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login gagal. Periksa kredensial Anda.';
  }
};
</script>