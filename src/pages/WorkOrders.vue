<template>
  <div class="page-wrapper">
    <!-- Header Bar -->
    <header class="header-bar">
      <div class="header-left">
        <div class="top-nav">
          <button @click="goToDashboard" class="btn-back">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>{{ t('backToDashboard') }}</span>
          </button>
        </div>

        <div class="title-with-logo">
          <!-- Logo Kanji 築 (Chiku) Header -->
          <div class="kanji-logo-header">
            <span class="kanji-header-text">築</span>
          </div>
          <div>
            <h2 class="page-title">{{ t('pageTitle') }}</h2>
            <p class="subtitle">{{ t('pageSubtitle') }}</p>
          </div>
        </div>
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

        <!-- Tombol Buat Work Order Baru -->
        <button @click="showCreateModal = true" class="btn-create">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>{{ t('createWorkOrder') }}</span>
        </button>
      </div>
    </header>

    <!-- State Card: Loading -->
    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>{{ t('loadingOrders') }}</p>
    </div>

    <!-- Table Preview Section -->
    <div v-else class="table-container">
      <div class="table-responsive">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>{{ t('colLetterId') }}</th>
              <th>{{ t('colCompanyName') }}</th>
              <th>{{ t('colIssuer') }}</th>
              <th>{{ t('colLocation') }}</th>
              <th>{{ t('colTotalCost') }}</th>
              <th>{{ t('colDocument') }}</th>
              <th>{{ t('colCreatedDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="orders.length === 0">
              <td colspan="7" class="empty-cell">{{ t('noWorkOrders') }}</td>
            </tr>
            <tr v-for="item in orders" :key="item._id || item.id">
              <td class="code-cell">{{ item.woCode || item._id?.substring(0, 8) }}</td>
              <td class="title-cell">{{ item.companyName || 'Infrastructure_Report' }}</td>
              <td>
                <div class="creator-cell">
                  <span class="creator-name">{{ item.createdBy || '-' }}</span>
                  <span v-if="item.createdByEmail" class="creator-email">{{ item.createdByEmail }}</span>
                </div>
              </td>
              <td>{{ item.locationName || '-' }}</td>
              <td class="price-cell">Rp {{ formatCurrency(item.grandTotal) }}</td>
              <td>
                <button @click="generateAndDownloadPDF(item)" class="btn-pdf-action">
                  <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>{{ t('downloadPdf') }}</span>
                </button>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Komponen Terpisah -->
    <CreateWorkOrderModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="fetchWorkOrders"
    />

    <!-- Template Hidden Offscreen Rendering PDF -->
    <div class="pdf-offscreen-container">
      <div v-if="activePdfItem" id="dynamic-pdf-area" class="pdf-document">
        <div class="pdf-header">
          <h2>SURAT TUGAS WORK ORDER</h2>
          <h3>{{ activePdfItem.companyName || 'Infrastructure_Report' }}</h3>
          <p><strong>ID Surat:</strong> {{ activePdfItem.woCode }}</p>
        </div>
        <hr class="pdf-divider" />
        <div class="pdf-meta">
          <div>
            <strong>Nama Pembuat Surat:</strong> {{ activePdfItem.createdBy }}
            <span v-if="activePdfItem.createdByEmail"> ({{ activePdfItem.createdByEmail }})</span>
          </div>
          <div>
            <strong>Tanggal Pembuatan:</strong> {{ formatDate(activePdfItem.createdAt) }}<br />
            <strong>Tanggal Pelaksanaan:</strong> {{ formatDate(activePdfItem.executionDate || activePdfItem.createdAt) }}
          </div>
        </div>

        <div class="pdf-section">
          <h4>1. Pendahuluan</h4>
          <p>{{ activePdfItem.introduction || '-' }}</p>
        </div>

        <div class="pdf-section">
          <h4>2. Lokasi Perbaikan & Tanggal Pelaksanaan</h4>
          <p><strong>Nama Tempat:</strong> {{ activePdfItem.locationName || '-' }}</p>
          <p><strong>Tanggal Pelaksanaan:</strong> {{ formatDate(activePdfItem.executionDate || activePdfItem.createdAt) }}</p>
          <p v-if="activePdfItem.mapsUrl"><strong>Google Maps URL:</strong> {{ activePdfItem.mapsUrl }}</p>
        </div>

        <div class="pdf-section">
          <h4>3. List Teknisi yang Dipekerjakan</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Nama Teknisi</th>
                <th>Email Teknisi</th>
                <th>Nomor Handphone</th>
                <th>Bayaran</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tItem, idx) in (activePdfItem.technicians || [])" :key="idx">
                <td>{{ tItem.name }}</td>
                <td>{{ tItem.email }}</td>
                <td>{{ tItem.phone || tItem.phoneNumber || '-' }}</td>
                <td>Rp {{ formatCurrency(tItem.fee) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Bayaran Teknisi: <strong>Rp {{ formatCurrency(activePdfItem.totalTechnicianFee) }}</strong></p>
        </div>

        <div class="pdf-section">
          <h4>4. List Biaya Resource</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Nama Sumber Daya</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in (activePdfItem.resources || [])" :key="idx">
                <td>{{ r.name }}</td>
                <td>{{ r.quantity }}</td>
                <td>{{ r.unit }}</td>
                <td>Rp {{ formatCurrency(r.price) }}</td>
                <td>Rp {{ formatCurrency(r.subtotal || (r.quantity * r.price)) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Biaya Resource: <strong>Rp {{ formatCurrency(activePdfItem.totalResourceCost) }}</strong></p>
        </div>

        <div class="pdf-footer-summary">
          GRAND TOTAL BIAYA: Rp {{ formatCurrency(activePdfItem.grandTotal) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import html2pdf from 'html2pdf.js';
import { adminApi, managerApi } from '../services/api';
import CreateWorkOrderModal from './CreateWorkOrderModal.vue';

const router = useRouter();

const orders = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const activePdfItem = ref(null);
const activeTheme = ref('light');
const currentLang = ref('id');

// KAMUS TRANSLASI (i18n)
const translations = {
  id: {
    backToDashboard: 'Kembali ke Dashboard Utama',
    pageTitle: 'Manajemen Surat Tugas (Work Orders)',
    pageSubtitle: 'Kelola pengerjaan teknisi dan alokasi resource infrastruktur',
    createWorkOrder: 'Buat Work Order Baru',
    loadingOrders: 'Memuat daftar Surat Tugas (Work Orders)...',
    colLetterId: 'Surat ID',
    colCompanyName: 'Nama Perusahaan',
    colIssuer: 'Pembuat Surat',
    colLocation: 'Lokasi Perbaikan',
    colTotalCost: 'Total Biaya',
    colDocument: 'Bukti Surat (Dokumen)',
    colCreatedDate: 'Tanggal Buat',
    noWorkOrders: 'Belum ada Work Order aktif di sistem.',
    downloadPdf: 'Download PDF'
  },
  en: {
    backToDashboard: 'Back to Main Dashboard',
    pageTitle: 'Work Order Management',
    pageSubtitle: 'Manage technician dispatch and infrastructure resource allocations',
    createWorkOrder: 'Create New Work Order',
    loadingOrders: 'Loading Work Orders list...',
    colLetterId: 'Letter ID',
    colCompanyName: 'Company Name',
    colIssuer: 'Issuer',
    colLocation: 'Repair Location',
    colTotalCost: 'Total Cost',
    colDocument: 'Letter Proof (Document)',
    colCreatedDate: 'Date Created',
    noWorkOrders: 'No active Work Orders in system.',
    downloadPdf: 'Download PDF'
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
  activeTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  applyThemeToDOM(savedTheme);
};

const toggleTheme = () => {
  const nextTheme = activeTheme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('user-theme', nextTheme);
  applyThemeToDOM(nextTheme);
};

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

const generateAndDownloadPDF = async (item) => {
  activePdfItem.value = item;
  await nextTick();

  const element = document.getElementById('dynamic-pdf-area');
  if (!element) return;

  const pdfName = `WorkOrder_${item.woCode || item._id}.pdf`;

  const opt = {
    margin: 10,
    filename: pdfName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Gagal membuat file PDF:', error);
  } finally {
    activePdfItem.value = null;
  }
};

const formatCurrency = (val) => Number(val || 0).toLocaleString('id-ID');

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

onMounted(() => {
  initTheme();
  initLanguage();
  fetchWorkOrders();
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
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --emerald-color: #059669;
  --border-color: #e2e8f0;
  --badge-bg: #f1f5f9;
  --badge-text: #334155;
  --btn-pdf-bg: #d97706;
  --btn-pdf-hover: #b45309;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
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
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --emerald-color: #10b981;
  --border-color: #334155;
  --badge-bg: #334155;
  --badge-text: #cbd5e1;
  --btn-pdf-bg: #f59e0b;
  --btn-pdf-hover: #d97706;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
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

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.top-nav {
  margin-bottom: 8px;
}

.title-with-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kanji-logo-header {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px -2px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.kanji-header-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.subtitle {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 13px;
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  transition: opacity 0.2s ease;
}

.btn-back:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* LANGUAGE SWITCHER STYLES */
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

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-create:hover {
  background-color: var(--primary-hover);
}

.table-container {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-responsive {
  overflow-x: auto;
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
  font-weight: 700;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  background-color: var(--bg-main);
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

.btn-pdf-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--btn-pdf-bg);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-pdf-action:hover {
  background-color: var(--btn-pdf-hover);
}

.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 14px; height: 14px; }

.state-card { 
  background-color: var(--bg-card); 
  border-radius: 12px; 
  padding: 36px; 
  text-align: center; 
  color: var(--text-muted); 
  border: 1px solid var(--border-color);
}

.spinner { 
  width: 28px; 
  height: 28px; 
  margin: 0 auto 14px; 
  border: 3px solid var(--border-color); 
  border-top-color: var(--primary-color); 
  border-radius: 50%; 
  animation: spin 0.8s linear infinite; 
}

@keyframes spin { to { transform: rotate(360deg); } }

/* PDF OFFSCREEN CONTAINER */
.pdf-offscreen-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 210mm;
  background: #ffffff;
}

.pdf-document { padding: 24px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; }
.pdf-header { text-align: center; }
.pdf-header h2 { margin: 0; font-size: 18px; color: #000000; }
.pdf-header h3 { margin: 4px 0; font-size: 14px; color: #333333; }
.pdf-divider { margin: 16px 0; border: 0; border-top: 2px solid #333; }
.pdf-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #000000; }
.pdf-section { margin-bottom: 16px; color: #000000; }
.pdf-section h4 { margin-bottom: 6px; font-size: 14px; color: #000000; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; text-align: left; color: #000000; }
.pdf-subtotal { text-align: right; margin-top: 6px; font-size: 12px; color: #000000; }
.pdf-footer-summary { text-align: right; font-size: 15px; font-weight: bold; padding: 12px; background: #e2e8f0; margin-top: 20px; color: #000000; }

@media (max-width: 768px) {
  .page-wrapper { padding: 16px; }
  .header-bar { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: space-between; }
  .btn-create { flex: 1; }
}
</style>
