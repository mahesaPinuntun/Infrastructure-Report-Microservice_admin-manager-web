<template>
  <div class="wo-dashboard-wrapper">
    <!-- Header Section -->
    <header class="header-container no-print">
      <div class="header-title text-left">
        <div 
          class="brand-badge brand-badge-link" 
          @click="navigateToManagerPortal" 
          title="Kembali ke Portal Manager"
        >
          <div class="kanji-logo-badge flowing-glowing-icon">
            <span class="kanji-badge-text">築</span>
          </div>
          <span class="brand-title-text">Manager Field System</span>
        </div>
        <h1>{{ t('workOrdersTitle') }}</h1>
        <p class="subtitle">{{ t('welcome') }}, <strong>{{ user?.name || user?.email || 'Manager' }}</strong></p>
      </div>

      <div class="header-actions">
        <!-- Tombol Buka Popup Modal Buat Work Order -->
        <button @click="handleCreateWO" class="btn-create-wo" :title="t('createWo')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{{ t('createWo') }}</span>
        </button>

        <!-- Tombol Reroute ke Manager Portal -->
        <a 
          href="https://infrastructure-report-microservice-admin-manager.vercel.app/manager" 
          class="btn-reroute"
          title="Kembali ke Portal Manager"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>Manager Portal</span>
        </a>

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

        <!-- Fluid Theme Switch -->
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

        <!-- Refresh Data Button -->
        <button @click="fetchWorkOrders" class="btn-refresh" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" :class="{ 'spin-anim': loading }">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>{{ t('refreshData') }}</span>
        </button>
      </div>
    </header>

    <!-- Filter & Search Bar -->
    <div class="wo-filter-bar no-print">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('searchPlaceholder')" 
          class="search-input"
        />
      </div>

      <div class="status-tabs">
        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          @click="selectedStatus = status.value"
          :class="['tab-btn', { active: selectedStatus === status.value }]"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- SKELETON LOADING STATE -->
    <div v-if="loading" class="skeleton-wrapper no-print">
      <div class="desktop-only skeleton-table">
        <div v-for="i in 5" :key="i" class="skeleton-row">
          <div class="skeleton-block w-20"></div>
          <div class="skeleton-block w-40"></div>
          <div class="skeleton-block w-30"></div>
          <div class="skeleton-block w-24 badge"></div>
          <div class="skeleton-block w-24"></div>
          <div class="skeleton-block w-16"></div>
        </div>
      </div>
      <div class="mobile-only skeleton-cards">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-header">
            <div class="skeleton-block w-30"></div>
            <div class="skeleton-block w-20 badge"></div>
          </div>
          <div class="skeleton-block w-50"></div>
          <div class="skeleton-block w-40"></div>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="filteredWorkOrders.length === 0" class="empty-state no-print">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      <h3>{{ t('noWoFound') }}</h3>
      <p>{{ t('noWoFoundDesc') }}</p>
    </div>

    <!-- DATA DISPLAY -->
    <div v-else class="data-wrapper no-print">
      <!-- DESKTOP TABLE -->
      <div class="desktop-only table-card">
        <table class="wo-table">
          <thead>
            <tr>
              <th>{{ t('colWoCode') }}</th>
              <th>{{ t('colLocation') }}</th>
              <th>{{ t('colTech') }}</th>
              <th>{{ t('colStatus') }}</th>
              <th>{{ t('colTotal') }}</th>
              <th class="text-right">{{ t('colAction') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wo in filteredWorkOrders" :key="wo._id">
              <td class="font-bold text-main">{{ wo.woCode }}</td>
              <td>
                <div class="font-medium">{{ wo.locationName }}</div>
                <div class="text-sub font-xs">🗓️ {{ formatDate(wo.executionDate) }}</div>
              </td>
              <td>
                <div class="tech-chips">
                  <span v-for="(tech, idx) in wo.technicians" :key="idx" class="tech-chip">
                    👤 {{ tech.name }}
                  </span>
                  <span v-if="!wo.technicians || wo.technicians.length === 0" class="text-muted font-xs">
                    {{ t('unassigned') }}
                  </span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', getStatusBadge(wo.status).class]">
                  <span class="badge-dot"></span>
                  {{ getStatusBadge(wo.status).label }}
                </span>
              </td>
              <td class="font-bold text-main">{{ formatCurrency(wo.grandTotal) }}</td>
              <td class="text-right">
                <button @click="openDetailModal(wo)" class="btn-detail">{{ t('detail') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARDS -->
      <div class="mobile-only cards-list">
        <div v-for="wo in filteredWorkOrders" :key="wo._id" class="wo-card">
          <div class="card-header">
            <div>
              <span class="card-tag">WORK ORDER</span>
              <h4 class="card-code">{{ wo.woCode }}</h4>
            </div>
            <span :class="['status-badge', getStatusBadge(wo.status).class]">
              {{ getStatusBadge(wo.status).label }}
            </span>
          </div>

          <div class="card-body">
            <div class="card-info">📍 <strong>{{ wo.locationName }}</strong></div>
            <div class="card-info text-sub">🗓️ {{ formatDate(wo.executionDate) }}</div>
          </div>

          <div class="card-techs">
            <span class="text-muted font-xs">{{ t('colTech') }}:</span>
            <div class="tech-chips">
              <span v-for="(tech, idx) in wo.technicians" :key="idx" class="tech-chip">
                {{ tech.name }}
              </span>
            </div>
          </div>

          <div class="card-footer">
            <div>
              <span class="font-xs text-muted block">{{ t('colTotal') }}</span>
              <span class="font-bold text-main">{{ formatCurrency(wo.grandTotal) }}</span>
            </div>
            <button @click="openDetailModal(wo)" class="btn-primary-sm">{{ t('detail') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL WORK ORDER -->
    <div v-if="selectedWO" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <span class="font-xs text-indigo font-bold">{{ t('modalTitle') }}</span>
            <h3>{{ selectedWO.woCode }}</h3>
          </div>
          <div class="modal-header-actions">
            <button 
              @click="downloadPDF" 
              class="btn-download-pdf" 
              :disabled="isGeneratingPdf"
              :title="t('downloadPdf')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spin-anim': isGeneratingPdf }">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{{ isGeneratingPdf ? t('generatingPdf') : t('downloadPdf') }}</span>
            </button>
            <button @click="closeDetailModal" class="btn-close">&times;</button>
          </div>
        </div>

        <div class="modal-body" ref="modalPdfRef">
          <div class="pdf-doc-header">
            <div class="pdf-brand">
              <div class="kanji-logo-badge pdf-logo flowing-glowing-icon">
                <span class="kanji-badge-text">築</span>
              </div>
              <div class="text-left">
                <h2 class="pdf-brand-title">MANAGER FIELD SYSTEM</h2>
                <p class="pdf-brand-sub">Official Work Order Document Report</p>
              </div>
            </div>
            <div class="pdf-doc-meta">
              <span class="pdf-code">{{ selectedWO.woCode }}</span>
              <span class="pdf-date">Printed: {{ formatCurrentDate() }}</span>
            </div>
          </div>

          <div class="modal-status-banner avoid-break">
            <span>{{ t('modalStatus') }}:</span>
            <span :class="['status-badge', getStatusBadge(selectedWO.status).class]">
              {{ getStatusBadge(selectedWO.status).label }}
            </span>
          </div>

          <div class="info-grid avoid-break">
            <div class="text-left">
              <span class="label text-left">{{ t('modalLocation') }}</span>
              <p class="value text-left">{{ selectedWO.locationName }}</p>
            </div>
            <div class="text-left">
              <span class="label text-left">{{ t('modalDate') }}</span>
              <p class="value text-left">{{ formatDate(selectedWO.executionDate) }}</p>
            </div>
          </div>

          <div class="avoid-break text-left">
            <span class="label text-left block mb-1">{{ t('modalDesc') }}</span>
            <div class="desc-box text-left">{{ selectedWO.introduction || '-' }}</div>
          </div>

          <div class="avoid-break text-left">
            <span class="label uppercase text-left block mb-1">{{ t('modalTech') }}</span>
            <div class="tech-list">
              <div v-for="(tech, idx) in selectedWO.technicians" :key="idx" class="tech-item">
                <div class="text-left">
                  <strong class="block text-left">{{ tech.name }}</strong>
                  <span class="block text-sub font-xs text-left">{{ tech.email || tech.phone || '-' }}</span>
                </div>
                <span class="font-bold text-main">{{ formatCurrency(tech.fee) }}</span>
              </div>
              <div v-if="!selectedWO.technicians || selectedWO.technicians.length === 0" class="text-muted font-xs italic text-left">
                {{ t('unassigned') }}
              </div>
            </div>
          </div>

          <div class="avoid-break text-left">
            <span class="label uppercase text-left block mb-1">{{ t('modalMaterial') }}</span>
            <table class="mini-table">
              <thead>
                <tr>
                  <th class="text-left">Item</th>
                  <th class="text-left">Qty</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedWO.resources" :key="idx">
                  <td class="text-left font-medium">{{ item.name }}</td>
                  <td class="text-left">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
                <tr v-if="!selectedWO.resources || selectedWO.resources.length === 0">
                  <td colspan="3" class="text-center text-muted font-xs py-2">Tidak ada rincian material</td>
                </tr>
              </tbody>
            </table>
            <div class="grand-total-row">
              <span>Grand Total:</span>
              <span class="text-indigo font-bold">{{ formatCurrency(selectedWO.grandTotal) }}</span>
            </div>
          </div>

          <div class="avoid-break text-left">
            <span class="label uppercase text-left block mb-1">
              📷 {{ t('modalPhotos') }} ({{ selectedWO.progressImages?.length || 0 }})
            </span>
            <div v-if="selectedWO.progressImages && selectedWO.progressImages.length > 0" class="image-grid">
              <div 
                v-for="(imgUrl, idx) in selectedWO.progressImages" 
                :key="idx" 
                class="img-wrapper"
              >
                <img 
                  :src="imgUrl" 
                  alt="Bukti Perbaikan" 
                  crossorigin="anonymous"
                  loading="eager"
                />
              </div>
            </div>
            <div v-else class="no-images text-left">
              {{ t('noPhotos') }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-secondary">{{ t('close') }}</button>
        </div>
      </div>
    </div>

    <!-- MODAL POPUP FORM PEMBUATAN WORK ORDER BARU -->
    <CreateWorkOrderModal 
      v-if="showCreateModal" 
      :current-lang="currentLang"
      :manager-api-url="MANAGER_API_URL"
      @close="showCreateModal = false" 
      @success="handleWOCreated" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CreateWorkOrderModal from './CreateWorkOrderModal.vue';

// STATE
const workOrders = ref([]);
const loading = ref(true);
const isGeneratingPdf = ref(false);
const showCreateModal = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedWO = ref(null);
const user = ref(null);
const modalPdfRef = ref(null);

const activeTheme = ref('light');
const currentLang = ref('id');

const MANAGER_PORTAL_URL = 'https://infrastructure-report-microservice-admin-manager.vercel.app/manager';
const MANAGER_API_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

// TRANSLATION i18n
const translations = {
  id: {
    workOrdersTitle: 'Daftar Work Order',
    welcome: 'Selamat datang kembali',
    createWo: 'Buat Work Order',
    refreshData: 'Refresh Data',
    searchPlaceholder: 'Cari Kode WO, Lokasi...',
    noWoFound: 'Tidak ada Work Order ditemukan',
    noWoFoundDesc: 'Coba ubah kata kunci pencarian atau pilih filter status lainnya.',
    colWoCode: 'Kode WO',
    colLocation: 'Lokasi & Eksekusi',
    colTech: 'Teknisi Ditugaskan',
    colStatus: 'Status',
    colTotal: 'Grand Total',
    colAction: 'Aksi',
    unassigned: 'Belum ada',
    detail: 'Detail',
    modalTitle: 'Rincian Work Order',
    modalStatus: 'Status Pekerjaan',
    modalLocation: 'Lokasi Perbaikan',
    modalDate: 'Tanggal Eksekusi',
    modalDesc: 'Deskripsi / Pendahuluan',
    modalTech: 'Teknisi Lapangan',
    modalMaterial: 'Rincian Material & Biaya',
    modalPhotos: 'Foto Bukti Perbaikan',
    noPhotos: 'Belum ada foto bukti perbaikan yang diunggah oleh teknisi.',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Proses PDF...',
    close: 'Tutup'
  },
  en: {
    workOrdersTitle: 'Work Orders List',
    welcome: 'Welcome back',
    createWo: 'Create Work Order',
    refreshData: 'Refresh Data',
    searchPlaceholder: 'Search WO Code, Location...',
    noWoFound: 'No Work Orders found',
    noWoFoundDesc: 'Try changing search keywords or choosing another status filter.',
    colWoCode: 'WO Code',
    colLocation: 'Location & Execution',
    colTech: 'Assigned Technicians',
    colStatus: 'Status',
    colTotal: 'Grand Total',
    colAction: 'Action',
    unassigned: 'Unassigned',
    detail: 'Details',
    modalTitle: 'Work Order Details',
    modalStatus: 'Job Status',
    modalLocation: 'Repair Location',
    modalDate: 'Execution Date',
    modalDesc: 'Description / Introduction',
    modalTech: 'Field Technicians',
    modalMaterial: 'Material & Cost Breakdown',
    modalPhotos: 'Proof Photos',
    noPhotos: 'No repair proof photos uploaded by technician yet.',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Generating PDF...',
    close: 'Close'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

// OPEN POPUP CREATE MODAL
const handleCreateWO = () => {
  showCreateModal.value = true;
};

// HANDLER KETIKA WORK ORDER BERHASIL DIBUAT
const handleWOCreated = () => {
  showCreateModal.value = false;
  fetchWorkOrders(); // Refresh data tabel
};

const navigateToManagerPortal = () => {
  window.location.href = MANAGER_PORTAL_URL;
};

const statusOptions = computed(() => [
  { label: currentLang.value === 'id' ? 'Semua' : 'All', value: 'ALL' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Completed', value: 'COMPLETED' }
]);

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

const fetchWorkOrders = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${MANAGER_API_URL}/api/manager/work-orders`);
    workOrders.value = response.data?.data || response.data?.workOrders || [];
  } catch (error) {
    console.error('Error fetching work orders:', error);
  } finally {
    loading.value = false;
  }
};

const downloadPDF = async () => {
  if (!modalPdfRef.value || isGeneratingPdf.value || !selectedWO.value) return;

  const element = modalPdfRef.value;

  try {
    isGeneratingPdf.value = true;
    element.classList.add('is-exporting-pdf');

    let html2pdfModule;
    try {
      html2pdfModule = (await import('html2pdf.js')).default;
    } catch (e) {
      console.warn('html2pdf.js belum terinstall via npm, menggunakan fallback print dialog.');
    }

    if (html2pdfModule) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `WO_${selectedWO.value.woCode || 'Detail'}.pdf`,
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
    isGeneratingPdf.value = false;
  }
};

onMounted(() => {
  initTheme();
  initLanguage();
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try { user.value = JSON.parse(storedUser); } catch (e) {}
  }
  fetchWorkOrders();
});

const filteredWorkOrders = computed(() => {
  return workOrders.value.filter((wo) => {
    const isNotCancelled = wo.status !== 'CANCELLED';
    const matchesStatus = selectedStatus.value === 'ALL' 
      ? isNotCancelled 
      : wo.status === selectedStatus.value;

    const query = searchQuery.value.toLowerCase();
    const matchesQuery = 
      !query || 
      wo.woCode?.toLowerCase().includes(query) || 
      wo.locationName?.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });
});

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

const openDetailModal = (wo) => { selectedWO.value = wo; };
const closeDetailModal = () => { selectedWO.value = null; };
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
:global(body),
:global(#app) {
  background-color: var(--bg-main) !important;
  color: var(--text-main) !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
}

.wo-dashboard-wrapper {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
  transition: background-color 0.4s ease, color 0.4s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.brand-badge-link {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.brand-badge-link:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.brand-title-text {
  font-size: 13px;
  font-weight: 800;
}

.flowing-glowing-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, #2563eb, #3b82f6, #06b6d4, #3b82f6, #2563eb);
  background-size: 300% 300%;
  animation: flowingGradient 4s ease infinite, glowingPulse 2.5s infinite ease-in-out;
}

@keyframes flowingGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes glowingPulse {
  0% { box-shadow: 0 0 8px rgba(37, 99, 235, 0.4), 0 0 14px rgba(6, 182, 212, 0.3); }
  50% { box-shadow: 0 0 18px rgba(37, 99, 235, 0.8), 0 0 28px rgba(6, 182, 212, 0.6); }
  100% { box-shadow: 0 0 8px rgba(37, 99, 235, 0.4), 0 0 14px rgba(6, 182, 212, 0.3); }
}

.kanji-badge-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  color: var(--text-main);
  text-align: left;
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
  text-align: left;
}

.subtitle strong { color: var(--text-main); }

.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.btn-create-wo {
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
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.btn-create-wo:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.btn-reroute {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-reroute:hover {
  background-color: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.lang-switch-wrapper { display: flex; align-items: center; flex-shrink: 0; }

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

.lang-option.active { color: var(--lang-text-active); }

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

.lang-toggle-switch.is-en .lang-slider { transform: translateX(32px); }

.theme-switch-wrapper { display: flex; align-items: center; flex-shrink: 0; }

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

.theme-toggle-switch.is-dark .switch-handle { transform: translateX(28px); }

.switch-icon { width: 15px; height: 15px; color: var(--switch-icon-color); transition: color 0.3s ease; }

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-refresh:hover { border-color: var(--primary-color); color: var(--primary-color); }

.icon-sm { width: 16px; height: 16px; flex-shrink: 0; }
.search-icon { width: 18px; height: 18px; flex-shrink: 0; color: var(--text-muted); }
.empty-icon { width: 48px; height: 48px; margin-bottom: 12px; color: var(--text-muted); }

.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.wo-filter-bar {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
  max-width: 320px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: var(--text-main);
}

.status-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }

.tab-btn {
  background-color: var(--bg-main);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.tab-btn.active {
  background-color: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

.badge-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; }
.badge-blue { background-color: rgba(37, 99, 235, 0.12); color: #2563eb; border-color: rgba(37, 99, 235, 0.25); }
.badge-amber { background-color: rgba(217, 119, 6, 0.12); color: #d97706; border-color: rgba(217, 119, 6, 0.25); }
.badge-cyan { background-color: rgba(6, 182, 212, 0.12); color: #0891b2; border-color: rgba(6, 182, 212, 0.25); }
.badge-green { background-color: rgba(16, 185, 129, 0.12); color: #10b981; border-color: rgba(16, 185, 129, 0.25); }
.badge-gray { background-color: rgba(148, 163, 184, 0.12); color: #64748b; border-color: rgba(148, 163, 184, 0.25); }

.data-wrapper { width: 100%; }

.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.wo-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
.wo-table th { background-color: var(--bg-main); padding: 14px 18px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
.wo-table td { padding: 16px 18px; border-bottom: 1px solid var(--border-color); }

.cards-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.wo-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; width: 100%; box-sizing: border-box; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.card-tag { font-size: 10px; font-weight: 700; color: var(--primary-color); display: block; }
.card-code { font-size: 16px; font-weight: 700; color: var(--text-main); margin: 2px 0 0 0; }
.card-body { font-size: 13px; margin-bottom: 12px; }
.card-techs { border-top: 1px solid var(--border-color); padding-top: 8px; margin-bottom: 12px; }
.card-footer { border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; justify-content: space-between; align-items: center; }

.tech-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.tech-chip { background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-size: 11px; padding: 2px 8px; border-radius: 4px; }

.btn-detail { background-color: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-detail:hover { border-color: var(--primary-color); color: var(--primary-color); }

.btn-primary-sm { background-color: var(--primary-color); color: #ffffff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 999;
}

.modal-content {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 620px;
  border-radius: 16px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header { 
  padding: 16px 20px; 
  background-color: var(--bg-main); 
  border-bottom: 1px solid var(--border-color); 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.modal-header h3 { margin: 0; font-size: 18px; color: var(--text-main); }

.modal-header-actions { display: flex; align-items: center; gap: 8px; }

.btn-download-pdf {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-download-pdf:hover:not(:disabled) { background-color: var(--primary-hover); }
.btn-download-pdf:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-close { background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; padding: 0 4px; }

.modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-status-banner { display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.label { font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 2px; }
.value { font-size: 13px; font-weight: 600; color: var(--text-main); margin: 0; }

.desc-box { 
  background: var(--bg-main); 
  padding: 12px; 
  border-radius: 6px; 
  font-size: 12.5px; 
  line-height: 1.5;
  color: var(--text-main); 
  border: 1px solid var(--border-color); 
  text-align: left !important;
  white-space: pre-line;
  word-break: break-word;
}

.tech-list { display: flex; flex-direction: column; gap: 6px; }
.tech-item { display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12px; }

.mini-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
.mini-table th, .mini-table td { padding: 6px 8px; border-bottom: 1px solid var(--border-color); }
.grand-total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; margin-top: 8px; }

.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
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
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
.no-images { font-size: 12px; color: var(--text-muted); font-style: italic; padding: 12px; background: var(--bg-main); border-radius: 6px; border: 1px solid var(--border-color); }

.modal-footer { padding: 12px 20px; background: var(--bg-main); border-top: 1px solid var(--border-color); text-align: right; }
.btn-secondary { background: var(--border-color); color: var(--text-main); border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

.pdf-doc-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}
.pdf-brand { display: flex; align-items: center; gap: 12px; justify-content: flex-start; }
.pdf-logo { width: 36px; height: 36px; border-radius: 8px; }
.pdf-brand-title { font-size: 15px; font-weight: 800; margin: 0; color: #1d4ed8; letter-spacing: 0.5px; }
.pdf-brand-sub { font-size: 10px; color: #64748b; margin: 2px 0 0 0; }
.pdf-doc-meta { text-align: right; display: flex; flex-direction: column; }
.pdf-code { font-size: 15px; font-weight: 800; color: #0f172a; }
.pdf-date { font-size: 10px; color: #64748b; }

.skeleton-wrapper { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.skeleton-table, .skeleton-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; width: 100%; box-sizing: border-box; }
.skeleton-row { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border-color); }
.skeleton-block { height: 16px; background: var(--border-color); border-radius: 4px; animation: pulse 1.5s infinite ease-in-out; }
.skeleton-block.badge { height: 24px; border-radius: 12px; }
.w-16 { width: 60px; } .w-20 { width: 80px; } .w-24 { width: 100px; } .w-30 { width: 140px; } .w-40 { width: 180px; } .w-50 { width: 220px; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }

.modal-body.is-exporting-pdf {
  background-color: #ffffff !important;
  color: #0f172a !important;
  padding: 24px !important;
  width: 100% !important;
  max-height: none !important;
  overflow: visible !important;
  box-shadow: none !important;
}

.modal-body.is-exporting-pdf .pdf-doc-header {
  display: flex !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

.modal-body.is-exporting-pdf * {
  color: #0f172a !important;
  background-color: transparent !important;
  border-color: #cbd5e1 !important;
  text-shadow: none !important;
  box-shadow: none !important;
}

.modal-body.is-exporting-pdf .label,
.modal-body.is-exporting-pdf .text-sub,
.modal-body.is-exporting-pdf .text-muted,
.modal-body.is-exporting-pdf .pdf-brand-sub,
.modal-body.is-exporting-pdf .pdf-date {
  color: #475569 !important;
}

.modal-body.is-exporting-pdf .pdf-brand-title {
  color: #1d4ed8 !important;
}

.modal-body.is-exporting-pdf .desc-box,
.modal-body.is-exporting-pdf .modal-status-banner,
.modal-body.is-exporting-pdf .tech-item,
.modal-body.is-exporting-pdf .img-wrapper,
.modal-body.is-exporting-pdf .no-images {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
}

.modal-body.is-exporting-pdf .kanji-badge-text {
  color: #ffffff !important;
}

.modal-body.is-exporting-pdf .status-badge {
  border: 1px solid #cbd5e1 !important;
}

@media (min-width: 768px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }
}

@media (max-width: 767px) {
  .mobile-only { display: block !important; }
  .desktop-only { display: none !important; }
  .info-grid { grid-template-columns: 1fr; }
  .search-box { max-width: 100%; }
  .header-actions { width: 100%; justify-content: space-between; }
  .wo-dashboard-wrapper { padding: 16px; }
}

.text-left { text-align: left !important; }
.text-right { text-align: right !important; }
.text-center { text-align: center !important; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-xs { font-size: 11px; }
.text-main { color: var(--text-main); }
.text-sub { color: var(--text-muted); }
.text-muted { color: var(--text-muted); }
.text-indigo { color: var(--primary-color); }
.block { display: block; }
.uppercase { text-transform: uppercase; }
.mb-1 { margin-bottom: 4px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.empty-state { text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted); width: 100%; box-sizing: border-box; }

@media print {
  .no-print { display: none !important; }
  .pdf-doc-header { display: flex !important; }
  .modal-backdrop { position: static !important; background: none !important; padding: 0 !important; }
  .modal-content { max-width: 100% !important; border: none !important; box-shadow: none !important; }
  .modal-header, .modal-footer { display: none !important; }
  .avoid-break { page-break-inside: avoid !important; }
}
</style>
