<template>
  <div class="page-container">
    <!-- Header Navigation -->
    <header class="header-section">
      <div class="header-left">
        <button @click="goBack" class="btn-back" title="Kembali">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>{{ t('btnBack') }}</span>
        </button>
      </div>

      <div class="header-right-actions">
        <!-- Switch Language -->
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

        <!-- Switch Theme -->
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

    <!-- Feedback Alert -->
    <div v-if="feedbackMessage" :class="['feedback-alert', feedbackType]">
      {{ feedbackMessage }}
    </div>

    <!-- Centered Content Area -->
    <div class="centered-content-wrapper">
      <!-- SKELETON CHUNK LOADING -->
      <div v-if="loading" class="detail-card skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-badge"></div>
        </div>
        <div class="skeleton-grid">
          <div v-for="n in 3" :key="'sk-grid-' + n" class="skeleton-line skeleton-box"></div>
        </div>
        <div class="skeleton-line skeleton-desc"></div>
        <div class="skeleton-line skeleton-sub"></div>
        <div class="skeleton-line skeleton-sub"></div>
        <div class="skeleton-line skeleton-action"></div>
      </div>

      <!-- ERROR / EMPTY STATE -->
      <div v-else-if="!wo" class="state-card empty-state">
        <svg class="icon-lg text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="17"/>
        </svg>
        <p>{{ t('emptyMessage') }}</p>
        <button @click="fetchWorkOrderDetail" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <!-- WORK ORDER DETAIL CARD (CENTERED) -->
      <div v-else class="detail-card">
        <!-- Card Top -->
        <div class="card-header-section">
          <div class="title-meta">
            <span class="wo-code-badge">{{ wo.woCode || 'WO-UNTITLED' }}</span>
            <h2 class="wo-title">{{ wo.locationName || 'Lokasi Field Work Order' }}</h2>
            <span class="company-tag">{{ wo.companyName || 'Infrastructure_Report' }}</span>
          </div>
          <span :class="['status-badge', (wo.status || 'PENDING').toLowerCase()]">
            {{ wo.status || 'PENDING' }}
          </span>
        </div>

        <p v-if="wo.introduction" class="wo-intro">{{ wo.introduction }}</p>

        <!-- Meta Info Grid -->
        <div class="info-grid">
          <div class="info-item">
            <label>{{ t('labelWoId') }}</label>
            <p class="code-text">{{ wo._id || wo.id || route.params.id }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('labelExecDate') }}</label>
            <p>{{ formatDate(wo.executionDate) }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('labelCreatedBy') }}</label>
            <p>{{ wo.createdBy || '-' }} ({{ wo.createdByEmail || '-' }})</p>
          </div>
          <div class="info-item">
            <label>{{ t('labelCreatedDate') }}</label>
            <p>{{ formatDate(wo.createdAt) }}</p>
          </div>
        </div>

        <!-- Google Maps Link (If Available) -->
        <div v-if="wo.mapsUrl" class="section-box">
          <label>{{ t('labelMaps') }}</label>
          <a :href="wo.mapsUrl" target="_blank" rel="noopener noreferrer" class="maps-link">
            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Buka di Google Maps &rarr;</span>
          </a>
        </div>

        <!-- Technicians List -->
        <div class="section-box">
          <label>{{ t('labelTechnicians') }} ({{ wo.technicians?.length || 0 }})</label>
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

        <!-- Resources List -->
        <div v-if="wo.resources && wo.resources.length > 0" class="section-box">
          <label>{{ t('labelResources') }} ({{ wo.resources.length }})</label>
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

        <!-- Cost Breakdown Panel -->
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

        <!-- Proof Document (PDF) -->
        <div v-if="wo.proofDocumentUrl" class="section-box">
          <label>{{ t('labelDocument') }}</label>
          <button @click="downloadDocument(wo.proofDocumentUrl, wo.woCode)" class="doc-link-btn">
            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Unduh / Buka Dokumen Bukti WO (PDF)</span>
          </button>
        </div>

        <!-- Action Panel for Status Update (Tampil jika pengguna terautentikasi) -->
        <div v-if="isAuthenticated" class="action-panel">
          <h3>{{ t('panelTitle') }}</h3>
          <div class="action-form">
            <select v-model="selectedStatus" class="input-select">
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED / RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button @click="updateWoStatus" :disabled="updating" class="btn-primary">
              {{ updating ? t('btnSaving') : t('btnSave') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { adminApi, managerApi } from '../services/api';

const route = useRoute();
const router = useRouter();

const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const wo = ref(null);
const loading = ref(true);
const updating = ref(false);
const selectedStatus = ref('PENDING');

const feedbackMessage = ref('');
const feedbackType = ref('success');
const currentTheme = ref('light');
const currentLang = ref('id');

const translations = {
  id: {
    btnBack: 'Kembali',
    labelWoId: 'ID Work Order',
    labelExecDate: 'Tanggal Eksekusi',
    labelCreatedBy: 'Dibuat Oleh',
    labelCreatedDate: 'Tanggal Dibuat',
    labelMaps: 'Lokasi Google Maps',
    labelTechnicians: 'Teknisi Ditugaskan',
    labelResources: 'Material & Equipment',
    labelDocument: 'Dokumen Bukti Resmi',
    panelTitle: 'Update Status Work Order',
    btnSave: 'Simpan Status',
    btnSaving: 'Menyimpan...',
    btnRetry: 'Coba Lagi',
    emptyMessage: 'Detail Work Order tidak ditemukan atau gagal dimuat dari server.'
  },
  en: {
    btnBack: 'Back',
    labelWoId: 'Work Order ID',
    labelExecDate: 'Execution Date',
    labelCreatedBy: 'Created By',
    labelCreatedDate: 'Created Date',
    labelMaps: 'Google Maps Location',
    labelTechnicians: 'Assigned Technicians',
    labelResources: 'Material & Equipment',
    labelDocument: 'Official Proof Document',
    panelTitle: 'Update Work Order Status',
    btnSave: 'Save Status',
    btnSaving: 'Saving...',
    btnRetry: 'Try Again',
    emptyMessage: 'Work Order details not found or failed to load from server.'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const isAuthenticated = computed(() => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return !!token;
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/visit');
  }
};

const getUserRole = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const rawRole = (storedUser.role || '').toString().trim().toUpperCase();
  return rawRole.includes('MANAGER') ? 'MANAGER' : rawRole;
};

const getApiClient = () => {
  const role = getUserRole();
  return role === 'ADMIN' ? adminApi : managerApi;
};

const showFeedback = (msg, type = 'success') => {
  feedbackMessage.value = msg;
  feedbackType.value = type;
  setTimeout(() => {
    feedbackMessage.value = '';
  }, 4000);
};

// Mengunduh / membuka dokumen secara aman tanpa terhalang CORS & Auth
const downloadDocument = (fileUrl, fileNamePrefix = 'WO') => {
  if (!fileUrl) {
    showFeedback('URL dokumen tidak tersedia.', 'error');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', `${fileNamePrefix}_Bukti.pdf`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.warn('Fallback ke window.open:', err);
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }
};

// Fetch Work Order Detail (Mendukung Akses Publik & Terautentikasi)
const fetchWorkOrderDetail = async () => {
  const woId = route.params.id;
  if (!woId) return;

  loading.value = true;
  feedbackMessage.value = '';

  let foundWo = null;

  // 1. Coba via API Terautentikasi (jika pengguna sedang login)
  if (isAuthenticated.value) {
    const role = getUserRole();
    const api = getApiClient();
    const authEndpoints = role === 'ADMIN'
      ? [`/api/admin/work-orders/${woId}`, `/api/manager/work-orders/${woId}`, `/api/manager/work-orders`]
      : [`/api/manager/work-orders/${woId}`, `/api/admin/work-orders/${woId}`, `/api/manager/work-orders`];

    for (const endpoint of authEndpoints) {
      try {
        const res = await api.get(endpoint);
        let data = res?.data?.workOrder || res?.data?.data || res?.data?.workOrders || res?.data;

        if (Array.isArray(data)) {
          foundWo = data.find(item => (item._id || item.id || item.woCode) === woId);
        } else if (data && typeof data === 'object') {
          foundWo = data;
        }

        if (foundWo && (foundWo._id || foundWo.woCode || foundWo.id)) break;
      } catch {
        // Abaikan error dan coba endpoint berikutnya
      }
    }
  }

  // 2. Fallback: Panggilan Publik langsung via Axios (Tanpa Token)
  if (!foundWo) {
    try {
      const publicEndpoints = [
        `${MANAGER_SERVICE_URL}/api/manager/work-orders/${woId}`,
        `${MANAGER_SERVICE_URL}/api/manager/work-orders`
      ];

      for (const url of publicEndpoints) {
        try {
          const res = await axios.get(url);
          let data = res?.data?.workOrder || res?.data?.data || res?.data?.workOrders || res?.data;

          if (Array.isArray(data)) {
            foundWo = data.find(item => (item._id || item.id || item.woCode) === woId);
          } else if (data && typeof data === 'object') {
            foundWo = data;
          }

          if (foundWo && (foundWo._id || foundWo.woCode || foundWo.id)) break;
        } catch {
          // Lanjut ke endpoint publik berikutnya
        }
      }
    } catch (err) {
      console.error('Gagal memuat detail publik:', err);
    }
  }

  if (foundWo) {
    wo.value = foundWo;
    if (wo.value.status) {
      selectedStatus.value = wo.value.status.toString().toUpperCase();
    }
  } else {
    wo.value = null;
    showFeedback(t('emptyMessage'), 'error');
  }

  loading.value = false;
};

// Update Status Work Order (Memerlukan Login)
const updateWoStatus = async () => {
  if (!selectedStatus.value) return;
  updating.value = true;

  try {
    const role = getUserRole();
    const woId = route.params.id;
    const api = getApiClient();

    const endpoint = role === 'ADMIN'
      ? `/api/admin/work-orders/${woId}/status`
      : `/api/manager/work-orders/${woId}/status`;

    try {
      await api.patch(endpoint, { status: selectedStatus.value });
    } catch {
      await api.put(endpoint, { status: selectedStatus.value });
    }

    if (wo.value) {
      wo.value.status = selectedStatus.value;
    }

    showFeedback('Status Work Order berhasil diperbarui!', 'success');
  } catch (err) {
    console.error('Gagal memperbarui status WO:', err);
    showFeedback(err.response?.data?.error || 'Gagal memperbarui status Work Order.', 'error');
  } finally {
    updating.value = false;
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
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
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

watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchWorkOrderDetail();
  }
);

onMounted(() => {
  initTheme();
  initLanguage();
  fetchWorkOrderDetail();
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
  --box-bg: #f8fafc;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
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
  --box-bg: #0f172a;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 850px;
  margin-bottom: 24px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.centered-content-wrapper {
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feedback-alert {
  width: 100%;
  max-width: 850px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 700;
  box-sizing: border-box;
}

.feedback-alert.success { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.feedback-alert.error { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.detail-card {
  width: 100%;
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px solid var(--border-color);
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 16px;
  gap: 16px;
}

.title-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wo-code-badge {
  font-family: monospace;
  font-weight: 800;
  font-size: 14px;
  color: var(--primary-color);
}

.wo-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
}

.company-tag {
  font-size: 11px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  width: fit-content;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.assigned { background-color: #dbeafe; color: #1e40af; }
.status-badge.in_progress, .status-badge.pending { background-color: #fef3c7; color: #b45309; }
.status-badge.completed, .status-badge.done { background-color: #dcfce7; color: #15803d; }
.status-badge.rejected { background-color: #fee2e2; color: #b91c1c; }

.wo-intro {
  margin: 0;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.6;
  background-color: var(--box-bg);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  background-color: var(--box-bg);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.info-item label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
}

.info-item p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--text-main);
  font-weight: 700;
}

.code-text {
  font-family: monospace;
  color: var(--primary-color) !important;
}

.section-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-box label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 800;
  text-transform: uppercase;
}

.sub-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background-color: var(--box-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 13px;
}

.item-main { display: flex; flex-direction: column; }
.item-name { font-weight: 700; color: var(--text-main); }
.item-subtext { font-size: 11px; color: var(--text-muted); }
.item-price { font-weight: 800; color: var(--primary-color); }

.no-data-text { font-size: 12px; color: var(--text-muted); font-style: italic; }

.cost-summary-box {
  background: rgba(37, 99, 235, 0.04);
  border: 1px dashed var(--primary-color);
  padding: 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.cost-row { display: flex; justify-content: space-between; color: var(--text-muted); }
.grand-total-row {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  font-weight: 800;
  color: var(--text-main);
  font-size: 15px;
}
.grand-total-val { color: #10b981; }

.maps-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--box-bg);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  width: fit-content;
}

.doc-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--box-bg);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
}

.doc-link-btn:hover {
  background-color: var(--bg-card);
  border-color: var(--primary-color);
}

.maps-link:hover { text-decoration: underline; }

.action-panel {
  background: var(--box-bg);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.action-panel h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 800;
}

.action-form { display: flex; gap: 12px; flex-wrap: wrap; }

.input-select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  background-color: var(--bg-card);
  color: var(--text-main);
  outline: none;
  font-weight: 600;
  flex: 1;
  min-width: 200px;
}

.btn-primary {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* SKELETON */
.skeleton-card { min-height: 450px; animation: pulse 1.5s infinite ease-in-out; }
.skeleton-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.skeleton-line { background-color: var(--skeleton-bg); border-radius: 6px; }
.skeleton-title { height: 28px; width: 60%; }
.skeleton-badge { height: 24px; width: 20%; }
.skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
.skeleton-box { height: 50px; width: 100%; }
.skeleton-desc { height: 80px; width: 100%; margin-bottom: 16px; }
.skeleton-sub { height: 60px; width: 100%; margin-bottom: 12px; }
.skeleton-action { height: 70px; width: 100%; }

.state-card {
  width: 100%;
  text-align: center;
  padding: 48px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  color: var(--text-muted);
  box-sizing: border-box;
}

.btn-retry {
  margin-top: 14px;
  padding: 8px 18px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
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

.lang-option.active { color: var(--lang-text-active); }

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

.lang-toggle-switch.is-en .lang-slider { transform: translateX(32px); }

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

.theme-toggle-switch.is-dark .switch-handle { transform: translateX(28px); }

.switch-icon { width: 15px; height: 15px; color: var(--switch-icon-color); }
.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 14px; height: 14px; }
.icon-lg { width: 40px; height: 40px; margin-bottom: 10px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 600px) {
  .page-container { padding: 16px; }
  .detail-card { padding: 20px; }
  .action-form { flex-direction: column; }
  .btn-primary { width: 100%; }
}
</style>
