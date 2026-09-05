<template>
  <div class="page-container">
    <!-- Header Section -->
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

    <!-- Main Content -->
    <main class="main-content">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="wo-vertical-list">
        <div v-for="n in 4" :key="'skeleton-' + n" class="wo-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-box"></div>
        </div>
      </div>

      <!-- State Card: Error -->
      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchWorkOrders" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <!-- State Card: Empty -->
      <div v-else-if="workOrders.length === 0" class="state-card empty">
        <p>{{ t('emptyData') }}</p>
      </div>

      <!-- List Work Orders -->
      <div v-else class="wo-vertical-list">
        <article v-for="wo in workOrders" :key="wo._id || wo.id || wo.woCode" class="wo-card">
          <div class="wo-simple-info">
            <div class="location-info">
              <h3 class="location-title">
                <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ wo.locationName || 'Lokasi Belum Ditentukan' }}</span>
              </h3>
              <span :class="['status-badge', getStatusBadge(wo.status).class]">
                <span class="badge-dot"></span>
                {{ getStatusBadge(wo.status).label }}
              </span>
            </div>

            <div class="meta-row">
              <div class="exec-date-badge">
                <span class="meta-label">{{ t('colExecDate') }}:</span>
                <strong class="meta-value">{{ formatDate(wo.executionDate) }}</strong>
              </div>
              <div class="code-badge">
                <span class="meta-label">Kode WO:</span>
                <span class="font-bold">{{ wo.woCode || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="card-action-bar">
            <button 
              @click="generateAndDownloadPDF(wo)" 
              class="btn-doc" 
              :disabled="generatingPdfId === (wo._id || wo.id)"
            >
              <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-anim': generatingPdfId === (wo._id || wo.id) }">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>{{ generatingPdfId === (wo._id || wo.id) ? 'Proses...' : t('btnDocument') }}</span>
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

    <!-- Offscreen Container untuk Render PDF -->
    <div class="pdf-offscreen-container">
      <div v-if="activePdfItem" id="dynamic-pdf-area-visit" class="pdf-document">
        <div class="pdf-header">
          <h2>SURAT TUGAS WORK ORDER</h2>
          <h3>{{ activePdfItem.companyName || 'Infrastructure_Report' }}</h3>
          <p><strong>Kode WO:</strong> {{ activePdfItem.woCode }}</p>
        </div>
        <hr class="pdf-divider" />
        <div class="pdf-meta">
          <div>
            <strong>Penerbit:</strong> {{ activePdfItem.createdBy || 'Manager Field System' }}
            <span v-if="activePdfItem.createdByEmail"> ({{ activePdfItem.createdByEmail }})</span>
          </div>
          <div>
            <strong>Tanggal Pelaksanaan:</strong> {{ formatDate(activePdfItem.executionDate || activePdfItem.createdAt) }}
          </div>
        </div>

        <div class="pdf-section">
          <h4>1. Pendahuluan & Deskripsi Tugas</h4>
          <p class="pdf-desc">{{ activePdfItem.introduction || '-' }}</p>
        </div>

        <div class="pdf-section">
          <h4>2. Lokasi Perbaikan</h4>
          <p><strong>Nama Tempat:</strong> {{ activePdfItem.locationName || '-' }}</p>
          <p v-if="activePdfItem.mapsUrl"><strong>Google Maps:</strong> {{ activePdfItem.mapsUrl }}</p>
        </div>

        <div class="pdf-section">
          <h4>3. Daftar Teknisi</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Nama Teknisi</th>
                <th>Email / Kontak</th>
                <th class="text-right">Biaya / Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tItem, idx) in (activePdfItem.technicians || [])" :key="idx">
                <td>{{ tItem.name }}</td>
                <td>{{ tItem.email || tItem.phone || '-' }}</td>
                <td class="text-right">{{ formatCurrency(tItem.fee) }}</td>
              </tr>
              <tr v-if="!activePdfItem.technicians || activePdfItem.technicians.length === 0">
                <td colspan="3" class="text-center italic">Belum ada teknisi ditugaskan.</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Fee Teknisi: <strong>{{ formatCurrency(getTechTotal(activePdfItem)) }}</strong></p>
        </div>

        <div class="pdf-section">
          <h4>4. Daftar Material & Resource</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Nama Material</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in (activePdfItem.resources || [])" :key="idx">
                <td>{{ r.name }}</td>
                <td>{{ r.quantity }}</td>
                <td>{{ r.unit }}</td>
                <td class="text-right">{{ formatCurrency(r.price) }}</td>
                <td class="text-right">{{ formatCurrency(r.subtotal || (r.quantity * r.price)) }}</td>
              </tr>
              <tr v-if="!activePdfItem.resources || activePdfItem.resources.length === 0">
                <td colspan="5" class="text-center italic">Tidak ada rincian material.</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Material: <strong>{{ formatCurrency(getResourceTotal(activePdfItem)) }}</strong></p>
        </div>

        <div class="pdf-footer-summary">
          GRAND TOTAL BIAYA: {{ formatCurrency(getGrandTotal(activePdfItem)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const workOrders = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const activePdfItem = ref(null);
const generatingPdfId = ref(null);
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
    btnDocument: 'Proof Document (PDF)',
    btnViewDetail: 'View Detail'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const goToHome = () => router.push('/');
const goToWorkflow = () => router.push('/workflow');

const navigateToDetail = (wo) => {
  const targetId = wo._id || wo.id;
  if (targetId) {
    router.push(`/work-orders/${targetId}`);
  }
};

const getTechTotal = (wo) => {
  if (!wo || !wo.technicians) return 0;
  return wo.technicians.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);
};

const getResourceTotal = (wo) => {
  if (!wo || !wo.resources) return 0;
  return wo.resources.reduce((sum, r) => sum + (Number(r.subtotal) || (Number(r.quantity || 1) * Number(r.price || 0))), 0);
};

const getGrandTotal = (wo) => {
  if (!wo) return 0;
  if (typeof wo.grandTotal === 'number' && wo.grandTotal > 0) return wo.grandTotal;
  return getTechTotal(wo) + getResourceTotal(wo);
};

const generateAndDownloadPDF = async (item) => {
  const itemId = item._id || item.id;
  generatingPdfId.value = itemId;
  activePdfItem.value = item;
  await nextTick();

  const element = document.getElementById('dynamic-pdf-area-visit');
  if (!element) {
    generatingPdfId.value = null;
    return;
  }

  const pdfName = `WorkOrder_${item.woCode || itemId}.pdf`;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: pdfName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    let html2pdfModule;
    try {
      html2pdfModule = (await import('html2pdf.js')).default;
    } catch (e) {
      console.warn('html2pdf.js tidak dapat diimpor, fallback print.');
    }

    if (html2pdfModule) {
      await html2pdfModule().set(opt).from(element).save();
    } else {
      window.print();
    }
  } catch (error) {
    console.error('Gagal merender PDF:', error);
  } finally {
    activePdfItem.value = null;
    generatingPdfId.value = null;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED': return { label: 'Assigned', class: 'badge-blue' };
    case 'ACCEPTED': return { label: 'Accepted', class: 'badge-amber' };
    case 'IN_PROGRESS': return { label: 'In Progress', class: 'badge-cyan' };
    case 'COMPLETED': return { label: 'Completed', class: 'badge-green' };
    default: return { label: status || 'Pending', class: 'badge-gray' };
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

.page-container {
  width: 100%;
  max-width: 960px;
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
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-flow-featured:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 22px rgba(16, 185, 129, 0.7);
}

.header-content h1.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
  text-align: left;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: left;
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
.icon-md { width: 18px; height: 18px; }
.icon-xs { width: 14px; height: 14px; }

.main-content { width: 100%; }

.wo-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.wo-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  flex-wrap: wrap;
}

.wo-simple-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.exec-date-badge, .code-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
}

.meta-value {
  color: var(--primary);
  font-weight: 800;
}

.card-action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-doc {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background-color: var(--sub-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-doc:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn-doc:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 18px;
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

/* Status Badges */
.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; }
.badge-blue { background-color: rgba(37, 99, 235, 0.12); color: #2563eb; }
.badge-amber { background-color: rgba(217, 119, 6, 0.12); color: #d97706; }
.badge-cyan { background-color: rgba(6, 182, 212, 0.12); color: #0891b2; }
.badge-green { background-color: rgba(16, 185, 129, 0.12); color: #10b981; }
.badge-gray { background-color: rgba(148, 163, 184, 0.12); color: #64748b; }

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
  height: 80px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-title { height: 20px; width: 50%; }
.skeleton-box { height: 16px; width: 30%; }

/* PDF Offscreen Container */
.pdf-offscreen-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 210mm;
  background: #ffffff;
}

.pdf-document {
  padding: 24px;
  background: #ffffff !important;
  color: #0f172a !important;
  font-family: Arial, sans-serif;
  text-align: left;
}
.pdf-header { text-align: center; }
.pdf-header h2 { margin: 0; font-size: 18px; color: #0f172a; }
.pdf-header h3 { margin: 4px 0; font-size: 14px; color: #334155; }
.pdf-divider { margin: 16px 0; border: 0; border-top: 2px solid #334155; }
.pdf-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #0f172a; }
.pdf-section { margin-bottom: 16px; color: #0f172a; text-align: left; }
.pdf-section h4 { margin-bottom: 6px; font-size: 13px; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
.pdf-desc { font-size: 12px; white-space: pre-line; line-height: 1.5; color: #334155; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.pdf-table th, .pdf-table td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; text-align: left; color: #0f172a; }
.pdf-table th { background-color: #f1f5f9; font-weight: 700; }
.pdf-subtotal { text-align: right; margin-top: 6px; font-size: 12px; color: #0f172a; }
.pdf-footer-summary { text-align: right; font-size: 14px; font-weight: bold; padding: 10px 14px; background: #e2e8f0; margin-top: 20px; color: #0f172a; border-radius: 6px; }

.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.font-bold { font-weight: 700; }
.italic { font-style: italic; }
.text-right { text-align: right !important; }
.text-center { text-align: center !important; }

@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

@media (max-width: 600px) {
  .page-container { padding: 16px; }
  .wo-card { flex-direction: column; align-items: flex-start; }
  .card-action-bar { width: 100%; justify-content: flex-end; }
  .meta-row { flex-direction: column; align-items: flex-start; gap: 4px; }
}
</style>
