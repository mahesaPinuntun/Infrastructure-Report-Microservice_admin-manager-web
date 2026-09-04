<template>
  <div class="page-container">
    <!-- BAR NAVIGASI KEMBALI KE DASHBOARD -->
    <div class="top-bar">
      <router-link :to="dashboardRoute" class="back-link">
        &larr; Kembali ke Dashboard ({{ userRole === 'ADMIN' ? 'Admin' : 'Manager' }})
      </router-link>
    </div>

    <div class="header-section">
      <h2>Daftar Laporan Infrastruktur</h2>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchReports" class="btn-retry">Coba Lagi</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">Memuat data laporan...</div>

    <!-- Empty State -->
    <div v-else-if="reports.length === 0" class="empty-box">
      Belum ada laporan infrastruktur.
    </div>

    <!-- Content Area -->
    <div v-else class="content-container">
      <!-- 1. TAMPILAN DESKTOP (Tabel) -->
      <div class="table-responsive desktop-only">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID Laporan</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reports" :key="item._id || item.id">
              <td>
                <strong>{{ (item._id || item.id || '').substring(0, 8) }}</strong>
              </td>
              <td>{{ item.title || item.description || '-' }}</td>
              <td>{{ item.category || '-' }}</td>
              <td>{{ item.location || '-' }}</td>
              <td>
                <span :class="['badge', (item.status || 'PENDING').toLowerCase()]">
                  {{ item.status || 'PENDING' }}
                </span>
              </td>
              <td class="action-cell">
                <router-link :to="`/reports/${item._id || item.id}`" class="btn-link">
                  Detail
                </router-link>

                <button 
                  v-if="userRole === 'MANAGER'" 
                  @click="createWorkOrderForReport(item._id || item.id, item.title || item.description)" 
                  class="btn-wo"
                >
                  + Work Order
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. TAMPILAN MOBILE (2 Rows Per Data) -->
      <div class="mobile-only">
        <div v-for="item in reports" :key="'mob-' + (item._id || item.id)" class="mobile-report-card">
          <!-- BARIS 1: Header (ID, Judul & Status Badge) -->
          <div class="card-row row-main">
            <div class="title-group">
              <span class="report-id">#{{ (item._id || item.id || '').substring(0, 8) }}</span>
              <h4 class="report-title">{{ item.title || item.description || '-' }}</h4>
            </div>
            <span :class="['badge', (item.status || 'PENDING').toLowerCase()]">
              {{ item.status || 'PENDING' }}
            </span>
          </div>

          <!-- BARIS 2: Detail (Kategori, Lokasi & Tombol Aksi) -->
          <div class="card-row row-sub">
            <div class="meta-group">
              <span class="meta-item">
                <strong>Kategori:</strong> {{ item.category || '-' }}
              </span>
              <span class="meta-item">
                <strong>Lokasi:</strong> {{ item.location || '-' }}
              </span>
            </div>
            <div class="action-group">
              <router-link :to="`/reports/${item._id || item.id}`" class="btn-link">
                Detail
              </router-link>
              <button 
                v-if="userRole === 'MANAGER'" 
                @click="createWorkOrderForReport(item._id || item.id, item.title || item.description)" 
                class="btn-wo"
              >
                + Work Order
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi, managerApi } from '../services/api';

const router = useRouter();
const reports = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const userRole = ref('');

const dashboardRoute = computed(() => {
  return userRole.value === 'ADMIN' ? '/admin' : '/manager';
});

const fetchReports = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (storedUser.role || '').toString().trim().toUpperCase();
    
    userRole.value = rawRole.includes('MANAGER') ? 'MANAGER' : rawRole;

    const api = userRole.value === 'ADMIN' ? adminApi : managerApi;
    const endpoint = userRole.value === 'ADMIN' ? '/api/admin/reports' : '/api/manager/reports';

    const res = await api.get(endpoint);
    const data = res?.data?.reports || res?.data?.data || res?.data || [];
    reports.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    errorMessage.value = 'Gagal memuat data laporan dari server.';
  } finally {
    loading.value = false;
  }
};

const createWorkOrderForReport = (reportId, reportTitle) => {
  router.push({
    path: '/work-orders',
    query: { reportId, title: reportTitle }
  });
};

onMounted(() => {
  fetchReports();
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --primary-color: #2563eb;
  --table-hover: #f1f5f9;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary-color: #3b82f6;
  --table-hover: #334155;
}

.page-container {
  padding: 24px;
  background-color: var(--bg-main);
  color: var(--text-main);
  min-height: 100vh;
  box-sizing: border-box;
}

.top-bar {
  margin-bottom: 16px;
}

.back-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.header-section {
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
}

.table-responsive {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.data-table th, 
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background-color: var(--bg-main);
  color: var(--text-muted);
  font-weight: 600;
}

.data-table tbody tr:hover {
  background-color: var(--table-hover);
}

/* STYLES TAMPILAN MOBILE (2 ROWS PER DATA) */
.mobile-only {
  display: none;
}

.mobile-report-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.row-main {
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 8px;
}

.title-group {
  display: flex;
  flex-direction: column;
}

.report-id {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-color);
  font-family: monospace;
}

.report-title {
  margin: 2px 0 0 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.row-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.meta-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge.pending { background-color: #fef3c7; color: #b45309; }
.badge.in_progress, .badge.process { background-color: #e0f2fe; color: #0369a1; }
.badge.completed, .badge.resolved { background-color: #dcfce7; color: #15803d; }
.badge.rejected { background-color: #fee2e2; color: #b91c1c; }

.action-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
}

.btn-wo {
  padding: 5px 8px;
  background-color: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.loading-state, .error-message, .empty-box {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.btn-retry {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* MEDIA QUERY UNTUK TAMPILAN MOBILE */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: flex;
    flex-direction: column;
  }
  .page-container {
    padding: 16px;
  }
}
</style>
