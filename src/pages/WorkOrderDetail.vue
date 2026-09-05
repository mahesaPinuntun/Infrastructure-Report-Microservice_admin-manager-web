<template>
  <div class="wo-detail-wrapper">
    <!-- Header Page Actions (Non-Printable Header) -->
    <header class="header-container no-print">
      <div class="header-title">
        <button @click="goBack" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{{ t('backToList') }}</span>
        </button>

        <div class="brand-badge mt-2">
          <div class="kanji-logo-badge">
            <span class="kanji-badge-text">築</span>
          </div>
          <span>Manager Field System</span>
        </div>
        <h1>{{ workOrder?.woCode || t('loadingTitle') }}</h1>
      </div>

      <!-- Controls & Download Button -->
      <div class="header-actions">
        <!-- Download PDF Button -->
        <button 
          @click="downloadPDF" 
          class="btn-download-pdf" 
          :disabled="loading || !workOrder || isGeneratingPdf"
          :title="t('downloadPdf')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spin-anim': isGeneratingPdf }">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>{{ isGeneratingPdf ? t('generatingPdf') : t('downloadPdf') }}</span>
        </button>

        <!-- Language Switcher -->
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

        <!-- Theme Switcher -->
        <div class="theme-switch-wrapper">
          <button 
            @click="toggleTheme" 
            class="theme-toggle-switch" 
            :class="{ 'is-dark': activeTheme === 'dark' }"
            :title="activeTheme === 'light' ? 'Dark Mode' : 'Light Mode'"
            aria-label="Toggle Theme"
          >
            <span class="switch-handle">
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
              <svg v-else class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="detail-card skeleton-card">
      <div class="skeleton-block w-40 h-24 mb-4"></div>
      <div class="skeleton-block w-full h-12 mb-3"></div>
      <div class="skeleton-block w-full h-12 mb-3"></div>
      <div class="skeleton-block w-full h-32"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="empty-state">
      <h3>{{ t('notFoundTitle') }}</h3>
      <p>{{ errorMessage }}</p>
      <button @click="goBack" class="btn-primary mt-3">{{ t('backToList') }}</button>
    </div>

    <!-- Printable Content Area -->
    <div v-else-if="workOrder" ref="pdfContentRef" class="pdf-printable-container">
      <!-- PDF Document Header (Tampil khusus dokumen/PDF) -->
      <div class="pdf-doc-header">
        <div class="pdf-brand">
          <div class="kanji-logo-badge pdf-logo">
            <span class="kanji-badge-text">築</span>
          </div>
          <div>
            <h2 class="pdf-brand-title">MANAGER FIELD SYSTEM</h2>
            <p class="pdf-brand-sub">Official Work Order Document Report</p>
          </div>
        </div>
        <div class="pdf-doc-meta">
          <span class="pdf-code">{{ workOrder.woCode }}</span>
          <span class="pdf-date">Printed: {{ formatCurrentDate() }}</span>
        </div>
      </div>

      <div class="detail-content-grid">
        <!-- Banner Status -->
        <div class="detail-card status-banner-card avoid-break">
          <div>
            <span class="text-sub font-xs uppercase block mb-1">{{ t('statusLabel') }}</span>
            <span :class="['status-badge', getStatusBadge(workOrder.status).class]">
              <span class="badge-dot"></span>
              {{ getStatusBadge(workOrder.status).label }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-sub font-xs uppercase block mb-1">{{ t('grandTotal') }}</span>
            <span class="font-bold text-indigo font-lg">{{ formatCurrency(workOrder.grandTotal) }}</span>
          </div>
        </div>

        <!-- Ringkasan Informasi & Pendahuluan (Align Left) -->
        <div class="detail-card avoid-break">
          <h3 class="card-title">📍 {{ t('generalInfo') }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ t('location') }}</span>
              <span class="info-value">{{ workOrder.locationName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('executionDate') }}</span>
              <span class="info-value">🗓️ {{ formatDate(workOrder.executionDate) }}</span>
            </div>
          </div>

          <!-- Section Pendahuluan / Deskripsi Tugas (Align Left) -->
          <div class="mt-4 intro-section">
            <span class="info-label text-left block mb-1">{{ t('description') }}</span>
            <div class="desc-box text-left">
              {{ workOrder.introduction || '-' }}
            </div>
          </div>
        </div>

        <!-- Daftar Teknisi -->
        <div class="detail-card avoid-break">
          <h3 class="card-title">👥 {{ t('assignedTechs') }}</h3>
          <div v-if="workOrder.technicians && workOrder.technicians.length > 0" class="tech-list">
            <div v-for="(tech, idx) in workOrder.technicians" :key="idx" class="tech-item-row">
              <div class="tech-info">
                <div class="avatar-circle">{{ tech.name?.charAt(0).toUpperCase() }}</div>
                <div class="text-left">
                  <strong>{{ tech.name }}</strong>
                  <span class="block text-sub font-xs">{{ tech.email || tech.phone || '-' }}</span>
                </div>
              </div>
              <span class="tech-fee font-bold text-main">{{ formatCurrency(tech.fee) }}</span>
            </div>
          </div>
          <p v-else class="text-muted font-xs italic text-left">{{ t('noTechs') }}</p>
        </div>

        <!-- Tabel Rincian Material & Biaya -->
        <div class="detail-card avoid-break">
          <h3 class="card-title">📦 {{ t('resourcesTitle') }}</h3>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th class="text-left">Item / Material</th>
                  <th class="text-left">Quantity</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!workOrder.resources || workOrder.resources.length === 0">
                  <td colspan="3" class="text-center text-muted font-xs py-3">{{ t('noResources') }}</td>
                </tr>
                <tr v-for="(item, idx) in workOrder.resources" :key="idx">
                  <td class="font-medium text-main text-left">{{ item.name }}</td>
                  <td class="text-left">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="text-right font-bold text-main">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Galeri Foto Bukti Perbaikan (Display Gambar Rapi) -->
        <div class="detail-card avoid-break">
          <h3 class="card-title">📷 {{ t('proofPhotos') }} ({{ workOrder.progressImages?.length || 0 }})</h3>
          <div v-if="workOrder.progressImages && workOrder.progressImages.length > 0" class="image-grid">
            <div 
              v-for="(imgUrl, idx) in workOrder.progressImages" 
              :key="idx" 
              class="img-wrapper"
            >
              <img 
                :src="imgUrl" 
                alt="Foto Bukti Perbaikan" 
                crossorigin="anonymous" 
                loading="eager"
              />
            </div>
          </div>
          <div v-else class="no-images-box text-left">
            {{ t('noPhotos') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const workOrder = ref(null);
const loading = ref(true);
const isGeneratingPdf = ref(false);
const errorMessage = ref('');
const pdfContentRef = ref(null);

const activeTheme = ref('light');
const currentLang = ref('id');

const MANAGER_API_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const translations = {
  id: {
    backToList: 'Kembali ke Daftar Work Order',
    loadingTitle: 'Memuat Work Order...',
    notFoundTitle: 'Work Order tidak ditemukan',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Proses PDF...',
    statusLabel: 'Status Pekerjaan',
    grandTotal: 'Grand Total Biaya',
    generalInfo: 'Informasi Umum',
    location: 'Lokasi Perbaikan',
    executionDate: 'Tanggal Eksekusi',
    description: 'Pendahuluan / Catatan Tugas',
    assignedTechs: 'Teknisi Ditugaskan',
    noTechs: 'Belum ada teknisi yang dialokasikan.',
    resourcesTitle: 'Rincian Material & Biaya',
    noResources: 'Tidak ada item material dalam Work Order ini.',
    proofPhotos: 'Foto Bukti Perbaikan',
    noPhotos: 'Belum ada foto bukti perbaikan yang diunggah oleh teknisi lapangan.'
  },
  en: {
    backToList: 'Back to Work Orders List',
    loadingTitle: 'Loading Work Order...',
    notFoundTitle: 'Work Order not found',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Generating PDF...',
    statusLabel: 'Job Status',
    grandTotal: 'Grand Total Cost',
    generalInfo: 'General Information',
    location: 'Repair Location',
    executionDate: 'Execution Date',
    description: 'Introduction / Task Notes',
    assignedTechs: 'Assigned Technicians',
    noTechs: 'No technicians assigned yet.',
    resourcesTitle: 'Materials & Cost Breakdown',
    noResources: 'No material items in this Work Order.',
    proofPhotos: 'Proof Photos',
    noPhotos: 'No repair proof photos uploaded by field technicians yet.'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const initLanguage = () => {
  currentLang.value = localStorage.getItem('user-lang') || 'id';
};

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'id' ? 'en' : 'id';
  localStorage.setItem('user-lang', currentLang.value);
};

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

const fetchWorkOrderDetail = async () => {
  const woId = route.params.id;
  if (!woId) {
    errorMessage.value = 'ID Work Order tidak valid.';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const response = await axios.get(`${MANAGER_API_URL}/api/manager/work-orders/${woId}`);
    workOrder.value = response.data?.data || response.data?.workOrder || response.data;
  } catch (err) {
    console.error('Error fetching WO detail:', err);
    errorMessage.value = 'Gagal memuat rincian Work Order dari server.';
  } finally {
    loading.value = false;
  }
};

// DOWNLOAD PDF FUNCTION
const downloadPDF = async () => {
  if (!pdfContentRef.value || isGeneratingPdf.value) return;

  try {
    isGeneratingPdf.value = true;

    // Memuat pustaka html2pdf secara dinamis
    let html2pdfModule;
    try {
      html2pdfModule = (await import('html2pdf.js')).default;
    } catch (e) {
      console.warn('html2pdf.js belum terpasang via npm, menggunakan pemanggil window.print()');
    }

    if (html2pdfModule) {
      const element = pdfContentRef.value;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `WO_${workOrder.value?.woCode || 'Detail'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          logging: false 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdfModule().set(opt).from(element).save();
    } else {
      window.print();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    window.print();
  } finally {
    isGeneratingPdf.value = false;
  }
};

const goBack = () => {
  router.push('/work-orders');
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED': return { label: 'Assigned', class: 'badge-blue' };
    case 'ACCEPTED': return { label: 'Accepted', class: 'badge-amber' };
    case 'IN_PROGRESS': return { label: 'In Progress', class: 'badge-cyan' };
    case 'COMPLETED': return { label: 'Completed', class: 'badge-green' };
    default: return { label: status || 'Unknown', class: 'badge-gray' };
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
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

const formatCurrentDate = () => {
  const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
  return new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  initTheme();
  initLanguage();
  fetchWorkOrderDetail();
});
</script>

<style scoped>
/* Base Variables */
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
  --lang-btn-bg: #334155;
  --lang-btn-active: #1e293b;
  --lang-text-active: #3b82f6;
}

.wo-detail-wrapper {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Header Container */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
  transition: border-color 0.2s, color 0.2s;
}
.btn-back:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-download-pdf {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-download-pdf:hover:not(:disabled) {
  background-color: var(--primary-hover);
}
.btn-download-pdf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  margin-bottom: 4px;
}

.kanji-logo-badge {
  width: 22px;
  height: 22px;
  background-color: var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kanji-badge-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
}

.header-actions { display: flex; align-items: center; gap: 12px; }

/* Language & Theme Switcher */
.lang-switch-wrapper, .theme-switch-wrapper { display: flex; align-items: center; }

.lang-toggle-switch {
  position: relative; width: 68px; height: 32px;
  background-color: var(--lang-btn-bg); border-radius: 50px;
  border: 1px solid var(--border-color); padding: 3px; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between;
}
.lang-option { position: relative; z-index: 2; font-size: 11px; font-weight: 800; width: 28px; text-align: center; color: var(--text-muted); }
.lang-option.active { color: var(--lang-text-active); }
.lang-slider {
  position: absolute; top: 3px; left: 3px; width: 28px; height: 24px;
  background-color: var(--lang-btn-active); border-radius: 50px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 1;
}
.lang-toggle-switch.is-en .lang-slider { transform: translateX(32px); }

.theme-toggle-switch {
  position: relative; width: 60px; height: 32px;
  background-color: var(--switch-bg); border-radius: 50px; border: none;
  padding: 3px; cursor: pointer; display: flex; align-items: center;
}
.switch-handle {
  width: 26px; height: 26px; background-color: var(--switch-handle-bg);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translateX(0);
}
.theme-toggle-switch.is-dark .switch-handle { transform: translateX(28px); }
.switch-icon { width: 15px; height: 15px; color: var(--switch-icon-color); }

/* Printable Container & PDF Document Header */
.pdf-printable-container {
  width: 100%;
}

.pdf-doc-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--border-color);
}

.pdf-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pdf-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.pdf-brand-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}

.pdf-brand-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin: 2px 0 0 0;
}

.pdf-doc-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.pdf-code {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
}

.pdf-date {
  font-size: 11px;
  color: var(--text-muted);
}

/* Detail Cards Grid */
.detail-content-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.status-banner-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--text-main);
  text-align: left;
}

/* Info Grid & Pendahuluan (Align Left) */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.info-item { display: flex; flex-direction: column; text-align: left; }
.info-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
.info-value { font-size: 14px; font-weight: 600; color: var(--text-main); text-align: left; }

.intro-section {
  text-align: left;
}

.desc-box {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-main);
  text-align: left;
  white-space: pre-line;
  word-break: break-word;
}

/* Tech List */
.tech-list { display: flex; flex-direction: column; gap: 8px; }
.tech-item-row {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg-main); border: 1px solid var(--border-color);
  padding: 10px 14px; border-radius: 8px;
}
.tech-info { display: flex; align-items: center; gap: 10px; }
.avatar-circle {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--primary-color); color: #ffffff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; flex-shrink: 0;
}

/* Minimal Table */
.table-responsive { overflow-x: auto; width: 100%; }
.minimal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.minimal-table th { background: var(--bg-main); padding: 10px 12px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
.minimal-table td { padding: 12px; border-bottom: 1px solid var(--border-color); }

/* Images Grid (Display Gambar Rapi) */
.image-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); 
  gap: 12px; 
}
.img-wrapper { 
  aspect-ratio: 1; 
  border-radius: 8px; 
  overflow: hidden; 
  border: 1px solid var(--border-color); 
  background-color: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-wrapper img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block;
}
.no-images-box { 
  text-align: left; 
  padding: 16px; 
  background: var(--bg-main); 
  border-radius: 8px; 
  border: 1px solid var(--border-color); 
  color: var(--text-muted); 
  font-size: 13px; 
  font-style: italic; 
}

/* Status Badges */
.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; }
.badge-blue { background-color: rgba(37, 99, 235, 0.12); color: #2563eb; border-color: rgba(37, 99, 235, 0.25); }
.badge-amber { background-color: rgba(217, 119, 6, 0.12); color: #d97706; border-color: rgba(217, 119, 6, 0.25); }
.badge-cyan { background-color: rgba(6, 182, 212, 0.12); color: #0891b2; border-color: rgba(6, 182, 212, 0.25); }
.badge-green { background-color: rgba(16, 185, 129, 0.12); color: #10b981; border-color: rgba(16, 185, 129, 0.25); }
.badge-gray { background-color: rgba(148, 163, 184, 0.12); color: #64748b; border-color: rgba(148, 163, 184, 0.25); }

/* Align Helper Classes */
.text-left { text-align: left !important; }
.text-right { text-align: right !important; }
.text-center { text-align: center !important; }

/* Utility */
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-xs { font-size: 11px; }
.font-lg { font-size: 18px; }
.text-main { color: var(--text-main); }
.text-sub { color: var(--text-muted); }
.text-muted { color: var(--text-muted); }
.text-indigo { color: var(--primary-color); }
.uppercase { text-transform: uppercase; }
.block { display: block; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-1 { margin-bottom: 4px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.empty-state { text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted); }
.btn-primary { background: var(--primary-color); color: #ffffff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* Spin Animation */
.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Skeleton */
.skeleton-card { height: 300px; display: flex; flex-direction: column; }
.skeleton-block { background: var(--border-color); border-radius: 6px; animation: pulse 1.5s infinite ease-in-out; }
.w-40 { width: 160px; } .w-full { width: 100%; } .h-12 { height: 24px; } .h-24 { height: 32px; } .h-32 { height: 120px; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }

/* =========================================================================
   MEDIA PRINT STYLES (Optimisasi Cetak & PDF Output)
   ========================================================================= */
@media print {
  .no-print {
    display: none !important;
  }
  .pdf-doc-header {
    display: flex !important;
  }
  .wo-detail-wrapper {
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
  }
  .detail-card {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    background: #ffffff !important;
  }
  .avoid-break {
    page-break-inside: avoid !important;
  }
  .image-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
</style>
