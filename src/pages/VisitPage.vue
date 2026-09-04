<template>
  <div class="page-container">
    <!-- Header Page -->
    <header class="header-section">
      <div class="header-left">
        <div class="nav-button-group">
          <!-- Tombol Reroute ke Home '/' -->
          <button @click="goToHome" class="btn-nav" title="Kembali ke Landing Page">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span class="btn-text">Home</span>
          </button>

          <!-- Tombol Reroute ke Flow / Workflow (Besar, Menyala & Jumping) -->
          <button @click="goToWorkflow" class="btn-nav btn-flow-featured" title="Buka Workflow System">
            <svg class="icon-md icon-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="btn-featured-text">{{ t('navWorkflow') }}</span>
          </button>
        </div>

        <!-- Header Content dengan Kontras Warna yang Diperbaiki -->
        <div class="header-content">
          <h1 class="page-title">{{ t('pageTitle') }}</h1>
          <p class="subtitle">{{ t('pageSubtitle') }}</p>
        </div>
      </div>

      <div class="header-right-actions">
        <!-- Language Switcher (ID / EN) -->
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

        <!-- Fluid Theme Switch -->
        <div class="theme-switch-wrapper">
          <button 
            @click="toggleTheme" 
            class="theme-toggle-switch" 
            :class="{ 'is-dark': currentTheme === 'dark' }"
            title="Ubah Tema"
            aria-label="Toggle Theme"
          >
            <span class="switch-handle">
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
              <svg v-else class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <main class="main-content">
      <!-- CHUNK LOADING (SKELETON STATE) -->
      <div v-if="loading" class="visits-grid">
        <div v-for="n in 6" :key="'skeleton-' + n" class="visit-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="i" class="skeleton-line skeleton-box"></div>
          </div>
          <div class="skeleton-line skeleton-btn"></div>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchVisits" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="visits.length === 0" class="state-card empty">
        <p>{{ t('emptyData') }}</p>
      </div>

      <!-- VISITS GRID DATA -->
      <div v-else class="visits-grid">
        <article v-for="visit in visits" :key="visit._id || visit.id" class="visit-card">
          <div class="card-top">
            <h3 class="location-name">{{ visit.title || visit.locationName || visit.location || t('defaultLocation') }}</h3>
            <span :class="['status-badge', (visit.status || 'PENDING').toLowerCase()]">
              {{ visit.status || 'PENDING' }}
            </span>
          </div>

          <div class="kv-grid-container">
            <div class="kv-item">
              <span class="kv-label">{{ t('colWoId') }}</span>
              <strong class="kv-value">{{ visit.workOrderNumber || visit.reportId || visit._id?.substring(0, 6) || '-' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colTechnician') }}</span>
              <strong class="kv-value">{{ getTechnicianName(visit) }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colDate') }}</span>
              <strong class="kv-value">{{ formatDate(visit.visitDate || visit.createdAt || visit.dueDate) }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colCategory') }}</span>
              <strong class="kv-value">{{ visit.category || 'Maintenance' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colPriority') }}</span>
              <strong class="kv-value">{{ visit.priority || 'NORMAL' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colLocation') }}</span>
              <strong class="kv-value">{{ visit.location || visit.locationName || '-' }}</strong>
            </div>
          </div>

          <div class="card-actions">
            <button @click="navigateToDetail(visit)" class="btn-detail">
              <span>{{ t('btnViewDetail') }}</span>
              <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const visits = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');
const currentLang = ref('id');

const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const translations = {
  id: {
    navWorkflow: 'Flow System',
    pageTitle: 'Daftar Kunjungan & Work Order',
    pageSubtitle: 'Riwayat & Jadwal Penugasan Manager Field',
    btnRetry: 'Coba Lagi',
    emptyData: 'Belum ada data kunjungan / work order terdaftar.',
    defaultLocation: 'Kunjungan Lapangan',
    colWoId: 'ID WO / Report',
    colTechnician: 'Teknisi',
    colDate: 'Tanggal',
    colCategory: 'Kategori',
    colPriority: 'Prioritas',
    colLocation: 'Lokasi',
    btnViewDetail: 'Lihat Detail Laporan'
  },
  en: {
    navWorkflow: 'Flow System',
    pageTitle: 'Visits & Work Order List',
    pageSubtitle: 'History & Field Manager Assignment Schedule',
    btnRetry: 'Try Again',
    emptyData: 'No visits or work orders registered yet.',
    defaultLocation: 'Field Visit',
    colWoId: 'WO / Report ID',
    colTechnician: 'Technician',
    colDate: 'Date',
    colCategory: 'Category',
    colPriority: 'Priority',
    colLocation: 'Location',
    btnViewDetail: 'View Report Details'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const goToHome = () => router.push('/');

const goToWorkflow = () => router.push('/workflow');

const navigateToDetail = (visit) => {
  const targetId = visit.reportId || visit._id || visit.id;
  if (targetId) router.push(`/reports/${targetId}`);
};

const initLanguage = () => {
  currentLang.value = localStorage.getItem('user-lang') || 'id';
};

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'id' ? 'en' : 'id';
  localStorage.setItem('user-lang', currentLang.value);
};

const applyThemeToDOM = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const initTheme = () => {
  currentTheme.value = localStorage.getItem('user-theme') || 'light';
  applyThemeToDOM(currentTheme.value);
};

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('user-theme', currentTheme.value);
  applyThemeToDOM(currentTheme.value);
};

const getTechnicianName = (visit) => {
  if (!visit) return '-';
  if (Array.isArray(visit.technicians) && visit.technicians.length > 0) {
    const first = visit.technicians[0];
    if (typeof first === 'object' && first?.name) return first.name;
    if (typeof first === 'string') return first;
  }
  if (typeof visit.technicianName === 'string' && visit.technicianName.trim()) return visit.technicianName;
  if (visit.assignedTechnician?.name) return visit.assignedTechnician.name;
  return '-';
};

const fetchVisits = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await axios.get(`${MANAGER_SERVICE_URL}/api/manager/work-orders`);
    const data = res?.data?.workOrders || res?.data?.data || res?.data?.visits || res?.data || [];
    visits.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching Manager Work Orders:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Gagal memuat data Work Order.';
    visits.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
};

onMounted(() => {
  initTheme();
  initLanguage();
  fetchVisits();
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
  --text-muted: #475569;
  --border-color: #e2e8f0;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --kv-bg: #f8fafc;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --skeleton-bg: #e2e8f0;
  --lang-btn-bg: #e2e8f0;
  --lang-btn-active: #ffffff;
  --lang-text-active: #2563eb;
}

:global([data-theme="dark"]),
:global(body[data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #ffffff;
  --text-muted: #cbd5e1;
  --border-color: #334155;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --kv-bg: #0f172a;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --skeleton-bg: #334155;
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

.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px;
  box-sizing: border-box;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  width: 100%;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.nav-button-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background-color: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-nav:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* TOMBOL FLOW SYSTEM: BESAR, MENYALA & ANIMASI JUMPING */
.btn-flow-featured {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  animation: jumpGlow 2s infinite ease-in-out;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-flow-featured:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.85);
}

.btn-featured-text {
  letter-spacing: 0.3px;
}

/* HEADER TITLE & SUBTITLE KONTRAS DENGAN TEMA */
.header-content {
  display: flex;
  flex-direction: column;
}

.header-content h1.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-main);
  transition: color 0.4s ease;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--text-muted);
  transition: color 0.4s ease;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.lang-option {
  position: relative;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  width: 28px;
  text-align: center;
  color: var(--text-muted);
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
  transition: transform 0.3s ease;
  z-index: 1;
}

.lang-toggle-switch.is-en .lang-slider {
  transform: translateX(32px);
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
}

.switch-handle {
  width: 26px;
  height: 26px;
  background-color: var(--switch-handle-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease;
}

.theme-toggle-switch.is-dark .switch-handle {
  transform: translateX(28px);
}

.switch-icon {
  width: 15px;
  height: 15px;
  color: var(--switch-icon-color);
}

.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 18px; height: 18px; }
.icon-xs { width: 14px; height: 14px; }

.main-content {
  width: 100%;
}

.visits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  width: 100%;
}

.visit-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.location-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  transition: color 0.4s ease;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-badge.completed, .status-badge.done { background: #dcfce7; color: #15803d; }
.status-badge.in_progress, .status-badge.pending, .status-badge.assigned { background: #fef3c7; color: #b45309; }
.status-badge.cancelled { background: #fee2e2; color: #b91c1c; }

.kv-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background-color: var(--kv-bg);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 16px;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.kv-item { display: flex; flex-direction: column; }
.kv-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
.kv-value { font-size: 12px; font-weight: 700; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; }

.card-actions { display: flex; justify-content: flex-end; margin-top: auto; }

.btn-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background-color: var(--primary);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-detail:hover {
  background-color: var(--primary-hover);
}

.state-card {
  padding: 40px 16px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-muted);
}

.btn-retry {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.skeleton-card {
  min-height: 200px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.skeleton-box {
  height: 28px;
  width: 100%;
}

.skeleton-btn {
  height: 36px;
  width: 100%;
  margin-top: auto;
}

/* ANIMASI JUMPING & GLOWING */
@keyframes jumpGlow {
  0%, 100% {
    transform: translateY(0);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }
  50% {
    transform: translateY(-6px);
    box-shadow: 0 0 22px rgba(16, 185, 129, 0.85);
  }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 600px) {
  .page-container { padding: 16px; }
  .btn-text { display: none; }
  .visits-grid { grid-template-columns: 1fr; }
}
</style>
