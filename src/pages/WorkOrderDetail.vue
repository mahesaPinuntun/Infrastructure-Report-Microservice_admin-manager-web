<template>
  <div class="wo-detail-wrapper">
    <!-- Header Page Actions (Khusus Layar Web) -->
    <header class="header-container no-print">
      <div class="header-title text-left">
        <button @click="goBack" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{{ t('backToList') }}</span>
        </button>

        <div class="brand-badge mt-1">
          <div class="kanji-logo-badge">
            <span class="kanji-badge-text">築</span>
          </div>
          <span>Manager Field System</span>
        </div>
        <h1>{{ workOrder?.woCode || t('loadingTitle') }}</h1>
      </div>

      <!-- Controls & Download Button -->
      <div class="header-actions">
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
            :class="{ 'is-dark': activeTheme === 'dark' }"
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

    <!-- Loading Skeleton -->
    <div v-if="loading" class="detail-content-grid">
      <div class="detail-card skeleton-card">
        <div class="skeleton-block w-40 h-24 mb-2"></div>
        <div class="skeleton-block w-full h-12 mb-2"></div>
      </div>
      <div class="detail-card skeleton-card">
        <div class="skeleton-block w-full h-12 mb-2"></div>
        <div class="skeleton-block w-full h-32"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="empty-state">
      <h3>{{ t('notFoundTitle') }}</h3>
      <p>{{ errorMessage }}</p>
      <button @click="goBack" class="btn-primary mt-3">{{ t('backToList') }}</button>
    </div>

    <!-- Printable & Exportable Content Area -->
    <div v-else-if="workOrder" ref="pdfContentRef" class="pdf-printable-container">
      <!-- PDF Document Header (HANYA MUNCUL SAAT DOWNLOAD PDF / PRINT) -->
      <div class="pdf-doc-header">
        <div class="pdf-brand">
          <div class="kanji-logo-badge pdf-logo">
            <span class="kanji-badge-text">築</span>
          </div>
          <div class="pdf-brand-text text-left">
            <h2 class="pdf-brand-title">MANAGER FIELD SYSTEM</h2>
            <p class="pdf-brand-sub">Official Work Order Document Report</p>
          </div>
        </div>
        <div class="pdf-doc-meta text-right">
          <span class="pdf-code">{{ workOrder.woCode }}</span>
          <span class="pdf-date">Printed: {{ formatCurrentDate() }}</span>
        </div>
      </div>

      <div class="detail-content-grid">
        <!-- Job Status Bar -->
        <div class="detail-card status-banner-card avoid-break">
          <span class="info-label-bold text-left">{{ t('statusLabel') }}:</span>
          <span :class="['status-badge', getStatusBadge(workOrder.status).class]">
            {{ getStatusBadge(workOrder.status).label }}
          </span>
        </div>

        <!-- Location & Execution Date -->
        <div class="detail-card avoid-break">
          <div class="info-grid-2col">
            <div class="info-item text-left">
              <span class="info-label">{{ t('location') }}</span>
              <span class="info-value-bold">{{ workOrder.locationName || 'Lokasi Belum Ditentukan' }}</span>
            </div>
            <div class="info-item text-left">
              <span class="info-label">{{ t('executionDate') }}</span>
              <span class="info-value-bold">{{ formatDate(workOrder.executionDate) }}</span>
            </div>
          </div>

          <div v-if="workOrder.mapsUrl" class="mt-2 text-left no-print">
            <a :href="workOrder.mapsUrl" target="_blank" rel="noopener noreferrer" class="maps-link">
              📍 <span>{{ t('openMaps') }}</span>
            </a>
          </div>
        </div>

        <!-- Description / Introduction -->
        <div class="detail-card avoid-break">
          <span class="section-subheading text-left block mb-1">{{ t('description') }}</span>
          <div class="desc-box text-left">
            {{ workOrder.introduction || 'Tidak ada deskripsi penugasan.' }}
          </div>
        </div>

        <!-- Field Technicians -->
        <div class="detail-card avoid-break">
          <div class="section-bar-header text-left">
            <h3>{{ t('assignedTechs') }}</h3>
          </div>
          <div v-if="workOrder.technicians && workOrder.technicians.length > 0" class="tech-list">
            <div v-for="(tech, idx) in workOrder.technicians" :key="idx" class="tech-item-row">
              <div class="tech-info text-left">
                <strong class="block tech-name">{{ tech.name }}</strong>
                <span class="block tech-email">{{ tech.email || tech.phone || '-' }}</span>
              </div>
              <span class="tech-fee font-bold text-right">{{ formatCurrency(tech.fee) }}</span>
            </div>
          </div>
          <p v-else class="text-muted font-xs italic text-left py-1">{{ t('noTechs') }}</p>
        </div>

        <!-- Material & Cost Breakdown -->
        <div class="detail-card avoid-break">
          <div class="section-bar-header text-left">
            <h3>{{ t('resourcesTitle') }}</h3>
          </div>
          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th class="text-left">Item</th>
                  <th class="text-left">Qty</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!workOrder.resources || workOrder.resources.length === 0">
                  <td colspan="3" class="text-center text-muted font-xs py-2">{{ t('noResources') }}</td>
                </tr>
                <tr v-for="(item, idx) in workOrder.resources" :key="idx">
                  <td class="font-medium text-main text-left">{{ item.name }}</td>
                  <td class="text-left">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="text-right font-bold text-main">{{ formatCurrency(item.subtotal || (item.quantity * item.price)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Grand Total Row -->
          <div class="grand-total-row text-right">
            <span class="total-label">Grand Total:</span>
            <span class="total-amount">{{ formatCurrency(calculatedGrandTotal) }}</span>
          </div>
        </div>

        <!-- Proof Photos Grid -->
        <div class="detail-card avoid-break">
          <div class="section-bar-header text-left">
            <h3>📷 {{ t('proofPhotos') }} ({{ processedImages.length }})</h3>
          </div>
          <div v-if="processedImages.length > 0" class="image-grid avoid-break">
            <div 
              v-for="(imgUrl, idx) in processedImages" 
              :key="idx" 
              class="img-wrapper avoid-break"
            >
              <img 
                :src="imgUrl" 
                alt="Foto Bukti Perbaikan" 
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const workOrder = ref(null);
const loading = ref(true);
const isGeneratingPdf = ref(false);
const errorMessage = ref('');
const pdfContentRef = ref(null);
const processedImages = ref([]);

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
    statusLabel: 'Job Status',
    grandTotal: 'Grand Total',
    generalInfo: 'Informasi Umum',
    location: 'Repair Location',
    executionDate: 'Execution Date',
    openMaps: 'Buka Lokasi di Google Maps',
    description: 'Description / Introduction',
    assignedTechs: 'FIELD TECHNICIANS',
    noTechs: 'Belum ada teknisi yang dialokasikan.',
    resourcesTitle: 'MATERIAL & COST BREAKDOWN',
    noResources: 'Tidak ada item material dalam Work Order ini.',
    proofPhotos: 'PROOF PHOTOS',
    noPhotos: 'Belum ada foto bukti perbaikan yang diunggah oleh teknisi lapangan.'
  },
  en: {
    backToList: 'Back to Work Orders List',
    loadingTitle: 'Loading Work Order...',
    notFoundTitle: 'Work Order not found',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Generating PDF...',
    statusLabel: 'Job Status',
    grandTotal: 'Grand Total',
    generalInfo: 'General Information',
    location: 'Repair Location',
    executionDate: 'Execution Date',
    openMaps: 'Open Location in Google Maps',
    description: 'Description / Introduction',
    assignedTechs: 'FIELD TECHNICIANS',
    noTechs: 'No technicians assigned yet.',
    resourcesTitle: 'MATERIAL & COST BREAKDOWN',
    noResources: 'No material items in this Work Order.',
    proofPhotos: 'PROOF PHOTOS',
    noPhotos: 'No repair proof photos uploaded by field technicians yet.'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const calculatedGrandTotal = computed(() => {
  if (!workOrder.value) return 0;
  if (typeof workOrder.value.grandTotal === 'number' && workOrder.value.grandTotal > 0) {
    return workOrder.value.grandTotal;
  }
  const techTotal = (workOrder.value.technicians || []).reduce((s, t) => s + (Number(t.fee) || 0), 0);
  const resourceTotal = (workOrder.value.resources || []).reduce((s, r) => s + (Number(r.subtotal) || (Number(r.quantity || 1) * Number(r.price || 0))), 0);
  return techTotal + resourceTotal;
});

const resetScrollPosition = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.style.overflow = '';
    document.body.style.position = '';
  }
};

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

const convertUrlToBase64 = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return url;
  }
};

const prepareImages = async (imageList) => {
  if (!Array.isArray(imageList) || imageList.length === 0) {
    processedImages.value = [];
    return;
  }
  const converted = await Promise.all(imageList.map((url) => convertUrlToBase64(url)));
  processedImages.value = converted;
};

const fetchWorkOrderDetail = async () => {
  const woId = route.params.id;
  if (!woId) {
    errorMessage.value = 'ID Work Order tidak valid.';
    loading.value = false;
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.get(`${MANAGER_API_URL}/api/manager/work-orders/${woId}`);
    const resData = response.data?.data || response.data?.workOrder || response.data;
    if (resData && (resData._id || resData.id || resData.woCode)) {
      workOrder.value = resData;
      await prepareImages(resData.progressImages || []);
      loading.value = false;
      await nextTick();
      resetScrollPosition();
      return;
    }
  } catch (err) {
    console.warn('Direct WO detail fetch failed, trying list fallback...', err?.message);
  }

  try {
    const resList = await axios.get(`${MANAGER_API_URL}/api/manager/work-orders`);
    const listData = resList.data?.workOrders || resList.data?.data || resList.data || [];
    
    if (Array.isArray(listData) && listData.length > 0) {
      const found = listData.find(
        (item) => item._id === woId || item.id === woId || item.woCode === woId
      );

      if (found) {
        workOrder.value = found;
        await prepareImages(found.progressImages || []);
        loading.value = false;
        await nextTick();
        resetScrollPosition();
        return;
      }
    }
    errorMessage.value = 'Data Work Order tidak ditemukan di dalam sistem.';
  } catch (errFallback) {
    console.error('Error fetching fallback list:', errFallback);
    errorMessage.value = 'Gagal memuat rincian Work Order dari server.';
  } finally {
    loading.value = false;
  }
};

const downloadPDF = async () => {
  if (!pdfContentRef.value || isGeneratingPdf.value) return;

  const element = pdfContentRef.value;

  try {
    isGeneratingPdf.value = true;
    element.classList.add('is-exporting-pdf');

    let html2pdfModule;
    try {
      html2pdfModule = (await import('html2pdf.js')).default;
    } catch (e) {
      console.warn('html2pdf.js tidak terpasang, fallback window.print()');
    }

    if (html2pdfModule) {
      const opt = {
        margin: [6, 8, 6, 8],
        filename: `${workOrder.value?.woCode || 'WorkOrder'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          backgroundColor: '#ffffff',
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
    if (element) {
      element.classList.remove('is-exporting-pdf');
    }
    resetScrollPosition();
    isGeneratingPdf.value = false;
  }
};

const goBack = () => {
  router.push('/visit');
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED': return { label: 'Assigned', class: 'badge-blue' };
    case 'ACCEPTED': return { label: 'Accepted', class: 'badge-amber' };
    case 'IN_PROGRESS': return { label: 'In Progress', class: 'badge-cyan' };
    case 'COMPLETED': return { label: 'Completed', class: 'badge-completed' };
    default: return { label: status || 'Pending', class: 'badge-gray' };
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

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchWorkOrderDetail();
    }
  }
);

onMounted(() => {
  resetScrollPosition();
  initTheme();
  initLanguage();
  fetchWorkOrderDetail();
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

:global(html),
:global(body) {
  overflow-x: hidden;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.wo-detail-wrapper {
  min-height: 100vh;
  height: auto;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 20px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
  overflow-y: visible;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  width: 100%;
  flex-wrap: wrap;
  gap: 12px;
}

.header-title { text-align: left; }

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
  margin-bottom: 6px;
  transition: all 0.2s;
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
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}
.btn-download-pdf:hover:not(:disabled) {
  background-color: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}
.btn-download-pdf:disabled { opacity: 0.6; cursor: not-allowed; }

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.kanji-logo-badge {
  width: 22px;
  height: 22px;
  background-color: #2563eb;
  border-radius: 5px;
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
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
  text-align: left;
}

.header-actions { display: flex; align-items: center; gap: 12px; }

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

/* Area Utama Tampilan Web */
.pdf-printable-container {
  width: 100%;
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-sizing: border-box;
}

/* SEMBUNYIKAN HEADER DOKUMEN PDF DARI TAMPILAN LAYAR WEB */
.pdf-doc-header {
  display: none;
}

/* Grid Konten Web View */
.detail-content-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.detail-card {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}
.detail-card:last-child { border-bottom: none; }

.status-banner-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.section-subheading {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.section-bar-header {
  margin-bottom: 8px;
}
.section-bar-header h3 {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.info-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.info-item { display: flex; flex-direction: column; }
.info-label { font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 2px; }
.info-label-bold { font-size: 12px; font-weight: 700; color: var(--text-main); }
.info-value-bold { font-size: 13px; font-weight: 700; color: var(--text-main); }

.maps-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
}

.desc-box {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-main);
  white-space: pre-line;
  word-break: break-word;
}

.tech-list { display: flex; flex-direction: column; gap: 6px; }
.tech-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}
.tech-item-row:last-child { border-bottom: none; }
.tech-name { font-size: 12px; color: var(--text-main); }
.tech-email { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
.tech-fee { font-size: 12px; color: var(--text-main); }

.table-responsive { overflow-x: auto; width: 100%; }
.minimal-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.minimal-table th {
  padding: 6px 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}
.minimal-table td { padding: 8px 0; border-bottom: 1px solid var(--border-color); }

.grand-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  font-size: 13px;
}
.total-label { font-weight: 800; color: var(--text-main); }
.total-amount { font-weight: 800; color: var(--text-main); }

.image-grid { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 10px; 
  margin-top: 6px;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.img-wrapper { 
  aspect-ratio: 4 / 3; 
  border-radius: 6px; 
  overflow: hidden; 
  border: 1px solid var(--border-color); 
  background-color: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
.no-images-box { 
  padding: 10px; 
  background: var(--bg-main); 
  border-radius: 6px; 
  border: 1px solid var(--border-color); 
  color: var(--text-muted); 
  font-size: 11px; 
  font-style: italic; 
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
}
.badge-blue { background-color: rgba(37, 99, 235, 0.12); color: #2563eb; }
.badge-amber { background-color: rgba(217, 119, 6, 0.12); color: #d97706; }
.badge-cyan { background-color: rgba(6, 182, 212, 0.12); color: #0891b2; }
.badge-completed { background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
.badge-gray { background-color: rgba(148, 163, 184, 0.12); color: #64748b; }

.avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
.text-left { text-align: left !important; }
.text-right { text-align: right !important; }
.text-center { text-align: center !important; }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-xs { font-size: 10px; }
.text-main { color: var(--text-main); }
.text-muted { color: var(--text-muted); }
.block { display: block; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }

.empty-state { text-align: center; padding: 30px 16px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted); }
.btn-primary { background: var(--primary-color); color: #ffffff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }

.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.skeleton-card { display: flex; flex-direction: column; min-height: 100px; }
.skeleton-block { background: var(--border-color); border-radius: 6px; animation: pulse 1.5s infinite ease-in-out; }
.w-40 { width: 160px; } .w-full { width: 100%; } .h-12 { height: 24px; } .h-24 { height: 32px; } .h-32 { height: 120px; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }

/* KHUSUS DOKUMEN HASIL EKSPOR PDF & PRINT */
.pdf-printable-container.is-exporting-pdf {
  background-color: #ffffff !important;
  color: #0f172a !important;
  padding: 12px 16px !important;
  width: 100% !important;
  border: none !important;
}

.pdf-printable-container.is-exporting-pdf .pdf-doc-header {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e2e8f0 !important;
}

.pdf-brand { display: flex; align-items: center; gap: 10px; }
.pdf-logo { width: 30px; height: 30px; border-radius: 5px; background-color: #2563eb !important; }
.pdf-brand-title { font-size: 15px; font-weight: 800; margin: 0; color: #2563eb !important; letter-spacing: 0.5px; }
.pdf-brand-sub { font-size: 10px; color: #64748b !important; margin: 1px 0 0 0; }
.pdf-doc-meta { text-align: right; display: flex; flex-direction: column; }
.pdf-code { font-size: 14px; font-weight: 800; color: #0f172a !important; }
.pdf-date { font-size: 10px; color: #64748b !important; margin-top: 1px; }

.pdf-printable-container.is-exporting-pdf * {
  color: #0f172a !important;
  background-color: transparent !important;
  border-color: #e2e8f0 !important;
  text-shadow: none !important;
  box-shadow: none !important;
}

.pdf-printable-container.is-exporting-pdf .desc-box,
.pdf-printable-container.is-exporting-pdf .img-wrapper {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

@media print {
  .no-print { display: none !important; }
  .pdf-doc-header { display: flex !important; border-bottom: 1px solid #cbd5e1 !important; }
  .pdf-brand-title { color: #2563eb !important; }
  .wo-detail-wrapper { padding: 0 !important; background: #ffffff !important; color: #000000 !important; }
  .pdf-printable-container { border: none !important; padding: 0 !important; background: #ffffff !important; }
  .detail-card { border-bottom: 1px solid #cbd5e1 !important; }
  .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
  .image-grid { grid-template-columns: repeat(3, 1fr) !important; }
}
</style>
