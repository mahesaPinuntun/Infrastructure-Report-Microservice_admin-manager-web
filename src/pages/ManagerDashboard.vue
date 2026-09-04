<template>
  <div class="dashboard-wrapper">
    <!-- Header Section -->
    <header class="header-container">
      <div class="header-title">
        <div class="brand-badge">
          <!-- Logo Kanji 築 (Chiku) Small Badge -->
          <div class="kanji-logo-badge">
            <span class="kanji-badge-text">築</span>
          </div>
          <span>Manager Field System</span>
        </div>
        <h1>{{ t('dashboardTitle') }}</h1>
        <p class="subtitle">{{ t('welcome') }}, <strong>{{ user?.name || user?.email || 'Manager' }}</strong></p>
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
            :class="{ 'is-dark': activeTheme === 'dark' }"
            :title="activeTheme === 'light' ? 'Dark Mode' : 'Light Mode'"
            aria-label="Toggle Theme"
          >
            <span class="switch-handle">
              <!-- Icon Matahari (Light Mode) -->
              <svg v-if="activeTheme === 'light'" class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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

        <!-- Tombol Logout (Memicu Modal Konfirmasi) -->
        <button @click="triggerLogout" class="btn-logout">
          <svg class="icon-sm icon-logout" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          <span>{{ t('logout') }}</span>
        </button>
      </div>
    </header>

    <!-- Modal Konfirmasi Logout -->
    <Transition name="fade">
      <div v-if="showLogoutModal" class="modal-backdrop" @click.self="showLogoutModal = false">
        <div class="modal-card">
          <div class="modal-icon-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 class="modal-title">{{ t('logoutConfirmTitle') }}</h3>
          <p class="modal-message">{{ t('logoutConfirmMessage') }}</p>
          <div class="modal-actions">
            <button @click="showLogoutModal = false" class="btn-cancel">{{ t('cancel') }}</button>
            <button @click="confirmLogout" class="btn-confirm-logout">{{ t('yesLogout') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Loading State -->
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="state-card loading-state">
        <div class="spinner"></div>
        <p>{{ t('loadingStats') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="state-card error-state">
        <svg class="icon-lg text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ errorMessage }}</p>
        <button @click="fetchStats" class="btn-retry">{{ t('retry') }}</button>
      </div>

      <!-- Bento Grid Content -->
      <div v-else class="dashboard-content">
        <div class="bento-grid">
          <!-- Stat Card 1: Work Orders Active -->
          <div class="bento-item stat-card primary">
            <div class="card-header">
              <div class="icon-box bg-blue">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <span class="card-tag">{{ t('active') }}</span>
            </div>
            <div class="card-body">
              <span class="stat-number">{{ stats.activeWorkOrders }}</span>
              <span class="stat-label">{{ t('statWorkOrders') }}</span>
            </div>
          </div>

          <!-- Stat Card 2: Laporan Perlu Approval -->
          <div class="bento-item stat-card warning">
            <div class="card-header">
              <div class="icon-box bg-amber">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span class="card-tag warning">{{ t('needsReview') }}</span>
            </div>
            <div class="card-body">
              <span class="stat-number text-amber">{{ stats.pendingApprovals }}</span>
              <span class="stat-label">{{ t('statPendingApprovals') }}</span>
            </div>
          </div>

          <!-- Stat Card 3: Teknisi Ready -->
          <div class="bento-item stat-card success">
            <div class="card-header">
              <div class="icon-box bg-emerald">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="card-tag success">{{ t('ready') }}</span>
            </div>
            <div class="card-body">
              <span class="stat-number text-emerald">{{ stats.availableTechnicians }}</span>
              <span class="stat-label">{{ t('statTechAvailable') }}</span>
            </div>
          </div>

          <!-- Bento Action Card 1: Toggle Preview Work Orders -->
          <div @click="toggleWorkOrdersTable" :class="['bento-item', 'action-card', 'group-blue', { 'active-card': showWorkOrdersTable }]">
            <div class="action-icon-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">
                <h3>{{ t('manageWorkOrders') }}</h3>
                <svg :class="['arrow-icon', { 'rotate-down': showWorkOrdersTable }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <p>{{ showWorkOrdersTable ? t('clickToHide') : t('clickToShowWo') }}</p>
            </div>
          </div>

          <!-- Bento Action Card 2: Toggle Preview Review Laporan -->
          <div @click="toggleReportsTable" :class="['bento-item', 'action-card', 'group-indigo', { 'active-card': showReportsTable }]">
            <div class="action-icon-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">
                <h3>{{ t('reviewReports') }}</h3>
                <svg :class="['arrow-icon', { 'rotate-down': showReportsTable }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <p>{{ showReportsTable ? t('clickToHide') : t('clickToShowReports') }}</p>
            </div>
          </div>

          <!-- Bento Action Small Card: Refresh Data -->
          <button @click="refreshAllData" class="bento-item quick-refresh-card">
            <svg class="icon icon-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>{{ t('refreshData') }}</span>
          </button>
        </div>

        <!-- Section Work Orders Preview Table -->
        <Transition name="expand">
          <div v-if="showWorkOrdersTable" class="table-preview-section">
            <div class="table-header">
              <div class="table-title">
                <h3>{{ t('latestWorkOrders') }}</h3>
                <span class="count-badge">{{ workOrders.length }} Items</span>
              </div>
              
              <button @click="navigateTo('/work-orders')" class="btn-reroute">
                <span>{{ t('openFullPage') }} (/work-orders)</span>
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>

            <div v-if="loadingOrders" class="table-loading">
              <div class="spinner-sm"></div>
              <span>{{ t('loadingWo') }}</span>
            </div>

            <div v-else class="table-responsive">
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>{{ t('colWoCode') }}</th>
                    <th>{{ t('colJobTitle') }}</th>
                    <th>{{ t('colRelatedReport') }}</th>
                    <th>{{ t('colStatus') }}</th>
                    <th>{{ t('colDate') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="workOrders.length === 0">
                    <td colspan="5" class="empty-cell">{{ t('noWoData') }}</td>
                  </tr>
                  <tr v-for="item in workOrders.slice(0, 5)" :key="item._id || item.id">
                    <td class="code-cell">{{ item.code || item.woCode || item._id?.substring(0, 8) }}</td>
                    <td class="title-cell">{{ item.title || item.companyName || 'Infrastructure Report' }}</td>
                    <td>
                      <span v-if="item.reportId" class="badge-report">{{ item.reportId }}</span>
                      <span v-else class="text-muted">{{ t('standalone') }}</span>
                    </td>
                    <td>
                      <span :class="['badge-status', (item.status || 'ASSIGNED').toLowerCase()]">
                        {{ item.status || 'ASSIGNED' }}
                      </span>
                    </td>
                    <td>{{ formatDate(item.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>

        <!-- Section Laporan Masuk Preview Table -->
        <Transition name="expand">
          <div v-if="showReportsTable" class="table-preview-section">
            <div class="table-header">
              <div class="table-title">
                <h3>{{ t('latestReports') }}</h3>
                <span class="count-badge warning">{{ reports.length }} Items</span>
              </div>
              
              <button @click="navigateTo('/reports')" class="btn-reroute btn-reroute-amber">
                <span>{{ t('openFullPage') }} (/reports)</span>
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>

            <div v-if="loadingReports" class="table-loading">
              <div class="spinner-sm"></div>
              <span>{{ t('loadingReportsMsg') }}</span>
            </div>

            <div v-else class="table-responsive">
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>{{ t('colReportId') }}</th>
                    <th>{{ t('colDamageDesc') }}</th>
                    <th>{{ t('colLocation') }}</th>
                    <th>{{ t('colReviewStatus') }}</th>
                    <th>{{ t('colReportDate') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="reports.length === 0">
                    <td colspan="5" class="empty-cell">{{ t('noReportData') }}</td>
                  </tr>
                  <tr v-for="item in reports.slice(0, 5)" :key="item._id || item.id">
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
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { managerApi, logout } from '../services/api';

const router = useRouter();
const stats = ref({ activeWorkOrders: 0, pendingApprovals: 0, availableTechnicians: 0 });
const workOrders = ref([]);
const reports = ref([]);
const user = ref(null);

const loading = ref(true);
const loadingOrders = ref(false);
const loadingReports = ref(false);
const errorMessage = ref('');

const showWorkOrdersTable = ref(false);
const showReportsTable = ref(false);

// Control State Modal Logout
const showLogoutModal = ref(false);

const activeTheme = ref('light');
const currentLang = ref('id');

// KAMUS TRANSLASI (i18n)
const translations = {
  id: {
    dashboardTitle: 'Dashboard Manager',
    welcome: 'Selamat datang kembali',
    logout: 'Keluar',
    logoutConfirmTitle: 'Konfirmasi Keluar',
    logoutConfirmMessage: 'Apakah Anda yakin ingin keluar dari sistem Manager Field?',
    cancel: 'Batal',
    yesLogout: 'Ya, Keluar',
    loadingStats: 'Memuat data statistik operasional...',
    retry: 'Coba Memuat Ulang',
    active: 'Aktif',
    needsReview: 'Perlu Review',
    ready: 'Siap Tugas',
    statWorkOrders: 'Work Orders Berjalan',
    statPendingApprovals: 'Laporan Menunggu Approval',
    statTechAvailable: 'Teknisi Field Tersedia',
    manageWorkOrders: 'Kelola Work Orders',
    clickToHide: 'Klik untuk menyembunyikan tabel preview.',
    clickToShowWo: 'Tampilkan preview ringkas tabel Work Orders di bawah.',
    reviewReports: 'Review Laporan Masuk',
    clickToShowReports: 'Tampilkan preview ringkas Laporan Kerusakan di bawah.',
    refreshData: 'Refresh Data',
    latestWorkOrders: 'Daftar Work Orders Terbaru',
    latestReports: 'Daftar Laporan Masuk Terbaru',
    openFullPage: 'Buka Halaman Penuh',
    loadingWo: 'Memuat daftar Surat Tugas...',
    loadingReportsMsg: 'Memuat daftar Laporan Masuk...',
    standalone: 'Mandiri',
    noWoData: 'Belum ada Work Order aktif di sistem.',
    noReportData: 'Belum ada Laporan Masuk yang memerlukan review.',
    colWoCode: 'WO Code',
    colJobTitle: 'Judul Tugas',
    colRelatedReport: 'Laporan Terkait',
    colStatus: 'Status',
    colDate: 'Tanggal',
    colReportId: 'ID Laporan',
    colDamageDesc: 'Deskripsi Kerusakan',
    colLocation: 'Lokasi Perbaikan',
    colReviewStatus: 'Status Review',
    colReportDate: 'Tanggal Lapor'
  },
  en: {
    dashboardTitle: 'Manager Dashboard',
    welcome: 'Welcome back',
    logout: 'Logout',
    logoutConfirmTitle: 'Confirm Logout',
    logoutConfirmMessage: 'Are you sure you want to log out of the Manager Field system?',
    cancel: 'Cancel',
    yesLogout: 'Yes, Logout',
    loadingStats: 'Loading operational statistics...',
    retry: 'Retry Loading',
    active: 'Active',
    needsReview: 'Needs Review',
    ready: 'Ready',
    statWorkOrders: 'Active Work Orders',
    statPendingApprovals: 'Pending Report Approvals',
    statTechAvailable: 'Available Field Technicians',
    manageWorkOrders: 'Manage Work Orders',
    clickToHide: 'Click to hide preview table.',
    clickToShowWo: 'Show quick preview of Work Orders table below.',
    reviewReports: 'Review Incoming Reports',
    clickToShowReports: 'Show quick preview of Damage Reports below.',
    refreshData: 'Refresh Data',
    latestWorkOrders: 'Latest Work Orders',
    latestReports: 'Latest Incoming Reports',
    openFullPage: 'Open Full Page',
    loadingWo: 'Loading Work Orders list...',
    loadingReportsMsg: 'Loading Incoming Reports list...',
    standalone: 'Standalone',
    noWoData: 'No active Work Orders in the system.',
    noReportData: 'No incoming reports pending review.',
    colWoCode: 'WO Code',
    colJobTitle: 'Job Title',
    colRelatedReport: 'Related Report',
    colStatus: 'Status',
    colDate: 'Date',
    colReportId: 'Report ID',
    colDamageDesc: 'Damage Description',
    colLocation: 'Repair Location',
    colReviewStatus: 'Review Status',
    colReportDate: 'Report Date'
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
const applyTheme = (theme) => {
  activeTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const toggleTheme = () => {
  const nextTheme = activeTheme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('user-theme', nextTheme);
  applyTheme(nextTheme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  applyTheme(savedTheme);
};

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await managerApi.get('/api/manager/stats');
    const rawData = res.data?.stats || res.data?.data || res.data || {};

    stats.value = {
      activeWorkOrders: rawData.activeWorkOrders ?? rawData.activeOrders ?? rawData.totalWorkOrders ?? 0,
      pendingApprovals: rawData.pendingApprovals ?? rawData.pendingReports ?? rawData.totalPendingReports ?? 0,
      availableTechnicians: rawData.availableTechnicians ?? rawData.techniciansCount ?? 0
    };
  } catch (err) {
    console.error('Gagal memuat statistik manager:', err);
    errorMessage.value = 'Gagal terhubung dengan server statistik Manager.';
  } finally {
    loading.value = false;
  }
};

const fetchWorkOrders = async () => {
  loadingOrders.value = true;
  try {
    const res = await managerApi.get('/api/manager/work-orders');
    const rawData = res.data?.data || res.data?.workOrders || res.data;
    workOrders.value = Array.isArray(rawData) ? rawData : [];
  } catch (err) {
    console.error('Gagal memuat daftar Work Orders:', err);
  } finally {
    loadingOrders.value = false;
  }
};

const fetchReports = async () => {
  loadingReports.value = true;
  try {
    const res = await managerApi.get('/api/manager/reports');
    const rawData = res.data?.data || res.data?.reports || res.data;
    reports.value = Array.isArray(rawData) ? rawData : [];
  } catch (err) {
    console.error('Gagal memuat daftar Laporan:', err);
  } finally {
    loadingReports.value = false;
  }
};

const toggleWorkOrdersTable = () => {
  showWorkOrdersTable.value = !showWorkOrdersTable.value;
  if (showWorkOrdersTable.value && workOrders.value.length === 0) {
    fetchWorkOrders();
  }
};

const toggleReportsTable = () => {
  showReportsTable.value = !showReportsTable.value;
  if (showReportsTable.value && reports.value.length === 0) {
    fetchReports();
  }
};

const refreshAllData = () => {
  fetchStats();
  if (showWorkOrdersTable.value) fetchWorkOrders();
  if (showReportsTable.value) fetchReports();
};

const navigateTo = (path) => {
  router.push(path);
};

// HANDLER KONFIRMASI LOGOUT
const triggerLogout = () => {
  showLogoutModal.value = true;
};

const confirmLogout = () => {
  showLogoutModal.value = false;
  logout();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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
</script>

<style scoped>
/* Palette CSS Variables */
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
  --amber-color: #d97706;
  --amber-hover: #b45309;
  --emerald-color: #059669;
  --danger-color: #ef4444;
  --icon-bg-blue: #eff6ff;
  --icon-bg-amber: #fffbeb;
  --icon-bg-emerald: #ecfdf5;
  --icon-muted: #64748b;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --lang-btn-bg: #e2e8f0;
  --lang-btn-active: #ffffff;
  --lang-text-active: #2563eb;
  --modal-overlay: rgba(15, 23, 42, 0.5);
  --modal-bg: #ffffff;
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
  --amber-color: #f59e0b;
  --amber-hover: #d97706;
  --emerald-color: #10b981;
  --danger-color: #f87171;
  --icon-bg-blue: #1e3a8a;
  --icon-bg-amber: #78350f;
  --icon-bg-emerald: #064e3b;
  --icon-muted: #94a3b8;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --lang-btn-bg: #334155;
  --lang-btn-active: #1e293b;
  --lang-text-active: #3b82f6;
  --modal-overlay: rgba(2, 6, 23, 0.7);
  --modal-bg: #1e293b;
}

/* Global Container Resets */
:global(html),
:global(body),
:global(#app) {
  background-color: var(--bg-main) !important;
  color: var(--text-main) !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
}

.dashboard-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* Header Section */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

/* STYLES LOGO KANJI BADGE */
.kanji-logo-badge {
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px -1px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.kanji-badge-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

h1 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px; 
  color: var(--text-main) !important; 
}

.subtitle { 
  color: var(--text-muted) !important; 
  font-size: 14px; 
  margin-top: 4px; 
}

.subtitle strong {
  color: var(--text-main) !important;
}

.header-actions { display: flex; align-items: center; gap: 12px; }

/* STYLES LANGUAGE SWITCHER (ID / EN) */
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #ef4444;
  color: #ffffff !important;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-logout:hover {
  background-color: #dc2626;
}

.icon-logout {
  color: #ffffff !important;
}

/* MODAL LOGOUT STYLES */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--modal-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background-color: var(--modal-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 28px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: scale(1);
  transition: transform 0.2s ease;
}

.modal-icon-warning {
  width: 52px;
  height: 52px;
  background-color: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.modal-icon-warning svg {
  width: 26px;
  height: 26px;
}

.modal-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.modal-message {
  margin: 0 0 24px 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 10px 16px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel:hover {
  background-color: var(--border-color);
}

.btn-confirm-logout {
  flex: 1;
  padding: 10px 16px;
  background-color: #ef4444;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-confirm-logout:hover {
  background-color: #dc2626;
}

/* Bento Grid Layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

.bento-item {
  background-color: var(--bg-card);
  color: var(--text-main) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, color 0.25s ease;
}

.bento-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.active-card {
  background-color: var(--icon-bg-blue);
}

/* Stat Cards */
.stat-card { display: flex; flex-direction: column; justify-content: space-between; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

.bg-blue { background-color: var(--icon-bg-blue); color: var(--primary-color); }
.bg-amber { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.bg-emerald { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }

.bg-blue .icon { color: var(--primary-color) !important; }
.bg-amber .icon { color: var(--amber-color) !important; }
.bg-emerald .icon { color: var(--emerald-color) !important; }

.card-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background-color: var(--icon-bg-blue); color: var(--primary-color); }
.card-tag.warning { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.card-tag.success { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }
.card-body { margin-top: 20px; }
.stat-number { display: block; font-size: 38px; font-weight: 800; line-height: 1; color: var(--text-main) !important; }
.text-amber { color: var(--amber-color) !important; }
.text-emerald { color: var(--emerald-color) !important; }
.stat-label { display: block; font-size: 13px; color: var(--text-muted) !important; margin-top: 6px; font-weight: 500; }

/* Action Large Bento Cards */
.action-card {
  grid-column: span 1;
  text-decoration: none;
  color: var(--text-main) !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.action-icon-bg {
  position: absolute;
  right: -10px;
  bottom: -10px;
  width: 110px;
  height: 110px;
  opacity: 0.1;
  color: var(--text-main) !important;
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon-bg { transform: scale(1.15) rotate(-5deg); opacity: 0.2; }
.action-title { display: flex; justify-content: space-between; align-items: center; }
.action-title h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main) !important; }
.arrow-icon { width: 20px; height: 20px; color: var(--primary-color) !important; transition: transform 0.25s ease; }
.arrow-icon.rotate-down { transform: rotate(90deg); }
.action-card:hover .arrow-icon:not(.rotate-down) { transform: translateX(4px); }
.action-content p { color: var(--text-muted) !important; font-size: 13px; margin-top: 6px; margin-bottom: 0; line-height: 1.4; }

/* Quick Refresh Button */
.quick-refresh-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted) !important;
  font-weight: 600;
  cursor: pointer;
  padding: 20px;
}

.icon-refresh {
  color: var(--icon-muted) !important;
  transition: color 0.2s ease, transform 0.3s ease;
}

.quick-refresh-card:hover { color: var(--primary-color) !important; }
.quick-refresh-card:hover .icon-refresh { color: var(--primary-color) !important; transform: rotate(180deg); }

/* Section Table Preview */
.table-preview-section {
  margin-top: 20px;
  background-color: var(--bg-card);
  color: var(--text-main) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.table-title { display: flex; align-items: center; gap: 10px; }
.table-title h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main) !important; }
.count-badge { font-size: 12px; font-weight: 700; background-color: var(--icon-bg-blue); color: var(--primary-color); padding: 2px 10px; border-radius: 12px; }
.count-badge.warning { background-color: var(--icon-bg-amber); color: var(--amber-color); }

.btn-reroute {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: #ffffff !important;
  border: none !important;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-reroute-amber {
  background-color: var(--amber-color);
}
.btn-reroute-amber:hover {
  background-color: var(--amber-hover);
}

.btn-reroute .icon-sm { color: #ffffff !important; }

.btn-reroute:hover:not(.btn-reroute-amber) { background-color: var(--primary-hover); }
.table-responsive { overflow-x: auto; }
.minimal-table { width: 100%; border-collapse: collapse; font-size: 13px; color: var(--text-main) !important; }
.minimal-table th, .minimal-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
.minimal-table th { font-weight: 600; color: var(--text-muted) !important; font-size: 11px; text-transform: uppercase; }
.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color) !important; }
.title-cell { font-weight: 600; color: var(--text-main) !important; }
.badge-report { font-family: monospace; font-size: 11px; background: var(--bg-main); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border-color); color: var(--text-main) !important; }
.text-muted { color: var(--text-muted) !important; font-size: 12px; font-style: italic; }
.empty-cell { text-align: center; color: var(--text-muted) !important; padding: 20px; }

.badge-status { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
.badge-status.assigned { background-color: var(--icon-bg-blue); color: var(--primary-color); }
.badge-status.pending { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.badge-status.in_progress { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.badge-status.completed { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }

/* Icons & Spinners */
.icon-sm { width: 16px; height: 16px; }
.icon { width: 20px; height: 20px; }
.icon-lg { width: 36px; height: 36px; }

.state-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 36px; text-align: center; color: var(--text-muted) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }
.spinner, .spinner-sm { border: 3px solid rgba(148, 163, 184, 0.2); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner { width: 28px; height: 28px; margin: 0 auto 14px; }
.spinner-sm { width: 18px; height: 18px; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 24px; color: var(--text-muted) !important; }
.btn-retry { margin-top: 14px; padding: 8px 18px; background-color: var(--primary-color); color: #ffffff !important; border: none !important; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.expand-enter-active, .expand-leave-active { transition: all 0.25s ease-in-out; max-height: 500px; opacity: 1; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

@media (max-width: 900px) {
  .dashboard-wrapper { padding: 16px; }
  .bento-grid { grid-template-columns: repeat(1, 1fr); }
  .table-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .header-container { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: space-between; }
}
</style>
