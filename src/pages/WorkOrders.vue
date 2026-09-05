<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Daftar Work Order</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Kelola dan pantau status penugasan perbaikan infrastruktur secara real-time.
        </p>
      </div>

      <!-- Quick Action Button -->
      <button 
        @click="fetchWorkOrders" 
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Data
      </button>
    </div>

    <!-- Filter Bar & Search -->
    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari Kode WO, Lokasi..." 
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin">
        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          @click="selectedStatus = status.value"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all',
            selectedStatus === status.value 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          ]"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 1. RENDER SKELETON LOADING STATE -->
    <!-- ================================================================= -->
    <div v-if="loading" class="space-y-4">
      <!-- Desktop Table Skeleton -->
      <div class="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 animate-pulse flex gap-4">
          <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/6"></div>
          <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded w-2/6"></div>
          <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/6"></div>
          <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/6"></div>
          <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/6"></div>
        </div>
        <div v-for="i in 5" :key="i" class="p-4 border-b border-slate-100 dark:border-slate-700/50 animate-pulse flex gap-4 items-center">
          <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
          <div class="space-y-2 w-2/6">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
          <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      </div>

      <!-- Mobile Cards Skeleton -->
      <div class="grid grid-cols-1 gap-4 md:hidden">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse space-y-3">
          <div class="flex justify-between items-center">
            <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div class="pt-2 flex justify-between items-center">
            <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 2. EMPTY STATE -->
    <!-- ================================================================= -->
    <div v-else-if="filteredWorkOrders.length === 0" class="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Tidak ada Work Order ditemukan</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Coba ganti kata kunci pencarian atau filter status yang Anda pilih.</p>
    </div>

    <!-- ================================================================= -->
    <!-- 3. DATA DISPLAY (DESKTOP TABLE & MOBILE CARDS) -->
    <!-- ================================================================= -->
    <div v-else class="space-y-4">
      <!-- DESKTOP VIEW (TABLE) -->
      <div class="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Kode WO</th>
                <th class="py-3 px-4">Lokasi & Eksekusi</th>
                <th class="py-3 px-4">Teknisi Ditugaskan</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Grand Total</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
              <tr 
                v-for="wo in filteredWorkOrders" 
                :key="wo._id" 
                class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
              >
                <!-- Kode WO -->
                <td class="py-4 px-4 font-bold text-slate-900 dark:text-white">
                  {{ wo.woCode }}
                </td>

                <!-- Lokasi & Tanggal -->
                <td class="py-4 px-4">
                  <div class="font-medium text-slate-800 dark:text-slate-200">{{ wo.locationName }}</div>
                  <div class="text-xs text-slate-500">
                    🗓️ {{ formatDate(wo.executionDate) }}
                  </div>
                </td>

                <!-- Teknisi -->
                <td class="py-4 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="(tech, idx) in wo.technicians" 
                      :key="idx" 
                      class="inline-block px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                    >
                      👤 {{ tech.name }}
                    </span>
                    <span v-if="!wo.technicians || wo.technicians.length === 0" class="text-xs text-slate-400 font-italic">
                      Belum ditugaskan
                    </span>
                  </div>
                </td>

                <!-- STATUS BADGE -->
                <td class="py-4 px-4">
                  <span :class="['px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5', getStatusBadge(wo.status).class]">
                    <span class="w-1.5 h-1.5 rounded-full" :class="getStatusBadge(wo.status).dot"></span>
                    {{ getStatusBadge(wo.status).label }}
                  </span>
                </td>

                <!-- Grand Total -->
                <td class="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                  {{ formatCurrency(wo.grandTotal) }}
                </td>

                <!-- Detail Button -->
                <td class="py-4 px-4 text-right">
                  <button 
                    @click="openDetailModal(wo)"
                    class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-xs rounded-lg transition-colors"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE VIEW (CARDS) -->
      <div class="grid grid-cols-1 gap-4 md:hidden">
        <div 
          v-for="wo in filteredWorkOrders" 
          :key="wo._id" 
          class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3"
        >
          <!-- Top Row: WO Code & Status -->
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">WORK ORDER</span>
              <h4 class="font-bold text-slate-900 dark:text-white text-base">{{ wo.woCode }}</h4>
            </div>
            <!-- STATUS BADGE MOBILE -->
            <span :class="['px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1', getStatusBadge(wo.status).class]">
              {{ getStatusBadge(wo.status).label }}
            </span>
          </div>

          <!-- Location & Execution -->
          <div class="text-sm space-y-1">
            <div class="text-slate-800 dark:text-slate-200 font-medium">📍 {{ wo.locationName }}</div>
            <div class="text-xs text-slate-500">🗓️ {{ formatDate(wo.executionDate) }}</div>
          </div>

          <!-- Technicians -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-700">
            <div class="text-xs text-slate-500 mb-1">Teknisi:</div>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="(tech, idx) in wo.technicians" 
                :key="idx" 
                class="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
              >
                {{ tech.name }}
              </span>
            </div>
          </div>

          <!-- Bottom Row: Total & Action Button -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <span class="text-xs text-slate-400 block">Total Biaya</span>
              <span class="font-bold text-slate-900 dark:text-white text-sm">{{ formatCurrency(wo.grandTotal) }}</span>
            </div>
            <button 
              @click="openDetailModal(wo)"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 4. MODAL DETAIL WORK ORDER (Termasuk Foto Bukti Perbaikan) -->
    <!-- ================================================================= -->
    <div 
      v-if="selectedWO" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      @click.self="closeDetailModal"
    >
      <div class="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
        <!-- Modal Header -->
        <div class="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Rincian Work Order</span>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ selectedWO.woCode }}</h3>
          </div>
          <button @click="closeDetailModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 md:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <!-- Status Banner -->
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50">
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Status Work Order:</span>
            <span :class="['px-3 py-1 text-xs font-bold rounded-full border', getStatusBadge(selectedWO.status).class]">
              {{ getStatusBadge(selectedWO.status).label }}
            </span>
          </div>

          <!-- Informasi Umum -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-slate-500 text-xs block">Lokasi Perbaikan</span>
              <p class="font-semibold text-slate-800 dark:text-slate-200">{{ selectedWO.locationName }}</p>
            </div>
            <div>
              <span class="text-slate-500 text-xs block">Tanggal Eksekusi</span>
              <p class="font-semibold text-slate-800 dark:text-slate-200">{{ formatDate(selectedWO.executionDate) }}</p>
            </div>
            <div class="md:col-span-2">
              <span class="text-slate-500 text-xs block">Pendahuluan / Deskripsi</span>
              <p class="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs mt-1">
                {{ selectedWO.introduction || 'Tidak ada deskripsi pendahuluan.' }}
              </p>
            </div>
          </div>

          <!-- Rincian Teknisi -->
          <div>
            <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teknisi Lapangan</h5>
            <div class="space-y-2">
              <div 
                v-for="(tech, idx) in selectedWO.technicians" 
                :key="idx" 
                class="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs"
              >
                <div>
                  <span class="font-semibold text-slate-800 dark:text-slate-200 block">{{ tech.name }}</span>
                  <span class="text-slate-500">{{ tech.email || tech.phone || '-' }}</span>
                </div>
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(tech.fee) }}</span>
              </div>
            </div>
          </div>

          <!-- Rincian Material -->
          <div>
            <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rincian Material & Biaya</h5>
            <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-900 text-slate-500">
                  <tr>
                    <th class="p-2">Item</th>
                    <th class="p-2">Qty</th>
                    <th class="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="(item, idx) in selectedWO.resources" :key="idx">
                    <td class="p-2 text-slate-800 dark:text-slate-200">{{ item.name }}</td>
                    <td class="p-2 text-slate-600 dark:text-slate-400">{{ item.quantity }} {{ item.unit }}</td>
                    <td class="p-2 text-right font-medium text-slate-800 dark:text-slate-200">{{ formatCurrency(item.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
              <span class="text-slate-800 dark:text-slate-200">Grand Total:</span>
              <span class="text-indigo-600 dark:text-indigo-400">{{ formatCurrency(selectedWO.grandTotal) }}</span>
            </div>
          </div>

          <!-- Galeri Foto Bukti Perbaikan (Cloudinary Images) -->
          <div>
            <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              📷 Foto Bukti Perbaikan dari Teknisi ({{ selectedWO.progressImages?.length || 0 }})
            </h5>
            <div v-if="selectedWO.progressImages && selectedWO.progressImages.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a 
                v-for="(imgUrl, idx) in selectedWO.progressImages" 
                :key="idx" 
                :href="imgUrl" 
                target="_blank" 
                class="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <img :src="imgUrl" alt="Bukti Perbaikan" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Perbesar 🔍
                </div>
              </a>
            </div>
            <div v-else class="text-xs text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
              Belum ada foto bukti perbaikan yang diunggah oleh teknisi.
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-right">
          <button 
            @click="closeDetailModal" 
            class="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// =========================================================================
// STATE
// =========================================================================
const workOrders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedWO = ref(null);

const MANAGER_API_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const statusOptions = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

// =========================================================================
// FETCH DATA
// =========================================================================
const fetchWorkOrders = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${MANAGER_API_URL}/api/manager/work-orders`);
    workOrders.value = response.data?.data || response.data?.workOrders || [];
  } catch (error) {
    console.error('Error fetching work orders:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWorkOrders();
});

// =========================================================================
// COMPUTED / FILTERING
// =========================================================================
const filteredWorkOrders = computed(() => {
  return workOrders.value.filter((wo) => {
    // Filter berdasarkan status
    const matchesStatus = selectedStatus.value === 'ALL' || wo.status === selectedStatus.value;
    
    // Filter berdasarkan pencarian
    const query = searchQuery.value.toLowerCase();
    const matchesQuery = 
      !query || 
      wo.woCode?.toLowerCase().includes(query) || 
      wo.locationName?.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });
});

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================
const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED':
      return {
        label: 'Assigned',
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        dot: 'bg-blue-500'
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        class: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
        dot: 'bg-cyan-500'
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
        dot: 'bg-rose-500'
      };
    default:
      return {
        label: status || 'Unknown',
        class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
        dot: 'bg-slate-400'
      };
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// =========================================================================
// MODAL ACTIONS
// =========================================================================
const openDetailModal = (wo) => {
  selectedWO.value = wo;
};

const closeDetailModal = () => {
  selectedWO.value = null;
};
</script>

<style scoped>
/* Scrollbar khusus untuk tab filter status pada layar ponsel */
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 4px;
}
</style>
