<template>
  <div class="page-container">
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

    <!-- Data Table -->
    <div v-else class="table-responsive">
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
          <tr v-if="reports.length === 0">
            <td colspan="6" class="empty-cell">Belum ada laporan infrastruktur.</td>
          </tr>
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

              <!-- Fitur Khusus Manager: Buat Work Order langsung dari laporan -->
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi, managerApi } from '../services/api';

const router = useRouter();
const reports = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const userRole = ref('');

const fetchReports = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (storedUser.role || '').toString().trim().toUpperCase();
    
    // Normalisasi Role
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

// Navigasi dari ReportsList.vue ke WorkOrders.vue
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
.page-container {
  padding: 24px;
  background-color: var(--bg-main, #f8fafc);
  min-height: 100vh;
}

.header-section {
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.table-responsive {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 600;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.empty-cell {
  text-align: center;
  color: #94a3b8;
  padding: 24px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
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
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-wo {
  padding: 6px 10px;
  background-color: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-wo:hover {
  background-color: #059669;
}

.loading-state, .error-message {
  padding: 24px;
  text-align: center;
  color: #64748b;
}

.btn-retry {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
