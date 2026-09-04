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
    if (newId) fetchReportDetail();
  }
);

onMounted(() => {
  initTheme();
  initLanguage();
  fetchReportDetail();
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

/* WADAH UTAMA PRESISI DI TENGAH LAYAR */
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

.feedback-alert.success {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.feedback-alert.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.detail-card {
  width: 100%;
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px solid var(--border-color);
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  gap: 16px;
}

.report-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.3;
}

.category-tag {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 700;
  display: inline-block;
  margin-top: 6px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.pending { background-color: #fef3c7; color: #b45309; }
.status-badge.assigned, .status-badge.in_progress { background-color: #dbeafe; color: #1e40af; }
.status-badge.resolved, .status-badge.completed { background-color: #dcfce7; color: #15803d; }
.status-badge.rejected { background-color: #fee2e2; color: #b91c1c; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  background-color: var(--box-bg);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.info-item label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
}

.info-item p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 700;
}

.code-text {
  font-family: monospace;
  color: var(--primary-color) !important;
}

.description-box, .image-box, .document-box {
  margin-bottom: 20px;
}

.description-box label, .image-box label, .document-box label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  display: block;
  margin-bottom: 6px;
}

.description-box p {
  background: var(--box-bg);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  margin: 0;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.6;
}

.report-image {
  max-width: 100%;
  max-height: 420px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  object-fit: cover;
}

.doc-link {
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
}

.doc-link:hover {
  text-decoration: underline;
}

.action-panel {
  background: var(--box-bg);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.action-panel h3 {
  margin: 0 0 14px 0;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 800;
}

.action-form {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

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
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* CHUNK SKELETON ANIMATION */
.skeleton-card {
  min-height: 400px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 6px;
}

.skeleton-title { height: 28px; width: 60%; }
.skeleton-badge { height: 24px; width: 20%; }
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.skeleton-box { height: 60px; width: 100%; }
.skeleton-desc { height: 100px; width: 100%; margin-bottom: 20px; }
.skeleton-image { height: 200px; width: 100%; margin-bottom: 20px; }
.skeleton-action { height: 80px; width: 100%; }

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

/* SWITCHERS STYLES */
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
