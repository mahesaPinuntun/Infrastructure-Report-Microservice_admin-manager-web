<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 p-6">
    <header class="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
      <h1 class="text-3xl font-bold text-blue-400">Admin Live Control Dashboard</h1>
      <button @click="logout" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-sm font-semibold">Logout</button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Invite User Form -->
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 class="text-xl font-bold mb-4 text-emerald-400">Undang Pengguna Baru</h2>
        <form @submit.prevent="sendInvite" class="space-y-4">
          <div>
            <label class="block text-sm mb-1">Nama Lengkap</label>
            <input v-model="invite.name" type="text" required class="w-full bg-slate-700 border border-slate-600 rounded p-2" />
          </div>
          <div>
            <label class="block text-sm mb-1">Email</label>
            <input v-model="invite.email" type="email" required class="w-full bg-slate-700 border border-slate-600 rounded p-2" />
          </div>
          <div>
            <label class="block text-sm mb-1">Role Akun</label>
            <select v-model="invite.role" class="w-full bg-slate-700 border border-slate-600 rounded p-2">
              <option value="INFRASTRUCTURE_MANAGER">Infrastructure Manager</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="USER">User (Masyarakat)</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold p-2 rounded">
            Kirim Link Konfirmasi Brevo
          </button>
        </form>
        <p v-if="inviteMessage" class="mt-4 text-sm text-emerald-400">{{ inviteMessage }}</p>
      </div>

      <!-- Live Activity Logs -->
      <div class="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 class="text-xl font-bold mb-4 text-blue-400">Live Activity Feed</h2>
        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div v-for="log in logs" :key="log._id" class="p-3 bg-slate-700/50 rounded border border-slate-600 flex justify-between items-center">
            <div>
              <span class="font-bold text-blue-300">{{ log.action }}</span>
              <p class="text-xs text-slate-400">Target: {{ log.targetEntity }} (ID: {{ log.targetId }})</p>
            </div>
            <span class="text-xs text-slate-500">{{ new Date(log.createdAt).toLocaleTimeString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import { adminApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const logs = ref([]);
const invite = ref({ name: '', email: '', role: 'TECHNICIAN' });
const inviteMessage = ref('');
let socket = null;

const fetchLogs = async () => {
  const res = await adminApi.get('/activity-logs');
  logs.value = res.data.data;
};

const sendInvite = async () => {
  try {
    const res = await adminApi.post('/invite', invite.value);
    inviteMessage.value = res.data.message;
    invite.value = { name: '', email: '', role: 'TECHNICIAN' };
    fetchLogs();
  } catch (err) {
    inviteMessage.value = err.response?.data?.error || 'Gagal mengirim undangan.';
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchLogs();
  socket = io('http://localhost:8002');
  socket.on('connect', () => console.log('Connected to Admin Live Socket'));
  socket.on('NEW_ACTIVITY_LOG', (newLog) => {
    logs.value.unshift(newLog);
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>