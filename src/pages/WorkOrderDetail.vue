<template>
  <div class="wo-dashboard-wrapper">
    <!-- Header Section -->
    <header class="header-container">
      <div class="header-title">
        <div class="brand-badge">
          <div class="kanji-logo-badge">
            <span class="kanji-badge-text">築</span>
          </div>
          <span>Manager Field System</span>
        </div>
        <h1>{{ t('workOrdersTitle') }}</h1>
        <p class="subtitle">{{ t('welcome') }}, <strong>{{ user?.name || user?.email || 'Manager' }}</strong></p>
      </div>

      <div class="header-actions">
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
    <div class="wo-filter-bar">
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
    <div v-if="loading" class="skeleton-wrapper">
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
    <div v-else-if="filteredWorkOrders.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      <h3>{{ t('noWoFound') }}</h3>
      <p>{{ t('noWoFoundDesc') }}</p>
    </div>

    <!-- DATA DISPLAY -->
    <div v-else class="data-wrapper">
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
                <button @click="goToDetail(wo._id)" class="btn-detail">{{ t('detail') }}</button>
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
            <button @click="goToDetail(wo._id)" class="btn-primary-sm">{{ t('detail') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const workOrders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('ALL');
const user = ref(null);

const activeTheme = ref('light');
const currentLang = ref('id');

const MANAGER_API_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const translations = {
  id: {
    workOrdersTitle: 'Daftar Work Order',
    welcome: 'Selamat datang kembali',
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
    detail: 'Detail'
  },
  en: {
    workOrdersTitle: 'Work Orders List',
    welcome: 'Welcome back',
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
    detail: 'Details'
  }
};

const t = (key) => translations[currentLang.value]?.[key] || key;

const statusOptions = computed(() => [
  { label: currentLang.value === 'id' ? 'Semua' : 'All', value: 'ALL' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
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

const goToDetail = (id) => {
  router.push(`/work-orders/${id}`);
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

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.kanji-logo-badge {
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px -1px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.kanji-badge-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.subtitle strong { color: var(--text-main); }

.header-actions { display: flex; align-items: center; gap: 12px; }

/* Language Switcher */
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

/* Theme Switch */
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

.switch-icon {
  width: 15px;
  height: 15px;
  color: var(--switch-icon-color);
  transition: color 0.3s ease;
}

.btn-refresh {
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

.btn-refresh:hover { background-color: var(--primary-hover); }

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

.skeleton-wrapper { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.skeleton-table, .skeleton-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; width: 100%; box-sizing: border-box; }
.skeleton-row { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border-color); }
.skeleton-block { height: 16px; background: var(--border-color); border-radius: 4px; animation: pulse 1.5s infinite ease-in-out; }
.skeleton-block.badge { height: 24px; border-radius: 12px; }
.w-16 { width: 60px; } .w-20 { width: 80px; } .w-24 { width: 100px; } .w-30 { width: 140px; } .w-40 { width: 180px; } .w-50 { width: 220px; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }

@media (min-width: 768px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }
}

@media (max-width: 767px) {
  .mobile-only { display: block !important; }
  .desktop-only { display: none !important; }
  .search-box { max-width: 100%; }
  .header-actions { width: 100%; justify-content: space-between; }
  .wo-dashboard-wrapper { padding: 16px; }
}

.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-xs { font-size: 11px; }
.text-main { color: var(--text-main); }
.text-sub { color: var(--text-muted); }
.text-muted { color: var(--text-muted); }
.block { display: block; }
.empty-state { text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-muted); width: 100%; box-sizing: border-box; }
</style>
