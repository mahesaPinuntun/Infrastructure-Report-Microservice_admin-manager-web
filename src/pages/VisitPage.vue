<template>
  <div class="page-container">
    <header class="header-section">
      <div class="header-left">
        <div class="nav-button-group">
          <button @click="goToHome" class="btn-nav" title="Kembali ke Landing Page">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span class="btn-text">Home</span>
          </button>

          <button @click="goToWorkflow" class="btn-nav btn-flow-featured" title="Buka Workflow System">
            <svg class="icon-md icon-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="btn-featured-text">{{ t('navWorkflow') }}</span>
          </button>
        </div>

        <div class="header-content">
          <h1 class="page-title">{{ t('pageTitle') }}</h1>
          <p class="subtitle">{{ t('pageSubtitle') }}</p>
        </div>
      </div>

      <div class="header-right-actions">
        <div class="lang-switch-wrapper">
          <button 
            @click="toggleLanguage" 
            class="lang-toggle-switch"
            :class="{ 'is-en': currentLang === 'en' }"
            aria-label="Toggle Language"
          >
            <span class="lang-option" :class="{ active: currentLang === 'id' }">ID</span>
            <span class="lang-option" :class="{ active: currentLang === 'en' }">EN</span>
            <span class="lang-slider"></span>
          </button>
        </div>

        <div class="theme-switch-wrapper">
          <button 
            @click="toggleTheme" 
            class="theme-toggle-switch" 
            :class="{ 'is-dark': currentTheme === 'dark' }"
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

    <main class="main-content">
      <div v-if="loading" class="wo-vertical-list">
        <div v-for="n in 4" :key="'skeleton-' + n" class="wo-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-box"></div>
          <div class="skeleton-line skeleton-box"></div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchWorkOrders" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <div v-else-if="workOrders.length === 0" class="state-card empty">
        <p>{{ t('emptyData') }}</p>
      </div>

      <div v-else class="wo-vertical-list">
        <article v-for="wo in workOrders" :key="wo._id || wo.woCode" class="wo-card">
          <div class="card-header-row">
            <div class="header-meta">
              <span class="wo-code">{{ wo.woCode || 'WO-UNTITLED' }}</span>
              <span class="company-badge">{{ wo.companyName || 'Infrastructure_Report' }}</span>
            </div>
            <span :class="['status-badge', (wo.status || 'PENDING').toLowerCase()]">
              {{ wo.status || 'PENDING' }}
            </span>
          </div>

          <div class="wo-body-section">
            <div class="location-info">
              <h3 class="location-title">
                <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ wo.locationName || 'Lokasi Belum Ditentukan' }}
              </h3>
              <a v-if="wo.mapsUrl" :href="wo.mapsUrl" target="_blank" class="maps-link">Buka Google Maps &rarr;</a>
            </div>

            <p v-if="wo.introduction" class="wo-intro">{{ wo.introduction }}</p>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">{{ t('colExecDate') }}</span>
                <strong class="meta-value">{{ formatDate(wo.executionDate) }}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-label">{{ t('colCreatedBy') }}</span>
                <strong class="meta-value">{{ wo.createdBy || '-' }} ({{ wo.createdByEmail || '-' }})</strong>
              </div>
              <div class="meta-item">
                <span class="meta-label">{{ t('colCreatedDate') }}</span>
                <strong class="meta-value">{{ formatDate(wo.createdAt) }}</strong>
              </div>
            </div>
          </div>

          <div class="wo-sub-block">
            <h4 class="sub-block-title">{{ t('labelTechnicians') }} ({{ wo.technicians?.length || 0 }})</h4>
            <div class="sub-list">
              <div v-for="tech in wo.technicians" :key="tech._id || tech.technicianId" class="sub-item">
                <div class="item-main">
                  <span class="item-name">{{ tech.name || 'Teknisi' }}</span>
                  <span class="item-subtext">{{ tech.phone }} &bull; {{ tech.email }}</span>
                </div>
                <span class="item-price">{{ formatCurrency(tech.fee) }}</span>
              </div>
              <div v-if="!wo.technicians || wo.technicians.length === 0" class="no-data-text">
                Belum ada teknisi ditugaskan.
              </div>
            </div>
          </div>

          <div v-if="wo.resources && wo.resources.length > 0" class="wo-sub-block">
            <h4 class="sub-block-title">{{ t('labelResources') }} ({{ wo.resources.length }})</h4>
            <div class="sub-list">
              <div v-for="res in wo.resources" :key="res._id" class="sub-item">
                <div class="item-main">
                  <span class="item-name">{{ res.name }}</span>
                  <span class="item-subtext">{{ res.quantity }} {{ res.unit }} &times; {{ formatCurrency(res.price) }}</span>
                </div>
                <span class="item-price">{{ formatCurrency(res.subtotal) }}</span>
              </div>
            </div>
          </div>

          <div class="cost-summary-box">
            <div class="cost-row">
              <span>Total Biaya Teknisi:</span>
              <strong>{{ formatCurrency(wo.totalTechnicianFee) }}</strong>
            </div>
            <div class="cost-row">
              <span>Total Biaya Material:</span>
              <strong>{{ formatCurrency(wo.totalResourceCost) }}</strong>
            </div>
            <div class="cost-row grand-total-row">
              <span>Grand Total:</span>
              <strong class="grand-total-val">{{ formatCurrency(wo.grandTotal) }}</strong>
            </div>
          </div>

          <div class="card-action-bar">
            <button @click="generateAndDownloadPDF(wo)" class="btn-doc">
              <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>{{ t('btnDocument') }}</span>
            </button>
            
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

    <div class="pdf-offscreen-container">
      <div v-if="activePdfItem" id="dynamic-pdf-area-visit" class="pdf-document">
        <div class="pdf-header">
          <h2>SURAT TUGAS WORK ORDER</h2>
          <h3>{{ activePdfItem.companyName || 'Infrastructure_Report' }}</h3>
          <p><strong>ID Surat:</strong> {{ activePdfItem.woCode }}</p>
        </div>
        <hr class="pdf-divider" />
        <div class="pdf-meta">
          <div>
            <strong>Nama Pembuat Surat:</strong> {{ activePdfItem.createdBy || '-' }}
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
                <td>{{ formatCurrency(tItem.fee) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Bayaran Teknisi: <strong>{{ formatCurrency(activePdfItem.totalTechnicianFee) }}</strong></p>
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
                <td>{{ formatCurrency(r.price) }}</td>
                <td>{{ formatCurrency(r.subtotal || (r.quantity * r.price)) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Biaya Resource: <strong>{{ formatCurrency(activePdfItem.totalResourceCost) }}</strong></p>
        </div>

        <div class="pdf-footer-summary">
          GRAND TOTAL BIAYA: {{ formatCurrency(activePdfItem.grandTotal) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const router = useRouter();
const workOrders = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const activePdfItem = ref(null);
const currentTheme = ref('light');
const currentLang = ref('id');

const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const translations = {
  id: {
    navWorkflow: 'Flow System',
    pageTitle: 'Daftar Dokumen & Work Order',
    pageSubtitle: 'Riwayat & Jadwal Penugasan Manager Field',
    btnRetry: 'Coba Lagi',
    emptyData: 'Belum ada data work order terdaftar.',
    colExecDate: 'Tanggal Eksekusi',
    colCreatedBy: 'Dibuat Oleh',
    colCreatedDate: 'Tanggal Dibuat',
    labelTechnicians: 'Teknisi Ditugaskan',
    labelResources: 'Rincian Material / Resources',
    btnDocument: 'Dokumen Bukti (PDF)',
    btnViewDetail: 'Lihat Detail'
  },
  en: {
    navWorkflow: 'Flow System',
    pageTitle: 'Work Orders & Documents List',
    pageSubtitle: 'History & Field Manager Assignment Schedule',
    btnRetry: 'Try Again',
    emptyData: 'No work orders registered yet.',
    colExecDate: 'Execution Date',
    colCreatedBy: 'Created By',
    colCreatedDate: 'Created Date',
    labelTechnicians: 'Assigned Technicians',
    labelResources: 'Material / Resources Breakdown',
    btnDocument: 'Proof Document (PDF)',
    btnViewDetail: 'View Detail'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const goToHome = () => router.push('/');
const goToWorkflow = () => router.push('/workflow');

const navigateToDetail = (wo) => {
  const targetId = wo._id || wo.id;
  if (targetId) router.push(`/work-orders/${targetId}`);
};

// MODUL GENERATE PDF CLIENT-SIDE
const generateAndDownloadPDF = async (item) => {
  activePdfItem.value = item;
  await nextTick();

  const element = document.getElementById('dynamic-pdf-area-visit');
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
    console.error('Gagal merender PDF:', error);
  } finally {
    activePdfItem.value = null;
  }
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
  --sub-bg: #f1f5f9;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --skeleton-bg: #e2e8f0;
  --lang-btn-bg: #e2e8f0;
  --lang-btn-active: #ffffff;
  --lang-text-active: #2563eb;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #ffffff;
  --text-muted: #cbd5e1;
  --border-color: #334155;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --sub-bg: #0f172a;
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
  max-width: 1000px;
  margin: 0 auto;
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

.wo-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.wo-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 12px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.wo-code {
  font-family: monospace;
  font-weight: 800;
  font-size: 15px;
  color: var(--primary);
}

.company-badge {
  font-size: 11px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.status-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
}

.status-badge.assigned { background: #dbeafe; color: #1e40af; }
.status-badge.in_progress, .status-badge.pending { background: #fef3c7; color: #b45309; }
.status-badge.completed, .status-badge.done { background: #dcfce7; color: #15803d; }

.wo-body-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.location-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.location-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}

.maps-link {
  font-size: 13px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}

.maps-link:hover { text-decoration: underline; }

.wo-intro {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  background: var(--sub-bg);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  background-color: var(--sub-bg);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.meta-item { display: flex; flex-direction: column; }
.meta-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.meta-value { font-size: 12px; font-weight: 700; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; }

.wo-sub-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-block-title {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sub-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--sub-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 13px;
}

.item-main { display: flex; flex-direction: column; }
.item-name { font-weight: 700; color: var(--text-main); }
.item-subtext { font-size: 11px; color: var(--text-muted); }
.item-price { font-weight: 800; color: var(--primary); }

.no-data-text {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  padding: 6px 0;
}

.cost-summary-box {
  background: rgba(37, 99, 235, 0.04);
  border: 1px dashed var(--primary);
  padding: 14px 18px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
}

.grand-total-row {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border-color);
  font-weight: 800;
  color: var(--text-main);
  font-size: 15px;
}

.grand-total-val {
  color: #10b981;
}

.card-action-bar {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 4px;
}

.btn-doc {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: var(--sub-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-doc:hover { border-color: var(--primary); color: var(--primary); }

.btn-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--primary);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-detail:hover { background-color: var(--primary-hover); }

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
  min-height: 180px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-title { height: 24px; width: 40%; }
.skeleton-box { height: 50px; width: 100%; }

/* PDF OFFSCREEN CONTAINER STYLES */
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
  .card-action-bar { flex-direction: column; }
  .btn-doc, .btn-detail { width: 100%; justify-content: center; }
}
</style>
