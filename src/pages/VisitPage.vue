<template>
  <div class="page-container">
    <!-- Header Page -->
    <header class="header-section">
      <div class="header-content">
        <h1>Daftar Kunjungan Infrastruktur</h1>
        <p class="subtitle">Riwayat & Jadwal Kunjungan Lapangan</p>
      </div>
      
      <!-- Theme Switcher -->
      <button @click="toggleTheme" class="btn-theme" title="Ubah Tema">
        <svg v-if="currentTheme === 'dark'" class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </header>

    <!-- Content Area -->
    <main class="main-content">
      <div v-if="loading" class="state-card loading">
        <span>Memuat data kunjungan...</span>
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button @click="fetchVisits" class="btn-retry">Coba Lagi</button>
      </div>

      <div v-else-if="visits.length === 0" class="state-card empty">
        <p>Belum ada data kunjungan tersedia.</p>
      </div>

      <div v-else class="visits-grid">
        <article v-for="visit in visits" :key="visit.id || visit._id" class="visit-card">
          <!-- Card Header (Lokasi & Status) -->
          <div class="card-top">
            <h3 class="location-name">{{ visit.locationName || visit.title || 'Lokasi Infrastruktur' }}</h3>
            <span :class="['status-badge', (visit.status || 'PENDING').toLowerCase()]">
              {{ visit.status || 'PENDING' }}
            </span>
          </div>

          <!-- Key-Value Grid Section (Mobile: 3 Columns x 2 Rows) -->
          <div class="kv-grid-container">
            <!-- Row 1: Item 1 -->
            <div class="kv-item">
              <span class="kv-label">ID Laporan</span>
              <strong class="kv-value">{{ visit.reportId || visit.id?.substring(0,6) || '-' }}</strong>
            </div>
            <!-- Row 1: Item 2 -->
            <div class="kv-item">
              <span class="kv-label">Teknisi</span>
              <strong class="kv-value">{{ visit.technicianName || visit.technician || '-' }}</strong>
            </div>
            <!-- Row 1: Item 3 -->
            <div class="kv-item">
              <span class="kv-label">Tanggal</span>
              <strong class="kv-value">{{ formatDate(visit.visitDate || visit.createdAt) }}</strong>
            </div>

            <!-- Row 2: Item 4 -->
            <div class="kv-item">
              <span class="kv-label">Kategori</span>
              <strong class="kv-value">{{ visit.category || 'Maintenance' }}</strong>
            </div>
            <!-- Row 2: Item 5 -->
            <div class="kv-item">
              <span class="kv-label">Waktu</span>
              <strong class="kv-value">{{ visit.time || '09:00 WIB' }}</strong>
            </div>
            <!-- Row 2: Item 6 -->
            <div class="kv-item">
              <span class="kv-label">Tipe</span>
              <strong class="kv-value">{{ visit.visitType || 'Inspeksi' }}</strong>
            </div>
          </div>

          <!-- Card Footer Action -->
          <div class="card-actions">
            <router-link :to="`/reports/${visit.reportId || visit._id}`" class="btn-detail">
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
import axios from 'axios';

const visits = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://infrastructure-report-microservice-admin-service.vercel.app';

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  currentTheme.value = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  localStorage.setItem('user-theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};

const fetchVisits = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/visits`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    const data = response?.data?.visits || response?.data || [];
    visits.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching visits:', err);
    // Dummy Data Fallback jika API belum siap
    visits.value = [
      {
        _id: '1',
        reportId: 'REP-001',
        locationName: 'Tower BTS Cileungsi 02',
        technicianName: 'Ahmad Supri',
        visitDate: '2026-08-10',
        category: 'Jaringan',
        time: '10:00 WIB',
        visitType: 'Rutin',
        status: 'COMPLETED'
      },
      {
        _id: '2',
        reportId: 'REP-002',
        locationName: 'Gedung Data Center Bekasi',
        technicianName: 'Budi Santoso',
        visitDate: '2026-08-12',
        category: 'Listrik/AC',
        time: '14:00 WIB',
        visitType: 'Darurat',
        status: 'PENDING'
      }
    ];
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
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --theme-bg: #f1f5f9;
  --kv-bg: #f8fafc;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --theme-bg: #334155;
  --kv-bg: #0f172a;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 16px;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.btn-theme {
  background: var(--theme-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

.visits-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.visit-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.location-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

/* Status Badges */
.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge.completed { background: #dcfce7; color: #15803d; }
.status-badge.pending { background: #fef3c7; color: #b45309; }
.status-badge.cancelled { background: #fee2e2; color: #b91c1c; }

/* KEY-VALUE GRID (3 COLUMNS x 2 ROWS UTUTUK MOBILE) */
.kv-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Tepat 3 Kolom */
  grid-template-rows: repeat(2, auto);   /* Tepat 2 Baris */
  gap: 8px;
  background-color: var(--kv-bg);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 12px;
}

.kv-item {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Mencegah overflow teks */
}

.kv-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.kv-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Mengatur potongan jika data terlalu panjang */
}

/* Footer Actions */
.card-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-detail {
  display: inline-block;
  width: 100%;
  text-align: center;
  padding: 8px 12px;
  background-color: var(--primary);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-detail:hover {
  background-color: var(--primary-hover);
}

.state-card {
  padding: 24px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.btn-retry {
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
