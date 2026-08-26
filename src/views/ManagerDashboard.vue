<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 p-6">
    <header class="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
      <h1 class="text-3xl font-bold text-indigo-400">Infrastructure Manager Dashboard</h1>
      <button @click="logout" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-sm font-semibold">Logout</button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Form Terbitkan Work Order / Surat Tugas PDF -->
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 class="text-xl font-bold mb-4 text-indigo-300">Terbitkan Surat Tugas (Warrant PDF)</h2>
        <form @submit.prevent="submitWorkOrder" class="space-y-4">
          <div>
            <label class="block text-sm mb-1">Judul Perbaikan / Inspeksi</label>
            <input v-model="workOrder.title" type="text" required class="w-full bg-slate-700 border border-slate-600 rounded p-2" />
          </div>
          <div>
            <label class="block text-sm mb-1">Tipe Job Order</label>
            <select v-model="workOrder.type" class="w-full bg-slate-700 border border-slate-600 rounded p-2">
              <option value="REPAIR">Perbaikan (Repair)</option>
              <option value="CHECKUP">Pemeriksaan Berkala (Checkup)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Dokumen PDF Warrant (Surat Tugas)</label>
            <input type="file" @change="handleFilePdf" accept="application/pdf" required class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm mb-1">Foto Kondisi Terkini (Optional)</label>
            <input type="file" @change="handleFileImg" accept="image/*" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm" />
          </div>
          <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold p-2 rounded">
            Upload & Terbitkan Work Order
          </button>
        </form>
      </div>

      <!-- Live Work Orders Monitor -->
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 class="text-xl font-bold mb-4 text-emerald-400">Daftar Work Orders & Status</h2>
        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          <div v-for="wo in workOrders" :key="wo._id" class="p-4 bg-slate-700/50 rounded border border-slate-600">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-lg text-indigo-300">{{ wo.title }}</h3>
              <span class="px-2 py-1 text-xs font-bold rounded bg-indigo-900 text-indigo-300">{{ wo.status }}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Tipe: {{ wo.type }}</p>
            <a :href="wo.warrantPdfUrl" target="_blank" class="inline-block mt-2 text-xs text-blue-400 underline">Lihat Warrant PDF</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { managerApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const workOrders = ref([]);

const workOrder = ref({
  title: '',
  type: 'REPAIR',
  warrantPdf: null,
  currentPicture: null
});

const handleFilePdf = (e) => workOrder.value.warrantPdf = e.target.files[0];
const handleFileImg = (e) => workOrder.value.currentPicture = e.target.files[0];

const fetchWorkOrders = async () => {
  const res = await managerApi.get('/work-orders');
  workOrders.value = res.data.data;
};

const submitWorkOrder = async () => {
  try {
    const formData = new FormData();
    formData.append('title', workOrder.value.title);
    formData.append('type', workOrder.value.type);
    formData.append('warrantPdf', workOrder.value.warrantPdf);
    if (workOrder.value.currentPicture) {
      formData.append('currentPicture', workOrder.value.currentPicture);
    }

    await managerApi.post('/work-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    workOrder.value.title = '';
    fetchWorkOrders();
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal membuat work order');
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchWorkOrders();
});
</script>