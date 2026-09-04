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

        <!-- Header Content -->
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
      <div v-if="loading" class="workorders-grid">
        <div v-for="n in 4" :key="'skeleton-' + n" class="wo-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-box"></div>
          <div class="skeleton-line skeleton-box"></div>
          <div class="skeleton-line skeleton-btn"></div>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchWorkOrders" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="workOrders.length === 0" class="state-card empty">
        <p>{{ t('emptyData') }}</p>
      </div>

      <!-- WORK ORDERS GRID DATA -->
      <div v-else class="workorders-grid">
        <article v-for="wo in workOrders" :key="wo._id || wo.woCode" class="wo-card">
          <!-- Card Top: WO Code & Status -->
          <div class="card-top">
            <div class="wo-identity">
              <span class="wo-code">{{ wo.woCode || 'WO-UNTITLED' }}</span>
              <span class="company-tag">{{ wo.companyName || 'Infrastructure_Report' }}</span>
            </div>
            <span :class="['status-badge', (wo.status || 'PENDING').toLowerCase()]">
              {{ wo.status || 'PENDING' }}
            </span>
          </div>

          <!-- Main Location & Date -->
          <div class="location-header">
            <h3 class="location-name">
              <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ wo.locationName || 'Lokasi Belum Ditentukan' }}
            </h3>
            <a v-if="wo.mapsUrl" :href="wo.mapsUrl" target="_blank" class="maps-link">Maps &rarr;</a>
          </div>

          <p v-if="wo.introduction" class="wo-intro">{{ wo.introduction }}</p>

          <!-- Key Data Grid -->
          <div class="kv-grid-container">
            <div class="kv-item">
              <span class="kv-label">{{ t('colExecDate') }}</span>
              <strong class="kv-value">{{ formatDate(wo.executionDate) }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colCreatedBy') }}</span>
              <strong class="kv-value">{{ wo.createdBy || 'Manager' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colCreatedDate') }}</span>
              <strong class="kv-value">{{ formatDate(wo.createdAt) }}</strong>
            </div>
          </div>

          <!-- Section: Technicians List -->
          <div class="section-block">
            <span class="block-title">{{ t('labelTechnicians') }} ({{ wo.technicians?.length || 0 }})</span>
            <div class="technician-list">
              <div v-for="tech in wo.technicians" :key="tech._id || tech.technicianId" class="tech-item">
                <div class="tech-info">
                  <span class="tech-name">{{ tech.name || 'Teknisi' }}</span>
                  <span class="tech-contact">{{ tech.phone }} &bull; {{ tech.email }}</span>
                </div>
                <span class="tech-fee">{{ formatCurrency(tech.fee) }}</span>
              </div>
              <div v-if="!wo.technicians || wo.technicians.length === 0" class="no-data-text">
                Belum ada teknisi ditugaskan.
              </div>
            </div>
          </div>

          <!-- Section: Resources / Materials -->
          <div v-if="wo.resources && wo.resources.length > 0" class="section-block">
            <span class="block-title">{{ t('labelResources') }} ({{ wo.resources.length }})</span>
            <div class="resource-list">
              <div v-for="res in wo.resources" :key="res._id" class="res-item">
                <span>{{ res.name }} ({{ res.quantity }} {{ res.unit }})</span>
                <span>{{ formatCurrency(res.subtotal) }}</span>
              </div>
            </div>
          </div>

          <!-- Financial Breakdown Panel -->
          <div class="financial-panel">
            <div class="fin-row">
              <span>Biaya Teknisi:</span>
              <span>{{ formatCurrency(wo.totalTechnicianFee) }}</span>
            </div>
            <div class="fin-row">
              <span>Biaya Material:</span>
              <span>{{ formatCurrency(wo.totalResourceCost) }}</span>
            </div>
            <div class="fin-row grand-total">
              <span>Grand Total:</span>
              <span class="total-amount">{{ formatCurrency(wo.grandTotal) }}</span>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="card-actions">
            <a v-if="wo.proofDocumentUrl" :href="wo.proofDocumentUrl" target="_blank" class="btn-proof">
              <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {{ t('btnDocument') }}
            </a>
            <button @click="navigateToDetail(wo)" class="btn-detail">
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
const workOrders = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');
const currentLang = ref('id');

const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const translations = {
  id: {
    navWorkflow: 'Flow System',
    pageTitle: 'Daftar Work Order & Penugasan',
    pageSubtitle: 'Manajemen Lapangan & Jadwal Work Order Microservice',
    btnRetry: 'Coba Lagi',
    emptyData: 'Belum ada data work order terdaftar.',
    colExecDate: 'Tanggal Eksekusi',
    colCreatedBy: 'Dibuat Oleh',
    colCreatedDate: 'Tgl Dibuat',
    labelTechnicians: 'Teknisi Lapangan',
    labelResources: 'Kebutuhan Material',
    btnDocument: 'Dokumen Bukti',
    btnViewDetail: 'Lihat Detail Laporan'
  },
  en: {
    navWorkflow: 'Flow System',
    pageTitle: 'Work Orders & Assignment List',
    pageSubtitle: 'Field Management & Work Order Schedule Microservice',
    btnRetry: 'Try Again',
    emptyData: 'No work orders registered yet.',
    colExecDate: 'Execution Date',
    colCreatedBy: 'Created By',
    colCreatedDate: 'Created Date',
    labelTechnicians: 'Field Technicians',
    labelResources: 'Material Resources',
    btnDocument: 'Proof Document',
    btnViewDetail: 'View Report Detail'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const goToHome = () => router.push('/');
const goToWorkflow = () => router.push('/workflow');

const navigateToDetail = (wo) => {
  const targetId = wo._id || wo.id;
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

// Fetch Work Orders
const fetchWorkOrders = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await axios.get(`${MANAGER_SERVICE_URL}/api/manager/work-orders`);
    const data = res?.data?.workOrders || res?.data?.data || res?.data?.visits || res?.data || [];
    workOrders.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching Work Orders:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Gagal memuat data Work Order dari server.';
    workOrders.value = [];
  } finally {
    loading.value = false;
  }
};

// Helpers Format
const formatCurrency = (val) => {
  if (typeof val !== 'number') val = Number(val) || 0;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
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
  fetchWorkOrders();
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #475569;
  --border-color: #e2e8f0;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --kv-bg: #f1f5f9;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --skeleton-bg: #e2e8f0;
  --lang-btn-bg: #e2e8f0;
  --lang-btn-active: #ffffff;
  --lang-text-active: #2563eb;
  --badge-bg: #e0f2fe;
  --badge-text: #0369a1;
}

:global([data-theme="dark"]) {
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
  --badge-bg: #1e3a8a;
  --badge-text: #93c5fd;
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

.header-content h1.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
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

.switch-icon { width: 15px; height: 15px; color: var(--switch-icon-color); }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 18px; height: 18px; }
.icon-xs { width: 14px; height: 14px; }

.main-content { width: 100%; }

.workorders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  width: 100%;
}

.wo-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wo-identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wo-code {
  font-family: monospace;
  font-weight: 800;
  font-size: 14px;
  color: var(--primary);
}

.company-tag {
  font-size: 10px;
  background: var(--badge-bg);
  color: var(--badge-text);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-badge.assigned { background: #dbeafe; color: #1e40af; }
.status-badge.in_progress { background: #fef3c7; color: #b45309; }
.status-badge.completed { background: #dcfce7; color: #15803d; }

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}

.maps-link {
  font-size: 12px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.wo-intro {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.kv-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background-color: var(--kv-bg);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.kv-item { display: flex; flex-direction: column; }
.kv-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.kv-value { font-size: 11px; font-weight: 700; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; }

.section-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.block-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
}

.technician-list, .resource-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tech-item, .res-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 6px 10px;
  background: var(--kv-bg);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.tech-info { display: flex; flex-direction: column; }
.tech-name { font-weight: 700; color: var(--text-main); }
.tech-contact { font-size: 10px; color: var(--text-muted); }
.tech-fee { font-weight: 700; color: var(--primary); }

.financial-panel {
  background: rgba(37, 99, 235, 0.05);
  border: 1px dashed var(--primary);
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.fin-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
}

.grand-total {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--border-color);
  font-weight: 800;
  color: var(--text-main);
}

.total-amount {
  font-size: 14px;
  color: #10b981;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.btn-proof {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--kv-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.btn-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 10px 14px;
  background-color: var(--primary);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
  min-height: 250px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-title { height: 20px; width: 60%; }
.skeleton-box { height: 40px; width: 100%; }
.skeleton-btn { height: 36px; width: 100%; margin-top: auto; }

@keyframes jumpGlow {
  0%, 100% { transform: translateY(0); box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
  50% { transform: translateY(-6px); box-shadow: 0 0 22px rgba(16, 185, 129, 0.85); }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 600px) {
  .page-container { padding: 16px; }
  .btn-text { display: none; }
  .workorders-grid { grid-template-columns: 1fr; }
}
</style>
