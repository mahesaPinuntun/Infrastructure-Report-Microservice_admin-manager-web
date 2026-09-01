<template>
  <div class="dashboard-wrapper">
    <!-- Header Section -->
    <header class="header-container">
      <div class="header-title">
        <div class="brand-badge">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>Manager Field System</span>
        </div>
        <h1>Dashboard Manager</h1>
        <p class="subtitle">Selamat datang kembali, <strong>{{ user?.name || user?.email || 'Manager' }}</strong></p>
      </div>

      <div class="header-actions">
        <!-- Button Switch Theme -->
        <button @click="toggleTheme" class="theme-toggle-btn" :title="`Mode saat ini: ${activeTheme}`">
          <svg v-if="activeTheme === 'dark'" class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span>{{ activeTheme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>

        <button @click="handleLogout" class="btn-logout">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="state-card loading-state">
        <div class="spinner"></div>
        <p>Memuat data statistik operasional...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="state-card error-state">
        <svg class="icon-lg text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ errorMessage }}</p>
        <button @click="fetchStats" class="btn-retry">Coba Memuat Ulang</button>
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
              <span class="card-tag">Aktif</span>
            </div>
            <div class="card-body">
              <span class="stat-number">{{ stats.activeWorkOrders || 0 }}</span>
              <span class="stat-label">Work Orders Berjalan</span>
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
              <span class="card-tag warning">Perlu Review</span>
            </div>
            <div class="card-body">
              <span class="stat-number text-amber">{{ stats.pendingApprovals || stats.pendingReports || 0 }}</span>
              <span class="stat-label">Laporan Menunggu Approval</span>
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
              <span class="card-tag success">Siap Tugas</span>
            </div>
            <div class="card-body">
              <span class="stat-number text-emerald">{{ stats.availableTechnicians || 0 }}</span>
              <span class="stat-label">Teknisi Field Tersedia</span>
            </div>
          </div>

          <!-- Bento Action Card 1: Toggle Preview Table Work Orders -->
          <div @click="toggleWorkOrdersTable" :class="['bento-item', 'action-card', 'group-blue', { 'active-card': showWorkOrdersTable }]">
            <div class="action-icon-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">
                <h3>Kelola Work Orders</h3>
                <svg :class="['arrow-icon', { 'rotate-down': showWorkOrdersTable }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <p>{{ showWorkOrdersTable ? 'Klik untuk menyembunyikan tabel preview.' : 'Tampilkan preview ringkas tabel Work Orders di bawah.' }}</p>
            </div>
          </div>

          <!-- Bento Action Card 2: Review Laporan -->
          <router-link to="/reports" class="bento-item action-card group-indigo">
            <div class="action-icon-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">
                <h3>Review Laporan Masuk</h3>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <p>Verifikasi laporan kerusakan dari pelapor sebelum diterbitkan menjadi Surat Tugas.</p>
            </div>
          </router-link>

          <!-- Bento Action Small Card: Refresh Data -->
          <button @click="fetchStats" class="bento-item quick-refresh-card">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>

        <!-- Section Work Orders Preview Table -->
        <Transition name="expand">
          <div v-if="showWorkOrdersTable" class="table-preview-section">
            <div class="table-header">
              <div class="table-title">
                <h3>Daftar Work Orders Terbaru</h3>
                <span class="count-badge">{{ workOrders.length }} Items</span>
              </div>
              
              <button @click="navigateToWorkOrders" class="btn-reroute">
                <span>Buka Halaman Penuh (/work-orders)</span>
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>

            <div v-if="loadingOrders" class="table-loading">
              <div class="spinner-sm"></div>
              <span>Memuat daftar Surat Tugas...</span>
            </div>

            <div v-else class="table-responsive">
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>WO Code</th>
                    <th>Judul Tugas</th>
                    <th>Laporan Terkait</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="workOrders.length === 0">
                    <td colspan="5" class="empty-cell">Belum ada Work Order aktif di sistem.</td>
                  </tr>
                  <tr v-for="item in workOrders.slice(0, 5)" :key="item._id || item.id">
                    <td class="code-cell">{{ item.code || item._id?.substring(0, 8) }}</td>
                    <td class="title-cell">{{ item.title }}</td>
                    <td>
                      <span v-if="item.reportId" class="badge-report">{{ item.reportId }}</span>
                      <span v-else class="text-muted">Mandiri</span>
                    </td>
                    <td>
                      <span :class="['badge-status', item.status?.toLowerCase()]">
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
const user = ref(null);
const loading = ref(true);
const loadingOrders = ref(false);
const errorMessage = ref('');
const showWorkOrdersTable = ref(false);

const activeTheme = ref('dark');

const applyTheme = (theme) => {
  activeTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
};

const toggleTheme = () => {
  const nextTheme = activeTheme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('user-theme', nextTheme);
  applyTheme(nextTheme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Default system check
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemPrefersDark ? 'dark' : 'light');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('user-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
};

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await managerApi.get('/api/manager/stats');
    stats.value = res?.data?.stats || res?.data?.data || res?.data || { activeWorkOrders: 0, pendingApprovals: 0, availableTechnicians: 0 };
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

const toggleWorkOrdersTable = () => {
  showWorkOrdersTable.value = !showWorkOrdersTable.value;
  if (showWorkOrdersTable.value && workOrders.value.length === 0) {
    fetchWorkOrders();
  }
};

const navigateToWorkOrders = () => {
  router.push('/work-orders');
};

const handleLogout = () => {
  logout();
};

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
/* Single Root Styling driven by Data Attributes */
.dashboard-wrapper {
  min-height: 100vh;
  padding: 32px 24px;
  font-family: system-ui, -apple-system, sans-serif;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* Base Light Palette (Default) */
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --amber-color: #d97706;
  --emerald-color: #059669;
  --danger-color: #ef4444;
  --icon-bg-blue: #eff6ff;
  --icon-bg-amber: #fffbeb;
  --icon-bg-emerald: #ecfdf5;
}

/* Dark Palette Override */
:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary-color: #3b82f6;
  --primary-hover: #60a5fa;
  --amber-color: #f59e0b;
  --emerald-color: #10b981;
  --danger-color: #f87171;
  --icon-bg-blue: #1e3a8a;
  --icon-bg-amber: #78350f;
  --icon-bg-emerald: #064e3b;
}

.dashboard-wrapper {
  background-color: var(--bg-main);
  color: var(--text-main);
}

/* Header Section */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

h1 { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
.header-actions { display: flex; align-items: center; gap: 12px; }

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background-color: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover { background-color: var(--danger-color); color: #ffffff; }

/* Bento Grid Layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.bento-item {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.bento-item:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
}

.active-card {
  border-color: var(--primary-color) !important;
  background-color: var(--icon-bg-blue);
}

/* Stat Cards */
.stat-card { display: flex; flex-direction: column; justify-content: space-between; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

.bg-blue { background-color: var(--icon-bg-blue); color: var(--primary-color); }
.bg-amber { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.bg-emerald { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }

.card-tag { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 20px; background-color: var(--icon-bg-blue); color: var(--primary-color); }
.card-tag.warning { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.card-tag.success { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }
.card-body { margin-top: 20px; }
.stat-number { display: block; font-size: 40px; font-weight: 800; line-height: 1; color: var(--text-main); }
.text-amber { color: var(--amber-color); }
.text-emerald { color: var(--emerald-color); }
.stat-label { display: block; font-size: 13px; color: var(--text-muted); margin-top: 8px; font-weight: 500; }

/* Action Large Bento Cards */
.action-card {
  grid-column: span 1;
  text-decoration: none;
  color: inherit;
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
  width: 120px;
  height: 120px;
  opacity: 0.06;
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon-bg { transform: scale(1.15) rotate(-5deg); opacity: 0.12; }
.action-title { display: flex; justify-content: space-between; align-items: center; }
.action-title h3 { margin: 0; font-size: 18px; font-weight: 700; }
.arrow-icon { width: 20px; height: 20px; color: var(--primary-color); transition: transform 0.25s ease; }
.arrow-icon.rotate-down { transform: rotate(90deg); }
.action-card:hover .arrow-icon:not(.rotate-down) { transform: translateX(4px); }
.action-content p { color: var(--text-muted); font-size: 13px; margin-top: 8px; margin-bottom: 0; line-height: 1.5; }

/* Quick Refresh Button */
.quick-refresh-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--bg-card);
  border: 1px dashed var(--border-color);
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  padding: 20px;
}

.quick-refresh-card:hover { border-style: solid; color: var(--primary-color); }

/* Section Table Preview Work Orders */
.table-preview-section {
  margin-top: 24px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-title { display: flex; align-items: center; gap: 12px; }
.table-title h3 { margin: 0; font-size: 18px; font-weight: 700; }
.count-badge { font-size: 12px; font-weight: 700; background-color: var(--icon-bg-blue); color: var(--primary-color); padding: 2px 8px; border-radius: 12px; }

.btn-reroute {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-reroute:hover { background-color: var(--primary-hover); }
.table-responsive { overflow-x: auto; }
.minimal-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.minimal-table th, .minimal-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
.minimal-table th { font-weight: 600; color: var(--text-muted); font-size: 12px; text-transform: uppercase; }
.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color); }
.title-cell { font-weight: 600; }
.badge-report { font-family: monospace; font-size: 11px; background: var(--bg-main); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); }
.text-muted { color: var(--text-muted); font-size: 12px; font-style: italic; }
.empty-cell { text-align: center; color: var(--text-muted); padding: 24px; }

.badge-status { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
.badge-status.assigned { background-color: var(--icon-bg-blue); color: var(--primary-color); }
.badge-status.in_progress { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.badge-status.completed { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }

/* Icons & Spinners */
.icon-sm { width: 16px; height: 16px; }
.icon { width: 22px; height: 22px; }
.icon-lg { width: 40px; height: 40px; }

.state-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 48px; text-align: center; color: var(--text-muted); }
.spinner, .spinner-sm { border: 3px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner { width: 32px; height: 32px; margin: 0 auto 16px; }
.spinner-sm { width: 20px; height: 20px; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 32px; color: var(--text-muted); }
.btn-retry { margin-top: 16px; padding: 8px 18px; background-color: var(--primary-color); color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease-in-out; max-height: 500px; opacity: 1; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

@media (max-width: 900px) {
  .bento-grid { grid-template-columns: repeat(1, 1fr); }
  .table-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
