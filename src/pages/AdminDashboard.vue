<template>
  <div class="dashboard-page">
    <!-- Header Area -->
    <header class="header-container">
      <div class="header-title">
        <h1 class="brand-title">
          <span class="brand-sub">エサの ー</span> Admin System Dashboard
        </h1>
        <p class="subtitle">{{ t('welcome') }}, Administrator ({{ user?.email || '-' }})</p>
      </div>

      <div class="header-actions">
        <!-- Language Switcher (Pilihan Bahasa ID / EN) -->
        <div class="lang-switch-wrapper">
          <button 
            @click="toggleLanguage" 
            class="lang-toggle-switch"
            :class="{ 'is-en': currentLang === 'en' }"
            :title="currentLang === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'"
            aria-label="Toggle Language"
          >
            <span class="lang-option" :class="{ active: currentLang === 'id' }">ID</span>
            <span class="lang-option" :class="{ active: currentLang === 'en' }">EN</span>
            <span class="lang-slider"></span>
          </button>
        </div>

        <!-- Fluid Theme Switch (Desain Kapsul Animasi) -->
        <div class="theme-switch-wrapper">
          <button 
            @click="toggleTheme" 
            class="theme-toggle-switch" 
            :class="{ 'is-dark': currentTheme === 'dark' }"
            :title="currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'"
            aria-label="Toggle Theme"
          >
            <span class="switch-handle">
              <!-- Icon Matahari (Light Mode) -->
              <svg v-if="currentTheme === 'light'" class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              
              <!-- Icon Bulan (Dark Mode) -->
              <svg v-else class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
        </div>

        <!-- Logout Button -->
        <button @click="openLogoutModal" class="btn-logout">{{ t('logout') }}</button>
      </div>
    </header>

    <!-- CHUNK LOADING INITIALIZER FOR STATS -->
    <div v-if="loading" class="stats-grid">
      <div v-for="n in 3" :key="'stat-skeleton-' + n" class="stat-card skeleton-card">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-number"></div>
      </div>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchStats" class="btn-retry">{{ t('retry') }}</button>
    </div>

    <!-- DASHBOARD CONTENT -->
    <main v-else class="main-dashboard-content">
      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ t('totalReports') }}</h3>
          <p class="stat-number">{{ stats.totalReports || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ t('activeTechnicians') }}</h3>
          <p class="stat-number">{{ stats.activeTechnicians || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ t('systemHealth') }}</h3>
          <p class="stat-number health-ok">{{ stats.systemHealth || 'GOOD' }}</p>
        </div>
      </div>

      <!-- Quick Actions & Dropdown Controls -->
      <div class="quick-actions">
        <div class="actions-header">
          <h3>{{ t('filterTitle') }}</h3>
          
          <div class="dropdown-group">
            <!-- Dropdown 1: Tipe Data/Tabel -->
            <div class="dropdown-container">
              <label class="dropdown-label">{{ t('selectTable') }}:</label>
              <select v-model="selectedTable" @change="handleTableChange" class="table-select">
                <option value="none">-- {{ t('hideTable') }} --</option>
                <option value="users">{{ t('tableUsers') }}</option>
                <option value="reports">{{ t('tableReports') }}</option>
                <option value="workOrders">{{ t('tableWorkOrders') }}</option>
              </select>
            </div>

            <!-- Dropdown Filter Per Role (Khusus Tabel Users) -->
            <div v-if="selectedTable === 'users'" class="dropdown-container">
              <label class="dropdown-label">{{ t('displayRole') }}:</label>
              <select v-model="selectedRole" class="table-select role-select">
                <option value="ALL">{{ t('allRoles') }}</option>
                <option value="USER">User ({{ t('reporter') }})</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </div>

            <!-- Dropdown Filter Status Laporan (Khusus Tabel Reports) -->
            <div v-if="selectedTable === 'reports'" class="dropdown-container">
              <label class="dropdown-label">{{ t('reportStatus') }}:</label>
              <select v-model="selectedReportStatus" class="table-select">
                <option value="ALL">{{ t('allStatus') }}</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved / {{ t('completed') }}</option>
                <option value="REJECTED">{{ t('rejected') }}</option>
              </select>
            </div>

            <!-- Dropdown Filter Kategori Laporan (Khusus Tabel Reports) -->
            <div v-if="selectedTable === 'reports'" class="dropdown-container">
              <label class="dropdown-label">{{ t('category') }}:</label>
              <select v-model="selectedReportCategory" class="table-select">
                <option value="ALL">{{ t('allCategories') }}</option>
                <option value="Listrik">{{ t('catElectrical') }}</option>
                <option value="Jaringan">{{ t('catNetwork') }}</option>
                <option value="Gedung">{{ t('catBuilding') }}</option>
                <option value="Lainnya">{{ t('catOthers') }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <router-link to="/users" class="btn-action">{{ t('manageUsers') }}</router-link>
          <router-link to="/reports" class="btn-action outline">{{ t('viewReports') }}</router-link>
        </div>
      </div>

      <!-- Dynamic Data Table Section -->
      <div v-if="selectedTable !== 'none'" class="table-section">
        <div class="table-header">
          <h4>
            {{ tableTitle }}
            <span v-if="selectedTable === 'users'" class="role-tag">({{ selectedRole }})</span>
            <span v-if="selectedTable === 'reports'" class="role-tag">({{ selectedReportStatus }})</span>
          </h4>
          <span v-if="tableLoading" class="table-loading-tag">{{ t('loadingData') }}</span>
        </div>

        <!-- CHUNK LOADING SKELETON FOR TABLE -->
        <div v-if="tableLoading" class="table-skeleton-container">
          <div v-for="row in 4" :key="'row-skel-' + row" class="table-skeleton-row">
            <div v-for="col in 5" :key="'col-skel-' + col" class="skeleton-line skeleton-cell"></div>
          </div>
        </div>
        
        <div v-else-if="filteredTableData.length === 0" class="empty-table">
          {{ t('noData') }}
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
                      {{ formatRoleDisplay(item.role) }}
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
    </main>

    <!-- LOGOUT POPUP CONFIRMATION MODAL WITH COUNTDOWN -->
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="cancelLogout">
      <div class="modal-card">
        <div class="modal-icon warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="modal-title">{{ t('logoutConfirmTitle') }}</h3>
        <p class="modal-text">{{ t('logoutConfirmMsg') }}</p>

        <div class="modal-actions">
          <button @click="cancelLogout" class="btn-modal-cancel">{{ t('cancel') }}</button>
          
          <button 
            @click="confirmLogout" 
            class="btn-modal-confirm" 
            :disabled="logoutCountdown > 0"
          >
            <span v-if="logoutCountdown > 0">{{ t('wait') }} ({{ logoutCountdown }}s)</span>
            <span v-else>{{ t('yesLogout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { adminApi, logout } from '../services/api';

const stats = ref({ totalReports: 0, activeTechnicians: 0, systemHealth: 'GOOD' });
const user = ref(null);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');
const currentLang = ref('id'); // Default Bahasa Indonesia

const selectedTable = ref('none');
const selectedRole = ref('ALL');
const selectedReportStatus = ref('ALL');
const selectedReportCategory = ref('ALL');

const rawTableData = ref([]);
const tableLoading = ref(false);

// MODAL LOGOUT STATES
const showLogoutModal = ref(false);
const logoutCountdown = ref(2);
let countdownTimer = null;

const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL || 'https://infrastructure-report-microservice-admin-service.vercel.app';
const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

// KAMUS TRANSLASI / I18N
const translations = {
  id: {
    welcome: 'Selamat datang kembali',
    logout: 'Logout',
    retry: 'Coba Lagi',
    totalReports: 'Total Laporan System',
    activeTechnicians: 'Total Teknisi Aktif',
    systemHealth: 'Status System Health',
    filterTitle: 'Filter Data Dashboard',
    selectTable: 'Pilih Tabel',
    hideTable: 'Sembunyikan Tabel',
    tableUsers: 'Tabel Pengguna (By Role)',
    tableReports: 'Tabel Laporan Kerusakan',
    tableWorkOrders: 'Tabel Work Orders (Manager)',
    displayRole: 'Display Per Role',
    allRoles: 'Semua Role',
    reporter: 'Pelapor',
    reportStatus: 'Status Laporan',
    allStatus: 'Semua Status',
    completed: 'Selesai',
    rejected: 'Ditolak',
    category: 'Kategori',
    allCategories: 'Semua Kategori',
    catElectrical: 'Listrik',
    catNetwork: 'Jaringan / Internet',
    catBuilding: 'Gedung & Fasilitas',
    catOthers: 'Lainnya',
    manageUsers: 'Kelola Pengguna & Roles',
    viewReports: 'Lihat Semua Laporan',
    loadingData: 'Memuat data...',
    noData: 'Tidak ada data untuk kriteria ini.',
    logoutConfirmTitle: 'Konfirmasi Logout',
    logoutConfirmMsg: 'Apakah Anda yakin ingin keluar dari sistem dashboard administrator?',
    cancel: 'Batal',
    wait: 'Tunggu',
    yesLogout: 'Ya, Logout',
    // Table Headers
    colTitle: 'Judul Laporan',
    colCategory: 'Kategori',
    colLocation: 'Lokasi',
    colStatus: 'Status',
    colDate: 'Tanggal',
    colName: 'Nama',
    colEmail: 'Email',
    colRole: 'Role',
    colPhone: 'No. Telepon',
    colWoNo: 'No. WO',
    colJobTitle: 'Judul Pekerjaan',
    colTechnicians: 'Teknisi',
    colPriority: 'Prioritas'
  },
  en: {
    welcome: 'Welcome back',
    logout: 'Logout',
    retry: 'Try Again',
    totalReports: 'Total System Reports',
    activeTechnicians: 'Active Technicians',
    systemHealth: 'System Health Status',
    filterTitle: 'Dashboard Data Filter',
    selectTable: 'Select Table',
    hideTable: 'Hide Table',
    tableUsers: 'Users Table (By Role)',
    tableReports: 'Damage Reports Table',
    tableWorkOrders: 'Work Orders Table (Manager)',
    displayRole: 'Display By Role',
    allRoles: 'All Roles',
    reporter: 'Reporter',
    reportStatus: 'Report Status',
    allStatus: 'All Statuses',
    completed: 'Resolved',
    rejected: 'Rejected',
    category: 'Category',
    allCategories: 'All Categories',
    catElectrical: 'Electrical',
    catNetwork: 'Network / Internet',
    catBuilding: 'Building & Facilities',
    catOthers: 'Others',
    manageUsers: 'Manage Users & Roles',
    viewReports: 'View All Reports',
    loadingData: 'Loading data...',
    noData: 'No data available for this criteria.',
    logoutConfirmTitle: 'Confirm Logout',
    logoutConfirmMsg: 'Are you sure you want to log out of the admin dashboard system?',
    cancel: 'Cancel',
    wait: 'Wait',
    yesLogout: 'Yes, Logout',
    // Table Headers
    colTitle: 'Report Title',
    colCategory: 'Category',
    colLocation: 'Location',
    colStatus: 'Status',
    colDate: 'Date',
    colName: 'Name',
    colEmail: 'Email',
    colRole: 'Role',
    colPhone: 'Phone Number',
    colWoNo: 'WO No.',
    colJobTitle: 'Job Title',
    colTechnicians: 'Technician',
    colPriority: 'Priority'
  }
};

const t = (key) => {
  return translations[currentLang.value]?.[key] || key;
};

// LANGUAGE TOGGLE FUNCTION
const initLanguage = () => {
  const savedLang = localStorage.getItem('user-lang') || 'id';
  currentLang.value = savedLang;
};

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'id' ? 'en' : 'id';
  localStorage.setItem('user-lang', currentLang.value);
};

// THEME TOGGLE LOGIC
const applyThemeToDOM = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  currentTheme.value = savedTheme;
  applyThemeToDOM(savedTheme);
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  localStorage.setItem('user-theme', newTheme);
  applyThemeToDOM(newTheme);
};

// MODAL LOGOUT LOGIC WITH COUNTDOWN
const openLogoutModal = () => {
  showLogoutModal.value = true;
  logoutCountdown.value = 2;
  
  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    if (logoutCountdown.value > 0) {
      logoutCountdown.value -= 1;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

const cancelLogout = () => {
  showLogoutModal.value = false;
  if (countdownTimer) clearInterval(countdownTimer);
  logoutCountdown.value = 2;
};

const confirmLogout = () => {
  if (logoutCountdown.value > 0) return;
  if (countdownTimer) clearInterval(countdownTimer);

  if (typeof logout === 'function') {
    logout();
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

const tableTitle = computed(() => {
  switch (selectedTable.value) {
    case 'reports': return t('tableReports');
    case 'users': return t('tableUsers');
    case 'workOrders': return t('tableWorkOrders');
    default: return '';
  }
});

const tableColumns = computed(() => {
  switch (selectedTable.value) {
    case 'reports':
      return [
        { key: 'title', label: t('colTitle') },
        { key: 'category', label: t('colCategory') },
        { key: 'location', label: t('colLocation') },
        { key: 'status', label: t('colStatus') },
        { key: 'createdAt', label: t('colDate') }
      ];
    case 'users':
      return [
        { key: 'name', label: t('colName') },
        { key: 'email', label: t('colEmail') },
        { key: 'role', label: t('colRole') },
        { key: 'contact', label: t('colPhone') },
        { key: 'status', label: t('colStatus') }
      ];
    case 'workOrders':
      return [
        { key: 'workOrderNumber', label: t('colWoNo') },
        { key: 'title', label: t('colJobTitle') },
        { key: 'technicians', label: t('colTechnicians') },
        { key: 'priority', label: t('colPriority') },
        { key: 'status', label: t('colStatus') }
      ];
    default:
      return [];
  }
});

// LOGIKA FILTERING DATA UNTUK USERS DAN REPORTS
const filteredTableData = computed(() => {
  let list = [...rawTableData.value];

  if (selectedTable.value === 'users' && selectedRole.value !== 'ALL') {
    const targetRole = selectedRole.value.toString().trim().toUpperCase();
    list = list.filter(item => {
      const rawRole = item.role || item.roleName || '';
      const itemRole = rawRole.toString().trim().toUpperCase();

      if (targetRole === 'MANAGER') {
        return (
          itemRole === 'MANAGER' ||
          itemRole === 'INFRASTRUCTURE_MANAGER' ||
          itemRole.includes('MANAGER')
        );
      }
      return itemRole === targetRole;
    });
  }

  if (selectedTable.value === 'reports') {
    if (selectedReportStatus.value !== 'ALL') {
      const targetStatus = selectedReportStatus.value.toUpperCase();
      list = list.filter(item => {
        const itemStatus = (item.status || 'PENDING').toString().trim().toUpperCase();
        return itemStatus === targetStatus;
      });
    }

    if (selectedReportCategory.value !== 'ALL') {
      const targetCat = selectedReportCategory.value.toLowerCase();
      list = list.filter(item => {
        const itemCat = (item.category || '').toString().trim().toLowerCase();
        return itemCat.includes(targetCat);
      });
    }
  }

  return list;
});

const formatRoleDisplay = (role) => {
  if (!role) return 'USER';
  const r = role.toString().trim().toUpperCase();
  if (r.includes('MANAGER')) {
    return 'MANAGER';
  }
  return r;
};

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
    const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

onMounted(() => {
  initTheme();
  initLanguage();
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

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
:global(:root),
:global(html),
:global(body),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --table-hover: #f1f5f9;
  --skeleton-bg: #e2e8f0;
  --modal-bg: #ffffff;
  --modal-overlay: rgba(15, 23, 42, 0.6);
  --lang-btn-bg: #e2e8f0;
  --lang-btn-active: #ffffff;
  --lang-text-active: #2563eb;
}

:global([data-theme="dark"]),
:global(body[data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --table-hover: #334155;
  --skeleton-bg: #334155;
  --modal-bg: #1e293b;
  --modal-overlay: rgba(2, 6, 23, 0.8);
  --lang-btn-bg: #334155;
  --lang-btn-active: #1e293b;
  --lang-text-active: #3b82f6;
}

:global(html),
:global(body),
:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-height: 100vh !important;
  background-color: var(--bg-main) !important;
  overflow-x: hidden !important;
}

.dashboard-page {
  min-height: 100vh;
  width: 100%;
  padding: 24px;
  background-color: var(--bg-main);
  color: var(--text-main);
  box-sizing: border-box;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.brand-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
}

.brand-sub {
  color: var(--primary-color);
}

.subtitle {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* STYLES UNTUK LANGUAGE SWITCHER (ID / EN) */
.lang-switch-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.lang-toggle-switch {
  position: relative;
  width: 68px;
  height: 32px;
  background-color: var(--lang-btn-bg);
  border-radius: 50px;
  border: 1px solid var(--border-color);
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease;
}

.lang-option {
  position: relative;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  width: 28px;
  text-align: center;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.lang-option.active {
  color: var(--lang-text-active);
}

.lang-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 28px;
  height: 24px;
  background-color: var(--lang-btn-active);
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

.lang-toggle-switch.is-en .lang-slider {
  transform: translateX(32px);
}

/* FLUID THEME SWITCH STYLES */
.theme-switch-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.theme-toggle-switch {
  position: relative;
  width: 60px;
  height: 32px;
  background-color: var(--switch-bg);
  border-radius: 50px;
  border: none;
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.4s ease;
}

.switch-handle {
  width: 26px;
  height: 26px;
  background-color: var(--switch-handle-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.4s ease;
  transform: translateX(0);
}

.theme-toggle-switch.is-dark .switch-handle {
  transform: translateX(28px);
}

.switch-icon {
  width: 15px;
  height: 15px;
  color: var(--switch-icon-color);
  transition: color 0.3s ease;
}

.btn-logout {
  padding: 8px 16px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-logout:hover {
  background-color: #dc2626;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.stat-card h3 {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.stat-number {
  font-size: 30px;
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
  border-radius: 12px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  margin-bottom: 24px;
  transition: background-color 0.4s ease, border-color 0.4s ease;
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
  gap: 12px;
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
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-action:hover {
  background-color: var(--primary-hover);
}

.btn-action.outline {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-action.outline:hover {
  background-color: var(--primary-color);
  color: #ffffff;
}

.table-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: background-color 0.4s ease, border-color 0.4s ease;
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
  background: var(--border-color);
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

.status-badge.completed, .status-badge.active, .status-badge.good, .status-badge.resolved { background: #dcfce7; color: #15803d; }
.status-badge.pending, .status-badge.in_progress, .status-badge.assigned { background: #fef3c7; color: #b45309; }
.status-badge.rejected { background: #fee2e2; color: #b91c1c; }

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

.error-state, .empty-table {
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
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

/* CHUNK/SKELETON ANIMATIONS */
.skeleton-card {
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-title {
  height: 16px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-number {
  height: 32px;
  width: 40%;
}

.table-skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.table-skeleton-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-cell {
  height: 24px;
  width: 100%;
}

/* LOGOUT MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--modal-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background-color: var(--modal-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.modal-icon.warning {
  background-color: #fef3c7;
  color: #d97706;
}

.modal-icon svg {
  width: 28px;
  height: 28px;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
}

.modal-text {
  font-size: 13px;
  color: var(--text-muted);
  margin: 8px 0 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-modal-cancel {
  flex: 1;
  padding: 10px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-modal-cancel:hover {
  background-color: var(--border-color);
}

.btn-modal-confirm {
  flex: 1;
  padding: 10px;
  background-color: #ef4444;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-confirm:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-modal-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f87171;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 16px;
  }

  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .dropdown-group {
    flex-direction: column;
    width: 100%;
  }

  .dropdown-container {
    justify-content: space-between;
  }
}
</style>
