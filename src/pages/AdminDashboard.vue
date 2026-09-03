<template>
  <div class="dashboard-page">
    <div class="header-container">
      <div class="header-title">
        <h1>Admin System Dashboard</h1>
        <p class="subtitle">Selamat datang kembali, Administrator ({{ user?.email || '-' }})</p>
      </div>

      <div class="header-actions">
        <!-- Toggle Theme Button -->
        <button @click="toggleTheme" class="btn-theme-toggle" title="Ubah Tema">
          <svg v-if="currentTheme === 'dark'" class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Logout Button -->
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Memuat data statistik admin...</div>

    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchStats" class="btn-retry">Coba Lagi</button>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Laporan System</h3>
          <p class="stat-number">{{ stats.totalReports || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Teknisi Aktif</h3>
          <p class="stat-number">{{ stats.activeTechnicians || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Status System Health</h3>
          <p class="stat-number health-ok">{{ stats.systemHealth || 'GOOD' }}</p>
        </div>
      </div>

      <!-- Quick Actions & Dropdown Controls -->
      <div class="quick-actions">
        <div class="actions-header">
          <h3>Filter Data Dashboard</h3>
          
          <div class="dropdown-group">
            <!-- Dropdown 1: Tipe Data/Tabel -->
            <div class="dropdown-container">
              <label class="dropdown-label">Pilih Tabel:</label>
              <select v-model="selectedTable" @change="handleTableChange" class="table-select">
                <option value="none">-- Sembunyikan Tabel --</option>
                <option value="users">Tabel Pengguna (By Role)</option>
                <option value="reports">Tabel Laporan Kerusakan</option>
                <option value="workOrders">Tabel Work Orders (Manager)</option>
              </select>
            </div>

            <!-- Dropdown 2: Filter Per Role -->
            <div v-if="selectedTable === 'users'" class="dropdown-container">
              <label class="dropdown-label">Display Per Role:</label>
              <select v-model="selectedRole" @change="handleRoleChange" class="table-select role-select">
                <option value="ALL">Semua Role</option>
                <option value="USER">User (Pelapor)</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <router-link to="/users" class="btn-action">Kelola Pengguna & Roles</router-link>
          <router-link to="/reports" class="btn-action outline">Lihat Semua Laporan</router-link>
        </div>
      </div>

      <!-- Dynamic Data Table Section -->
      <div v-if="selectedTable !== 'none'" class="table-section">
        <div class="table-header">
          <h4>{{ tableTitle }} <span v-if="selectedTable === 'users'" class="role-tag">({{ selectedRole }})</span></h4>
          <span v-if="tableLoading" class="table-loading-tag">Memuat data...</span>
        </div>

        <div v-if="tableLoading" class="loading-state">Memuat isi tabel...</div>
        
        <div v-else-if="filteredTableData.length === 0" class="empty-table">
          Tidak ada data {{ tableTitle.toLowerCase() }} untuk kriteria ini.
        </div>

        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="col in tableColumns" :key="col.key">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in filteredTableData" :key="item._id || item.id || idx">
                <td v-for="col in tableColumns" :key="col.key">
                  
                  <!-- CUSTOM DISPLAY FOR WORK ORDERS -->
                  <template v-if="selectedTable === 'workOrders'">
                    <span v-if="col.key === 'workOrderNumber'">
                      <strong>{{ item.workOrderNumber || item.woNumber || item.code || (item._id ? item._id.substring(0, 8) : '-') }}</strong>
                    </span>

                    <span v-else-if="col.key === 'title'">
                      {{ item.title || item.reportTitle || item.reportId?.title || item.report?.title || '-' }}
                    </span>

                    <span v-else-if="col.key === 'technicians'">
                      {{ getTechnicianName(item) }}
                    </span>

                    <span v-else-if="col.key === 'priority'">
                      <span :class="['priority-badge', (item.priority || item.reportId?.priority || 'NORMAL').toLowerCase()]">
                        {{ item.priority || item.reportId?.priority || '-' }}
                      </span>
                    </span>

                    <span v-else-if="col.key === 'status'">
                      <span :class="['status-badge', (item.status || 'PENDING').toLowerCase()]">
                        {{ item.status || 'ASSIGNED' }}
                      </span>
                    </span>

                    <span v-else>
                      {{ item[col.key] || '-' }}
                    </span>
                  </template>

                  <!-- DISPLAY FOR OTHER TABLES (USERS & REPORTS) -->
                  <template v-else>
                    <span v-if="col.key === 'role'" class="role-badge">
                      {{ item.role || 'USER' }}
                    </span>

                    <span v-else-if="col.key === 'status'" :class="['status-badge', (item[col.key] || 'PENDING').toLowerCase()]">
                      {{ item[col.key] || 'PENDING' }}
                    </span>

                    <span v-else-if="col.key === 'createdAt' || col.key === 'visitDate'">
                      {{ formatDate(item[col.key]) }}
                    </span>

                    <span v-else-if="col.key === 'contact'">
                      {{ item.phone || item.phoneNumber || '-' }}
                    </span>

                    <span v-else>
                      {{ item[col.key] || '-' }}
                    </span>
                  </template>

                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { adminApi, logout } from '../services/api';

const stats = ref({ totalReports: 0, activeTechnicians: 0, systemHealth: 'GOOD' });
const user = ref(null);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');

const selectedTable = ref('none');
const selectedRole = ref('ALL');
const rawTableData = ref([]);
const tableLoading = ref(false);

const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL || 'https://infrastructure-report-microservice-admin-service.vercel.app';
const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  currentTheme.value = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  localStorage.setItem('user-theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};

const tableTitle = computed(() => {
  switch (selectedTable.value) {
    case 'reports': return 'Daftar Laporan Kerusakan';
    case 'users': return 'Daftar Pengguna System';
    case 'workOrders': return 'Daftar Work Orders';
    default: return '';
  }
});

const tableColumns = computed(() => {
  switch (selectedTable.value) {
    case 'reports':
      return [
        { key: 'title', label: 'Judul Laporan' },
        { key: 'category', label: 'Kategori' },
        { key: 'location', label: 'Lokasi' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Tanggal' }
      ];
    case 'users':
      return [
        { key: 'name', label: 'Nama' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'contact', label: 'No. Telepon' },
        { key: 'status', label: 'Status' }
      ];
    case 'workOrders':
      return [
        { key: 'workOrderNumber', label: 'No. WO' },
        { key: 'title', label: 'Judul Pekerjaan' },
        { key: 'technicians', label: 'Teknisi' },
        { key: 'priority', label: 'Prioritas' },
        { key: 'status', label: 'Status' }
      ];
    default:
      return [];
  }
});

const filteredTableData = computed(() => {
  if (selectedTable.value !== 'users' || selectedRole.value === 'ALL') {
    return rawTableData.value;
  }

  const targetRole = selectedRole.value.toUpperCase();

  return rawTableData.value.filter(item => {
    const itemRole = (item.role || '').toString().trim().toUpperCase();
    if (targetRole === 'INFRASTRUCTURE_MANAGER' || targetRole === 'MANAGER') {
      return itemRole === 'INFRASTRUCTURE_MANAGER' || itemRole === 'MANAGER';
    }
    return itemRole === targetRole;
  });
});

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await adminApi.get('/api/admin/stats');
    const rawData = res?.data?.stats || res?.data || {};
    stats.value = {
      totalReports: rawData.totalReports ?? 0,
      activeTechnicians: rawData.activeTechnicians ?? 0,
      systemHealth: rawData.systemHealth || 'GOOD'
    };
  } catch (err) {
    console.error('Gagal memuat statistik admin:', err);
    errorMessage.value = 'Gagal memuat data statistik dari server.';
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async () => {
  if (selectedTable.value === 'none') {
    rawTableData.value = [];
    return;
  }

  tableLoading.value = true;
  rawTableData.value = [];

  try {
    let endpoint = '';
    if (selectedTable.value === 'reports') {
      endpoint = `${ADMIN_SERVICE_URL}/api/admin/reports`;
    } else if (selectedTable.value === 'users') {
      endpoint = `${ADMIN_SERVICE_URL}/api/admin/users`;
    } else if (selectedTable.value === 'workOrders') {
      endpoint = `${MANAGER_SERVICE_URL}/api/manager/work-orders`;
    }

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axios.get(endpoint, { headers });
    const data = res?.data?.users || res?.data?.reports || res?.data?.workOrders || res?.data?.data || res?.data || [];
    rawTableData.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Gagal mengambil data tabel:', err);
    rawTableData.value = [];
  } finally {
    tableLoading.value = false;
  }
};

const handleRoleChange = () => {};

const getTechnicianName = (item) => {
  if (Array.isArray(item.technicians) && item.technicians.length > 0) {
    const tech = item.technicians[0];
    return typeof tech === 'object' ? tech.name || tech.email : tech;
  }
  if (item.technician && typeof item.technician === 'object') {
    return item.technician.name || item.technician.email;
  }
  return item.technicianName || item.assignedTechnician?.name || item.technician || '-';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const handleLogout = () => {
  if (typeof logout === 'function') {
    logout();
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

onMounted(() => {
  initTheme();
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  fetchStats();
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
  --primary-hover: #1d4ed8;
  --theme-toggle-bg: #f1f5f9;
  --table-hover: #f1f5f9;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --theme-toggle-bg: #334155;
  --table-hover: #334155;
}

.dashboard-page {
  min-height: 100vh;
  padding: 24px;
  background-color: var(--bg-main);
  color: var(--text-main);
  box-sizing: border-box;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-title h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-theme-toggle {
  background-color: var(--theme-toggle-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.stat-card h3 {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 8px;
  margin-bottom: 0;
}

.health-ok {
  color: #16a34a;
}

.quick-actions {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  margin-bottom: 24px;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.actions-header h3 {
  margin: 0;
  font-size: 16px;
}

.dropdown-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.dropdown-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.table-select {
  padding: 8px 12px;
  background-color: var(--bg-main);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.btn-action.outline {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.table-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.role-tag {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 600;
}

.role-badge {
  background: var(--theme-toggle-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.table-loading-tag {
  font-size: 12px;
  color: var(--primary-color);
}

.table-responsive {
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
  padding: 12px;
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

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-badge.completed, .status-badge.active, .status-badge.good { background: #dcfce7; color: #15803d; }
.status-badge.pending, .status-badge.in_progress, .status-badge.assigned { background: #fef3c7; color: #b45309; }

.priority-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.priority-badge.high, .priority-badge.urgent { background: #fee2e2; color: #991b1b; }
.priority-badge.normal, .priority-badge.medium { background: #e0e7ff; color: #3730a3; }
.priority-badge.low { background: #f1f5f9; color: #475569; }

.btn-logout {
  padding: 8px 16px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.loading-state, .error-state, .empty-table {
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.btn-retry {
  margin-top: 12px;
  padding: 6px 12px;
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
