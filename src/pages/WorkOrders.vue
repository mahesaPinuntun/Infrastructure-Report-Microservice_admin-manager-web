<template>
  <div class="wo-container">
    <!-- Header Page -->
    <div class="wo-header">
      <div>
        <h1 class="wo-title">Daftar Work Order</h1>
        <p class="wo-subtitle">
          Kelola dan pantau status penugasan perbaikan infrastruktur secara real-time.
        </p>
      </div>

      <!-- Refresh Button -->
      <button @click="fetchWorkOrders" class="btn-refresh" :disabled="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" :class="{ 'spin-anim': loading }">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Refresh Data</span>
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="wo-filter-bar">
      <!-- Search Box -->
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari Kode WO, Lokasi..." 
          class="search-input"
        />
      </div>

      <!-- Status Filter Tabs -->
      <div class="status-tabs">
        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          @click="selectedStatus = status.value"
          :class="['tab-btn', { active: selectedStatus === status.value }]"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 1. SKELETON LOADING STATE -->
    <!-- ================================================================= -->
    <div v-if="loading" class="skeleton-wrapper">
      <!-- Desktop Skeleton Table -->
      <div class="desktop-only skeleton-table">
        <div v-for="i in 5" :key="i" class="skeleton-row">
          <div class="skeleton-block w-20"></div>
          <div class="skeleton-block w-40"></div>
          <div class="skeleton-block w-30"></div>
          <div class="skeleton-block w-24 badge"></div>
          <div class="skeleton-block w-24"></div>
          <div class="skeleton-block w-16"></div>
        </div>
      </div>

      <!-- Mobile Skeleton Cards -->
      <div class="mobile-only skeleton-cards">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-header">
            <div class="skeleton-block w-30"></div>
            <div class="skeleton-block w-20 badge"></div>
          </div>
          <div class="skeleton-block w-50"></div>
          <div class="skeleton-block w-40"></div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 2. EMPTY STATE -->
    <!-- ================================================================= -->
    <div v-else-if="filteredWorkOrders.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      <h3>Tidak ada Work Order ditemukan</h3>
      <p>Coba ubah kata kunci pencarian atau pilih filter status lainnya.</p>
    </div>

    <!-- ================================================================= -->
    <!-- 3. DATA DISPLAY (RESPONSIVE TABLE & CARDS) -->
    <!-- ================================================================= -->
    <div v-else>
      <!-- DESKTOP TABLE -->
      <div class="desktop-only table-card">
        <table class="wo-table">
          <thead>
            <tr>
              <th>Kode WO</th>
              <th>Lokasi & Eksekusi</th>
              <th>Teknisi Ditugaskan</th>
              <th>Status</th>
              <th>Grand Total</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wo in filteredWorkOrders" :key="wo._id">
              <td class="font-bold text-dark">{{ wo.woCode }}</td>
              <td>
                <div class="font-medium">{{ wo.locationName }}</div>
                <div class="text-sub font-xs">🗓️ {{ formatDate(wo.executionDate) }}</div>
              </td>
              <td>
                <div class="tech-chips">
                  <span v-for="(tech, idx) in wo.technicians" :key="idx" class="tech-chip">
                    👤 {{ tech.name }}
                  </span>
                  <span v-if="!wo.technicians || wo.technicians.length === 0" class="text-muted font-xs">
                    Belum ada
                  </span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', getStatusBadge(wo.status).class]">
                  <span class="badge-dot"></span>
                  {{ getStatusBadge(wo.status).label }}
                </span>
              </td>
              <td class="font-bold text-dark">{{ formatCurrency(wo.grandTotal) }}</td>
              <td class="text-right">
                <button @click="openDetailModal(wo)" class="btn-detail">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARDS -->
      <div class="mobile-only cards-list">
        <div v-for="wo in filteredWorkOrders" :key="wo._id" class="wo-card">
          <div class="card-header">
            <div>
              <span class="card-tag">WORK ORDER</span>
              <h4 class="card-code">{{ wo.woCode }}</h4>
            </div>
            <span :class="['status-badge', getStatusBadge(wo.status).class]">
              {{ getStatusBadge(wo.status).label }}
            </span>
          </div>

          <div class="card-body">
            <div class="card-info">📍 <strong>{{ wo.locationName }}</strong></div>
            <div class="card-info text-sub">🗓️ {{ formatDate(wo.executionDate) }}</div>
          </div>

          <div class="card-techs">
            <span class="text-muted font-xs">Teknisi:</span>
            <div class="tech-chips">
              <span v-for="(tech, idx) in wo.technicians" :key="idx" class="tech-chip">
                {{ tech.name }}
              </span>
            </div>
          </div>

          <div class="card-footer">
            <div>
              <span class="font-xs text-muted block">Total Biaya</span>
              <span class="font-bold text-dark">{{ formatCurrency(wo.grandTotal) }}</span>
            </div>
            <button @click="openDetailModal(wo)" class="btn-primary-sm">Lihat Detail</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 4. MODAL DETAIL WORK ORDER -->
    <!-- ================================================================= -->
    <div v-if="selectedWO" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <span class="font-xs text-indigo font-bold">Rincian Work Order</span>
            <h3>{{ selectedWO.woCode }}</h3>
          </div>
          <button @click="closeDetailModal" class="btn-close">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Status Banner -->
          <div class="modal-status-banner">
            <span>Status Pekerjaan:</span>
            <span :class="['status-badge', getStatusBadge(selectedWO.status).class]">
              {{ getStatusBadge(selectedWO.status).label }}
            </span>
          </div>

          <!-- Info Umum -->
          <div class="info-grid">
            <div>
              <span class="label">Lokasi Perbaikan</span>
              <p class="value">{{ selectedWO.locationName }}</p>
            </div>
            <div>
              <span class="label">Tanggal Eksekusi</span>
              <p class="value">{{ formatDate(selectedWO.executionDate) }}</p>
            </div>
          </div>

          <!-- Deskripsi -->
          <div>
            <span class="label">Deskripsi / Pendahuluan</span>
            <div class="desc-box">{{ selectedWO.introduction || 'Tidak ada deskripsi.' }}</div>
          </div>

          <!-- Rincian Teknisi -->
          <div>
            <span class="label uppercase">Teknisi Lapangan</span>
            <div class="tech-list">
              <div v-for="(tech, idx) in selectedWO.technicians" :key="idx" class="tech-item">
                <div>
                  <strong>{{ tech.name }}</strong>
                  <span class="block text-sub font-xs">{{ tech.email || tech.phone || '-' }}</span>
                </div>
                <span>{{ formatCurrency(tech.fee) }}</span>
              </div>
            </div>
          </div>

          <!-- Rincian Biaya & Material -->
          <div>
            <span class="label uppercase">Rincian Material & Biaya</span>
            <table class="mini-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedWO.resources" :key="idx">
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }} {{ item.unit }}</td>
                  <td class="text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="grand-total-row">
              <span>Grand Total:</span>
              <span class="text-indigo font-bold">{{ formatCurrency(selectedWO.grandTotal) }}</span>
            </div>
          </div>

          <!-- Galeri Foto Bukti Perbaikan dari Cloudinary -->
          <div>
            <span class="label uppercase">
              📷 Foto Bukti Perbaikan ({{ selectedWO.progressImages?.length || 0 }})
            </span>
            <div v-if="selectedWO.progressImages && selectedWO.progressImages.length > 0" class="image-grid">
              <a v-for="(imgUrl, idx) in selectedWO.progressImages" :key="idx" :href="imgUrl" target="_blank" class="img-wrapper">
                <img :src="imgUrl" alt="Bukti Perbaikan" />
              </a>
            </div>
            <div v-else class="no-images">
              Belum ada foto bukti perbaikan yang diunggah oleh teknisi.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

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

const filteredWorkOrders = computed(() => {
  return workOrders.value.filter((wo) => {
    const matchesStatus = selectedStatus.value === 'ALL' || wo.status === selectedStatus.value;
    const query = searchQuery.value.toLowerCase();
    const matchesQuery = 
      !query || 
      wo.woCode?.toLowerCase().includes(query) || 
      wo.locationName?.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });
});

const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED':
      return { label: 'Assigned', class: 'badge-blue' };
    case 'ACCEPTED':
      return { label: 'Accepted', class: 'badge-amber' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', class: 'badge-cyan' };
    case 'COMPLETED':
      return { label: 'Completed', class: 'badge-green' };
    case 'CANCELLED':
      return { label: 'Cancelled', class: 'badge-red' };
    default:
      return { label: status || 'Unknown', class: 'badge-gray' };
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

const openDetailModal = (wo) => { selectedWO.value = wo; };
const closeDetailModal = () => { selectedWO.value = null; };
</script>

<style scoped>
/* =========================================================================
   SCOPED STYLES & LAYOUT FIXES (CEGAH IKON/TAMPILAN BERANTAKAN)
   ========================================================================= */

.wo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
}

/* Header */
.wo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.wo-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.wo-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #4f46e5;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-refresh:hover { background-color: #4338ca; }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

/* Controlled SVG Dimensions */
.icon-sm { width: 16px; height: 16px; flex-shrink: 0; }
.search-icon { width: 18px; height: 18px; flex-shrink: 0; color: #94a3b8; }
.empty-icon { width: 48px; height: 48px; margin-bottom: 12px; }

.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Filter Bar */
.wo-filter-bar {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
  max-width: 320px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: #0f172a;
}

.status-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.tab-btn.active {
  background-color: #4f46e5;
  color: #ffffff;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

.badge-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; }
.badge-blue { background-color: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.badge-amber { background-color: #fffbeb; color: #b45309; border-color: #fef3c7; }
.badge-cyan { background-color: #ecfeff; color: #0e7490; border-color: #cffaff; }
.badge-green { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.badge-red { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.badge-gray { background-color: #f1f5f9; color: #475569; border-color: #e2e8f0; }

/* Table Styling */
.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.wo-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.wo-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.wo-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

/* Mobile Cards View */
.cards-list { display: flex; flex-direction: column; gap: 12px; }

.wo-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.card-tag { font-size: 10px; font-weight: 700; color: #4f46e5; display: block; }
.card-code { font-size: 16px; font-weight: 700; color: #0f172a; margin: 2px 0 0 0; }
.card-body { font-size: 13px; margin-bottom: 12px; }
.card-techs { border-top: 1px solid #f1f5f9; padding-top: 8px; margin-bottom: 12px; }
.card-footer { border-top: 1px solid #f1f5f9; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; }

.tech-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.tech-chip { background: #f1f5f9; color: #334155; font-size: 11px; padding: 2px 8px; border-radius: 4px; }

/* Buttons */
.btn-detail {
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-detail:hover { background-color: #e2e8f0; }

.btn-primary-sm {
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 999;
}

.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 18px; color: #0f172a; }
.btn-close { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }

.modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-status-banner { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.label { font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 2px; }
.value { font-size: 13px; font-weight: 600; color: #1e293b; margin: 0; }
.desc-box { background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 12px; color: #334155; }

.tech-list { display: flex; flex-direction: column; gap: 6px; }
.tech-item { display: flex; justify-content: space-between; background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12px; }

.mini-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
.mini-table th, .mini-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; text-align: left; }
.grand-total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; margin-top: 8px; }

.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
.img-wrapper { aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.no-images { font-size: 12px; color: #94a3b8; font-style: italic; text-align: center; padding: 12px; background: #f8fafc; border-radius: 6px; }

.modal-footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: right; }
.btn-secondary { background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

/* Skeleton Loading Animation */
.skeleton-wrapper { display: flex; flex-direction: column; gap: 12px; }
.skeleton-table, .skeleton-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
.skeleton-row { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.skeleton-block { height: 16px; background: #e2e8f0; border-radius: 4px; animation: pulse 1.5s infinite ease-in-out; }
.skeleton-block.badge { height: 24px; border-radius: 12px; }
.w-16 { width: 60px; } .w-20 { width: 80px; } .w-24 { width: 100px; } .w-30 { width: 140px; } .w-40 { width: 180px; } .w-50 { width: 220px; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }

/* Responsive Visibility Helpers */
@media (min-width: 768px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }
}

@media (max-width: 767px) {
  .mobile-only { display: block !important; }
  .desktop-only { display: none !important; }
  .info-grid { grid-template-columns: 1fr; }
  .search-box { max-width: 100%; }
}

/* Helpers */
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-xs { font-size: 11px; }
.text-dark { color: #0f172a; }
.text-sub { color: #64748b; }
.text-muted { color: #94a3b8; }
.text-indigo { color: #4f46e5; }
.block { display: block; }
.uppercase { text-transform: uppercase; }
.empty-state { text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
</style>
