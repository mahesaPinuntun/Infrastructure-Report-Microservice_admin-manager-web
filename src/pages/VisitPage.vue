<template>
  <div class="page-container">
    <!-- Header Page -->
    <header class="header-section">
      <div class="header-left">
        <!-- Tombol Reroute ke '/' -->
        <button @click="goToHome" class="btn-home" title="Kembali ke Landing Page">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="btn-home-text">Home</span>
        </button>

        <div class="header-content">
          <h1>Daftar Kunjungan & Work Order</h1>
          <p class="subtitle">Riwayat & Jadwal Penugasan Manager Field</p>
        </div>
      </div>

      <!-- Fluid Theme Switch (Desain Kapsul) -->
      <div class="theme-switch-wrapper">
        <button 
          @click="toggleTheme" 
          class="theme-toggle-switch" 
          :class="{ 'is-dark': currentTheme === 'dark' }"
          title="Ubah Tema"
          aria-label="Toggle Theme"
        >
          <span class="switch-handle">
            <!-- Icon Matahari (Light Mode) -->
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
            
            <!-- Icon Bulan (Dark Mode) -->
            <svg v-else class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
        </button>
      </div>
    </header>

    <!-- Content Area -->
    <main class="main-content">
      <!-- CHUNK LOADING (SKELETON STATE) -->
      <div v-if="loading" class="visits-grid">
        <div v-for="n in 3" :key="'skeleton-' + n" class="visit-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="i" class="skeleton-line skeleton-box"></div>
          </div>
          <div class="skeleton-line skeleton-btn"></div>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchVisits" class="btn-retry">Coba Lagi</button>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="visits.length === 0" class="state-card empty">
        <p>Belum ada data kunjungan / work order terdaftar.</p>
      </div>

      <!-- VISITS GRID DATA -->
      <div v-else class="visits-grid">
        <article v-for="visit in visits" :key="visit._id || visit.id" class="visit-card">
          <!-- Card Top Info -->
          <div class="card-top">
            <h3 class="location-name">{{ visit.title || visit.locationName || visit.location || 'Kunjungan Lapangan' }}</h3>
            <span :class="['status-badge', (visit.status || 'PENDING').toLowerCase()]">
              {{ visit.status || 'PENDING' }}
            </span>
          </div>

          <!-- Key-Value Grid Container (Layout Responsif 3 Kolom) -->
          <div class="kv-grid-container">
            <!-- Row 1 -->
            <div class="kv-item">
              <span class="kv-label">ID WO / Report</span>
              <strong class="kv-value">{{ visit.workOrderNumber || visit.reportId || visit._id?.substring(0, 6) || '-' }}</strong>
            </div>

            <div class="kv-item">
              <span class="kv-label">Teknisi</span>
              <strong class="kv-value">{{ getTechnicianName(visit) }}</strong>
            </div>

            <div class="kv-item">
              <span class="kv-label">Tanggal</span>
              <strong class="kv-value">{{ formatDate(visit.visitDate || visit.createdAt || visit.dueDate) }}</strong>
            </div>

            <!-- Row 2 -->
            <div class="kv-item">
              <span class="kv-label">Kategori</span>
              <strong class="kv-value">{{ visit.category || 'Maintenance' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">Prioritas</span>
              <strong class="kv-value">{{ visit.priority || 'NORMAL' }}</strong>
            </div>
            <div class="kv-item">
              <span class="kv-label">Lokasi</span>
              <strong class="kv-value">{{ visit.location || visit.locationName || '-' }}</strong>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <router-link v-if="visit.reportId || visit._id" :to="`/reports/${visit.reportId || visit._id}`" class="btn-detail">
              Lihat Detail Laporan
            </router-link>
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

const MANAGER_SERVICE_URL = import.meta.env.VITE_MANAGER_SERVICE_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

const goToHome = () => {
  router.push('/');
};

const applyThemeToDOM = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  currentTheme.value = savedTheme;
  applyThemeToDOM(savedTheme);
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  localStorage.setItem('user-theme', newTheme);
  applyThemeToDOM(newTheme);
};

const getTechnicianName = (visit) => {
  if (!visit) return '-';

  if (Array.isArray(visit.technicians) && visit.technicians.length > 0) {
    const firstTech = visit.technicians[0];
    if (typeof firstTech === 'object' && firstTech !== null && firstTech.name) {
      return firstTech.name;
    }
  }

  if (Array.isArray(visit.technicians) && typeof visit.technicians[0] === 'string') {
    return visit.technicians[0];
  }

  if (typeof visit.technicianName === 'string' && visit.technicianName.trim()) {
    return visit.technicianName;
  }

  if (visit.assignedTechnician && typeof visit.assignedTechnician === 'object') {
    return visit.assignedTechnician.name || visit.assignedTechnician.email || '-';
  }

  if (visit.technician && typeof visit.technician === 'object') {
    return visit.technician.name || visit.technician.email || '-';
  }

  return '-';
};

const fetchVisits = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get(`${MANAGER_SERVICE_URL}/api/manager/work-orders`);
    const data = response?.data?.workOrders || response?.data?.data || response?.data?.visits || response?.data || [];
    visits.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching Manager Work Orders:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Gagal memuat data Work Order dari Manager Service.';
    visits.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
};

onMounted(() => {
  initTheme();
  fetchVisits();
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
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --kv-bg: #f8fafc;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --skeleton-bg: #e2e8f0;
}

:global([data-theme="dark"]),
:global(body[data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --kv-bg: #0f172a;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --skeleton-bg: #334155;
}

/* MENELIMINASI SELURUH GAP/MARGIN/OVERFLOW DARI ROOT HTML/BODY */
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
  transition: background-color 0.4s ease, color 0.4s ease;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-home {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-home:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.header-content h1 { 
  margin: 0; 
  font-size: 22px; 
  font-weight: 800; 
  line-height: 1.2;
}

.subtitle { 
  margin: 4px 0 0 0; 
  font-size: 13px; 
  color: var(--text-muted); 
}

/* FLUID THEME SWITCH STYLES */
.theme-switch-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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

.theme-toggle-switch.is-dark .switch-handle {
  transform: translateX(28px);
}

.switch-icon {
  width: 15px;
  height: 15px;
  color: var(--switch-icon-color);
  transition: color 0.3s ease;
}

.icon-sm { width: 16px; height: 16px; }

/* KONTEN UTAMA MEMENUHI KANAN DAN KIRI LAYAR */
.main-content {
  width: 100%;
  margin: 0;
}

/* VISITS GRID RESPONSIF TANPA BATAS TERHUBUNG KE PINGGIR LAYAR */
.visits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  width: 100%;
}

.visit-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: background-color 0.4s ease, border-color 0.4s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.location-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
  word-break: break-word;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.completed, .status-badge.done { background: #dcfce7; color: #15803d; }
.status-badge.in_progress, .status-badge.pending, .status-badge.assigned { background: #fef3c7; color: #b45309; }
.status-badge.cancelled { background: #fee2e2; color: #b91c1c; }

/* Key-Value Grid Container */
.kv-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background-color: var(--kv-bg);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 16px;
  transition: background-color 0.4s ease;
}

.kv-item { display: flex; flex-direction: column; min-width: 0; }
.kv-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
.kv-value { font-size: 12px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-actions { display: flex; justify-content: flex-end; margin-top: auto; }
.btn-detail {
  display: inline-block;
  width: 100%;
  text-align: center;
  padding: 10px 14px;
  background-color: var(--primary);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  text-decoration: none;
  box-sizing: border-box;
}

.btn-detail:hover {
  background-color: var(--primary-hover);
}

.state-card {
  padding: 40px 16px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-muted);
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.btn-retry {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

/* CHUNK SKELETON ANIMATION */
.skeleton-card {
  min-height: 200px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.skeleton-box {
  height: 28px;
  width: 100%;
}

.skeleton-btn {
  height: 36px;
  width: 100%;
  margin-top: auto;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 600px) {
  .page-container {
    padding: 16px;
  }

  .btn-home-text {
    display: none;
  }

  .visits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
