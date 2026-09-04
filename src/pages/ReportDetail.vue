<template>
  <div class="page-container">
    <header class="header-section">
      <div class="header-left">
        <button @click="goBack" class="btn-back" title="Kembali ke Daftar">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>{{ t('btnBack') }}</span>
        </button>
      </div>

      <div class="header-right-actions">
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

    <div v-if="feedbackMessage" :class="['feedback-alert', feedbackType]">
      {{ feedbackMessage }}
    </div>

    <div class="centered-content-wrapper">
      <div v-if="loading" class="detail-card skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-badge"></div>
        </div>
        <div class="skeleton-grid">
          <div v-for="n in 4" :key="'sk-grid-' + n" class="skeleton-line skeleton-box"></div>
        </div>
        <div class="skeleton-line skeleton-desc"></div>
        <div class="skeleton-line skeleton-image"></div>
        <div class="skeleton-line skeleton-action"></div>
      </div>

      <div v-else-if="!report" class="state-card empty-state">
        <svg class="icon-lg text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="17"/>
        </svg>
        <p>{{ t('emptyMessage') }}</p>
        <button @click="fetchReportDetail" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <div v-else class="detail-card">
        <div class="card-header-section">
          <div class="title-meta">
            <h2 class="report-title">{{ report.title || report.woCode || report.locationName || t('defaultTitle') }}</h2>
            <span class="category-tag">{{ report.category || report.companyName || 'Infrastructure_Report' }}</span>
          </div>
          <span :class="['status-badge', (report.status || 'PENDING').toLowerCase()]">
            {{ report.status || 'PENDING' }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>{{ t('labelReportId') }}</label>
            <p class="code-text">{{ report._id || report.id || report.woCode || route.params.id }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('labelReporter') }}</label>
            <p>{{ report.reporterName || report.createdBy || report.userName || report.userEmail || 'Anonim' }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('labelLocation') }}</label>
            <p>{{ report.location || report.locationName || 'Tidak dicantumkan' }}</p>
          </div>
          <div class="info-item">
            <label>{{ t('labelDate') }}</label>
            <p>{{ formatDate(report.createdAt || report.executionDate) }}</p>
          </div>
        </div>

        <div class="description-box">
          <label>{{ t('labelDescription') }}</label>
          <p>{{ report.description || report.introduction || report.details || 'Tidak ada deskripsi rinci.' }}</p>
        </div>

        <div v-if="imageUrl" class="image-box">
          <label>{{ t('labelEvidence') }}</label>
          <img :src="imageUrl" alt="Bukti Laporan" class="report-image" @error="handleImageError" />
        </div>

        <div v-if="report.proofDocumentUrl" class="document-box">
          <label>{{ t('labelDocument') }}</label>
          <a :href="report.proofDocumentUrl" target="_blank" class="doc-link">
            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Buka Dokumen Bukti Penugasan (PDF)</span>
          </a>
        </div>

        <div class="action-panel">
          <h3>{{ t('panelTitle') }}</h3>
          <div class="action-form">
            <select v-model="selectedStatus" class="input-select">
              <option value="PENDING">PENDING</option>

              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED / COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button @click="updateReportStatus" :disabled="updating" class="btn-primary">
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
import { adminApi, managerApi } from '../services/api';

const route = useRoute();
const router = useRouter();

const report = ref(null);
const loading = ref(true);
const updating = ref(false);
const selectedStatus = ref('PENDING');

const feedbackMessage = ref('');
const feedbackType = ref('success');
const currentTheme = ref('light');
const currentLang = ref('id');

const translations = {
  id: {
    btnBack: 'Kembali ke Daftar',
    defaultTitle: 'Detail Laporan Infrastruktur',
    labelReportId: 'ID Laporan / WO',
    labelReporter: 'Pelapor / Pembuat',
    labelLocation: 'Lokasi Field',
    labelDate: 'Tanggal Dibuat / Eksekusi',
    labelDescription: 'Deskripsi / Detail Penugasan',
    labelEvidence: 'Foto Bukti Kerusakan',
    labelDocument: 'Dokumen Resmi Penugasan',
    panelTitle: 'Update Status Laporan / Work Order',
    btnSave: 'Simpan Perubahan',
    btnSaving: 'Menyimpan...',
    btnRetry: 'Coba Lagi',
    emptyMessage: 'Laporan tidak ditemukan atau gagal dimuat dari server.'
  },
  en: {
    btnBack: 'Back to List',
    defaultTitle: 'Infrastructure Report Details',
    labelReportId: 'Report / WO ID',
    labelReporter: 'Reporter / Created By',
    labelLocation: 'Field Location',
    labelDate: 'Created / Execution Date',
    labelDescription: 'Description / Task Details',
    labelEvidence: 'Evidence Photo',
    labelDocument: 'Official Assignment Document',
    panelTitle: 'Update Report / Work Order Status',
    btnSave: 'Save Changes',
    btnSaving: 'Saving...',
    btnRetry: 'Try Again',
    emptyMessage: 'Report not found or failed to load from server.'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/reports');
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

const imageUrl = computed(() => {
  if (!report.value) return '';
  return report.value.imageUrl || report.value.image || report.value.photoUrl || report.value.evidenceUrl || '';
});

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

const showFeedback = (msg, type = 'success') => {
  feedbackMessage.value = msg;
  feedbackType.value = type;
  setTimeout(() => {
    feedbackMessage.value = '';
  }, 4000);
};

// Fetch Report Detail dengan Fallback Mechanism
const fetchReportDetail = async () => {
  const reportId = route.params.id;
  if (!reportId) return;

  loading.value = true;
  feedbackMessage.value = '';

  try {
    const role = getUserRole();
    const primaryApi = getApiClient();
    const primaryEndpoint = role === 'ADMIN' 
      ? `/api/admin/reports/${reportId}` 
      : `/api/manager/reports/${reportId}`;

    let res;
    try {
      res = await primaryApi.get(primaryEndpoint);
    } catch (primaryErr) {
      console.warn('Gagal memuat lewat API utama, mencoba endpoint alternatif...', primaryErr);
      const fallbackApi = role === 'ADMIN' ? managerApi : adminApi;
      const fallbackEndpoint = role === 'ADMIN' 
        ? `/api/manager/reports/${reportId}` 
        : `/api/admin/reports/${reportId}`;

      res = await fallbackApi.get(fallbackEndpoint);
    }

    const rawData = res?.data?.report || res?.data?.data || res?.data?.workOrder || res?.data;

    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Data laporan tidak valid.');
    }

    report.value = rawData;

    if (report.value?.status) {
      selectedStatus.value = report.value.status.toString().toUpperCase();
    }
  } catch (err) {
    console.error('Gagal mengambil detail laporan:', err);
    report.value = null;
    showFeedback(
      err.response?.data?.error || err.response?.data?.message || t('emptyMessage'),
      'error'
    );
  } finally {
    loading.value = false;
  }
};

const updateReportStatus = async () => {
  if (!selectedStatus.value) return;
  updating.value = true;

  try {
    const role = getUserRole();
    const reportId = route.params.id;
    const primaryApi = getApiClient();

    const primaryEndpoint = role === 'ADMIN'
      ? `/api/admin/reports/${reportId}/status`
      : `/api/manager/reports/${reportId}/status`;

    try {
      await primaryApi.patch(primaryEndpoint, { status: selectedStatus.value });
    } catch (patchErr) {
      await primaryApi.put(primaryEndpoint, { status: selectedStatus.value });
    }

    if (report.value) {
      report.value.status = selectedStatus.value;
    }

    showFeedback('Status laporan berhasil diperbarui!', 'success');
  } catch (err) {
    console.error('Gagal memperbarui status:', err);
    showFeedback(
      err.response?.data?.error || err.response?.data?.message || 'Gagal memperbarui status.',
      'error'
    );
  } finally {
    updating.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Language & Theme Handlers
const initLanguage = () => {
  currentLang.value = localStorage.getItem('user-lang') || 'id';
};

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'id' ? 'en' : 'id';
  localStorage.setItem('user-lang', currentLang.value);
};

const applyThemeToDOM = (theme) => {
  document.documentElement.
