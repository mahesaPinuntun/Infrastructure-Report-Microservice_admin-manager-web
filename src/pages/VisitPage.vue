<template>
  <div class="page-wrapper">
    <!-- Header Bar -->
    <header class="header-bar">
      <div class="header-left">
        <button @click="navigateTo('/')" class="btn-back">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Kembali ke Landing Page</span>
        </button>
        <h2>Visit Mode (Pratinjau Tamu)</h2>
      </div>

      <button @click="navigateTo('/workflow')" class="btn-workflow">
        <span>Lihat Workflow Sistem</span>
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </header>

    <!-- Navigation Tabs -->
    <div class="table-toggle-buttons">
      <button 
        @click="switchTable('work-orders')" 
        :class="['btn-toggle', { active: activeTable === 'work-orders' }]"
      >
        Tabel Work Orders
      </button>
      <button 
        @click="switchTable('reports')" 
        :class="['btn-toggle', { active: activeTable === 'reports' }]"
      >
        Tabel Review Laporan
      </button>
    </div>

    <!-- Container Content -->
    <div class="table-container">
      <div v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p>Memuat data pratinjau dari server...</p>
      </div>

      <!-- Content Table Work Orders -->
      <div v-else-if="activeTable === 'work-orders'" class="table-responsive">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>Surat ID</th>
              <th>Nama Perusahaan</th>
              <th>Pembuat Surat</th>
              <th>Lokasi Perbaikan</th>
              <th>Total Biaya</th>
              <th>Tanggal Buat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="workOrders.length === 0">
              <td colspan="6" class="empty-cell">Belum ada data Work Order aktif.</td>
            </tr>
            <tr v-for="item in workOrders" :key="item._id || item.id">
              <td class="code-cell">{{ item.woCode || item.code || item._id?.substring(0, 8) }}</td>
              <td class="title-cell">{{ item.companyName || 'Infrastructure Report' }}</td>
              <td>
                <div class="creator-cell">
                  <span class="creator-name">{{ item.createdBy || item.creatorName || '-' }}</span>
                  <span v-if="item.createdByEmail || item.creatorEmail" class="creator-email">
                    {{ item.createdByEmail || item.creatorEmail }}
                  </span>
                </div>
              </td>
              <td>{{ item.locationName || item.location || '-' }}</td>
              <td class="price-cell">Rp {{ formatCurrency(item.grandTotal) }}</td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Content Table Reports -->
      <div v-else-if="activeTable === 'reports'" class="table-responsive">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>ID Laporan</th>
              <th>Deskripsi Masalah</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Tanggal Lapor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reports.length === 0">
              <td colspan="5" class="empty-cell">Belum ada data Laporan Masuk.</td>
            </tr>
            <tr v-for="item in reports" :key="item._id || item.id">
              <td class="code-cell">{{ item.code || item.reportCode || item._id?.substring(0, 8) }}</td>
              <td class="title-cell">{{ item.description || item.title || '-' }}</td>
              <td>{{ item.location || item.locationName || '-' }}</td>
              <td>
                <span :class="['badge-status', (item.status || 'PENDING').toLowerCase()]">
                  {{ item.status || 'PENDING' }}
                </span>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Menggunakan managerApi langsung yang sudah ter-export dari api.js
import { managerApi } from '../services/api';

const router = useRouter();

const activeTable = ref('work-orders');
const loading = ref(false);

const workOrders = ref([]);
const reports = ref([]);

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const navigateTo = (path) => {
  router.push(path);
};

const fetchWorkOrders = async () => {
  loading.value = true;
  try {
    const res = await managerApi.get('/api/manager/work-orders');
    const data = res.data?.data || res.data?.workOrders || res.data;
    workOrders.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Gagal memuat Work Orders:', err);
    workOrders.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchReports = async () => {
  loading.value = true;
  try {
    const res = await managerApi.get('/api/manager/reports');
    const data = res.data?.data || res.data?.reports || res.data;
    reports.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Gagal memuat Laporan:', err);
    reports.value = [];
  } finally {
    loading.value = false;
  }
};

const switchTable = (type) => {
  activeTable.value = type;
  if (type === 'work-orders' && workOrders.value.length === 0) {
    fetchWorkOrders();
  } else if (type === 'reports' && reports.value.length === 0) {
    fetchReports();
  }
};

const formatCurrency = (val) => Number(val || 0).toLocaleString('id-ID');

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

onMounted(() => {
  initTheme();
  fetchWorkOrders();
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --primary-color: #2563eb;
  --emerald-color: #059669;
  --amber-color: #d97706;
  --border-color: rgba(148, 163, 184, 0.15);
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --emerald-color: #10b981;
  --amber-color: #f59e0b;
  --border-color: rgba(255, 255, 255, 0.08);
}

:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 4px 0 0 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}

.btn-workflow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #d97706;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.table-toggle-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-toggle {
  padding: 10px 20px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle.active {
  background-color: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.table-container {
  background-color: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.minimal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.minimal-table th, .minimal-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.minimal-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
}

.empty-cell {
  text-align: center;
  color: var(--text-muted);
  padding: 24px !important;
}

.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color); }
.title-cell { font-weight: 600; }
.price-cell { font-weight: 700; color: var(--emerald-color); }

.creator-cell {
  display: flex;
  flex-direction: column;
}

.creator-name {
  font-weight: 600;
}

.creator-email {
  font-size: 11px;
  color: var(--text-muted);
}

.badge-status {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.badge-status.pending { background-color: rgba(217, 119, 6, 0.15); color: var(--amber-color); }
.badge-status.assigned { background-color: rgba(37, 99, 235, 0.15); color: var(--primary-color); }
.badge-status.completed { background-color: rgba(5, 150, 105, 0.15); color: var(--emerald-color); }

.icon-sm { width: 16px; height: 16px; }

.state-card { padding: 36px; text-align: center; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; margin: 0 auto 14px; border: 3px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
