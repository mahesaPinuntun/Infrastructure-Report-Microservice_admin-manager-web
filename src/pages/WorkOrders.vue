<template>
  <div class="page-wrapper">
    <!-- Header Bar -->
    <header class="header-bar">
      <div class="header-left">
        <button @click="goToDashboard" class="btn-back">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Kembali ke Dashboard Utama</span>
        </button>
        <h2>Manajemen Surat Tugas (Work Orders)</h2>
      </div>

      <button @click="showCreateModal = true" class="btn-create">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Buat Work Order Baru</span>
      </button>
    </header>

    <!-- State Card: Loading -->
    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>Memuat daftar Surat Tugas (Work Orders)...</p>
    </div>

    <!-- Table Preview Section -->
    <div v-else class="table-container">
      <div class="table-responsive">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>Surat ID</th>
              <th>Nama Perusahaan</th>
              <th>Pembuat Surat</th>
              <th>Lokasi Perbaikan</th>
              <th>Total Biaya</th>
              <th>Path Bukti Surat</th>
              <th>Tanggal Buat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="orders.length === 0">
              <td colspan="7" class="empty-cell">Belum ada Work Order aktif di sistem.</td>
            </tr>
            <tr v-for="item in orders" :key="item._id || item.id">
              <td class="code-cell">{{ item.woCode || item._id?.substring(0, 8) }}</td>
              <td class="title-cell">{{ item.companyName || 'Infrastructure_Report' }}</td>
              <td>{{ item.createdBy || '-' }}</td>
              <td>{{ item.locationName || '-' }}</td>
              <td class="price-cell">Rp {{ formatCurrency(item.grandTotal) }}</td>
              <td>
                <span class="badge-url" :title="item.proofDocumentUrl">{{ item.proofDocumentUrl || '-' }}</span>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Panggil Komponen Modal Terpisah -->
    <CreateWorkOrderModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="fetchWorkOrders"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi, managerApi } from '../services/api';
import CreateWorkOrderModal from './CreateWorkOrderModal.vue';

const router = useRouter();

const orders = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);

const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');

const getApiClient = () => {
  const user = getUserData();
  return user.role === 'ADMIN' ? adminApi : managerApi;
};

const goToDashboard = () => {
  const user = getUserData();
  const rawRole = (user.role || '').toUpperCase();
  const targetPath = (rawRole === 'MANAGER' || rawRole === 'INFRASTRUCTURE_MANAGER') ? '/manager' : '/admin';
  router.push(targetPath);
};

const fetchWorkOrders = async () => {
  loading.value = true;
  try {
    const api = getApiClient();
    const user = getUserData();
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';
    const res = await api.get(endpoint);
    orders.value = res.data.workOrders || res.data.data || res.data || [];
  } catch (err) {
    console.error('Gagal memuat Work Orders:', err);
  } finally {
    loading.value = false;
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
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --emerald-color: #10b981;
}

.page-wrapper {
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
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

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.minimal-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
}

.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color); }
.title-cell { font-weight: 600; }
.price-cell { font-weight: 700; color: var(--emerald-color); }
.badge-url { font-family: monospace; font-size: 11px; background: var(--bg-main); padding: 4px 8px; border-radius: 6px; }

.icon-sm { width: 16px; height: 16px; }
.state-card { background-color: var(--bg-card); border-radius: 16px; padding: 36px; text-align: center; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; margin: 0 auto 14px; border: 3px solid rgba(148, 163, 184, 0.2); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
