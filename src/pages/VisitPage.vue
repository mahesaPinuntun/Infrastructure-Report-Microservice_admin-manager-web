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

          <button @click="goToDashboard" class="btn-nav btn-dashboard" title="Kembali ke Dashboard Utama">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            <span class="btn-text">{{ t('navDashboard') }}</span>
          </button>

          <button @click="goToWorkflow" class="btn-nav btn-flow" title="Buka Workflow System">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="btn-text">{{ t('navWorkflow') }}</span>
          </button>
        </div>

        <div class="header-content">
          <h1>{{ t('pageTitle') }}</h1>
          <p class="subtitle">{{ t('pageSubtitle') }}</p>
        </div>
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

    <main class="main-content">
      <div v-if="loading" class="visits-grid">
        <div v-for="n in 6" :key="'skeleton-' + n" class="visit-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="i" class="skeleton-line skeleton-box"></div>
          </div>
          <div class="skeleton-line skeleton-btn"></div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchVisits" class="btn-retry">{{ t('btnRetry') }}</button>
      </div>

      <div v-else-if="visits.length === 0" class="state-card empty">
        <p>{{ t('emptyData') }}</p>
      </div>

      <div v-else class="visits-grid">
        <article v-for="visit in visits" :key="visit._id || visit.id" class="visit-card">
          <div class="card-top">
            <h3 class="location-name">{{ visit.title || visit.locationName || visit.location || t('defaultLocation') }}</h3>
            <span :class="['status-badge', (visit.status || 'PENDING').toLowerCase()]">
              {{ visit.status || 'PENDING' }}
            </span>
          </div>

          <div class="kv-grid-container">
            <div class="kv-item">
              <span class="kv-label">{{ t('colWoId') }}</span>
              <strong class="kv-value">{{ visit.workOrderNumber || visit.reportId || visit._id?.substring(0, 6) || '-' }}</strong>
            </div>

            <div class="kv-item">
              <span class="kv-label">{{ t('colTechnician') }}</span>
              <strong class="kv-value">{{ getTechnicianName(visit) }}</strong>
            </div>

            <div class="kv-item">
              <span class="kv-label">{{ t('colDate') }}</span>
              <strong class="kv-value">{{ formatDate(visit.visitDate || visit.createdAt || visit.dueDate) }}</strong>
            </div>

            <div class="kv-item">
              <span class="kv-label">{{ t('colCategory') }}</span>
              <strong class="kv-value">{{ visit.category || 'Maintenance' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colPriority') }}</span>
              <strong class="kv-value">{{ visit.priority || 'NORMAL' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">{{ t('colLocation') }}</span>
              <strong class="kv-value">{{ visit.location || visit.locationName || '-' }}</strong>
            </div>
          </div>

          <div class="card-actions">
            <button @click="navigateToDetail(visit)" class="btn-detail">
              <span>{{ t('btnViewDetail') }}</span>
              <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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
const visits = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');
const currentLang = ref('id');

const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

// TRANSLATION DICTIONARY
const translations = {
  id: {
    navDashboard: 'Dashboard',
    navWorkflow: 'Flow System',
    pageTitle: 'Daftar Kunjungan & Work Order',
    pageSubtitle: 'Riwayat & Jadwal Penugasan Manager Field',
    btnRetry: 'Coba Lagi',
    emptyData: 'Belum ada data kunjungan / work order terdaftar.',
    defaultLocation: 'Kunjungan Lapangan',
    colWoId: 'ID WO / Report',
    colTechnician: 'Teknisi',
    colDate: 'Tanggal',
    colCategory: 'Kategori',
    colPriority: 'Prioritas',
    colLocation: 'Lokasi',
    btnViewDetail: 'Lihat Detail Laporan'
  },
  en: {
    navDashboard: 'Dashboard',
    navWorkflow: 'Flow System',
    pageTitle: 'Visits & Work Order List',
    pageSubtitle: 'History & Field Manager Assignment Schedule',
    btnRetry: 'Try Again',
    emptyData: 'No visits or work orders registered yet.',
    defaultLocation: 'Field Visit',
    colWoId: 'WO / Report ID',
    colTechnician: 'Technician',
    colDate: 'Date',
    colCategory: 'Category',
    colPriority: 'Priority',
    colLocation: 'Location',
    btnViewDetail: 'View Report Details'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

// ROUTING FLOW
const goToHome = () => router.push('/');

const goToDashboard = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (storedUser.role || '').toUpperCase();
  if (role === 'ADMIN') {
    router.push('/admin');
  } else if (role === 'MANAGER' || role === 'INFRASTRUCTURE_MANAGER') {
    router.push('/manager');
  } else {
    router.push('/reports');
  }
};

const goToWorkflow = () => {
  router.push('/workflow');
};

const navigateToDetail = (visit) => {
  const targetId = visit.reportId || visit._id || visit.id;
  if (targetId) router.push(`/reports/${targetId}`);
};

// LANGUAGE TOGGLE
const initLanguage = () => {
  currentLang.value = localStorage.getItem('user-lang') || 'id';
};

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'id' ? 'en' : 'id';
  localStorage.setItem('user-lang', currentLang.value);
};

// THEME TOGGLE
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

const getTechnicianName = (visit) => {
  if (!visit) return '-';
  if (Array.isArray(visit.technicians) && visit.technicians.length > 0) {
    const first = visit.technicians[0];
    if (typeof first === 'object' && first?.name) return first.name;
    if (typeof first === 'string') return first;
  }
  if (typeof visit.technicianName === 'string' && visit.technicianName.trim()) return visit.technicianName;
  if (visit.assignedTechnician?.name) return visit.assignedTechnician.name;
  return '-';
};

const fetchVisits = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await axios.get(`${MANAGER_SERVICE_URL}/api/manager/work-orders`);
    const data = res?.data?.workOrders || res?.data?.data || res?.data?.visits || res?.data || [];
    visits.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching Manager Work Orders:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Gagal memuat data Work Order.';
    visits.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const locale = currentLang.value === 'id' ? 'id-ID' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
