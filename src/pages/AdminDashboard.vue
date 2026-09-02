<template>
  <div class="dashboard-page">
    <div class="header-container">
      <div class="header-title">
        <h1>Admin System Dashboard</h1>
        <p class="subtitle">Selamat datang kembali, Administrator ({{ user?.email || '-' }})</p>
      </div>

      <div class="header-actions">
        <!-- Toggle Theme Button -->
        <button @click="toggleTheme" class="btn-theme-toggle" title="Ubah Tema">
          <svg v-if="currentTheme === 'dark'" class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Logout Button -->
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Memuat data statistik admin...</div>

    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchStats" class="btn-retry">Coba Lagi</button>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Laporan System</h3>
          <p class="stat-number">{{ stats.totalReports || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Teknisi Aktif</h3>
          <p class="stat-number">{{ stats.activeTechnicians || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Status System Health</h3>
          <p class="stat-number health-ok">{{ stats.systemHealth || 'GOOD' }}</p>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Aksi Cepat Admin</h3>
        <div class="action-buttons">
          <router-link to="/users" class="btn-action">Kelola Pengguna & Roles</router-link>
          <router-link to="/reports" class="btn-action outline">Lihat Semua Laporan</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi, logout } from '../services/api';

const stats = ref({ totalReports: 0, activeTechnicians: 0, systemHealth: 'GOOD' });
const user = ref(null);
const loading = ref(true);
const errorMessage = ref('');
const currentTheme = ref('light');

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

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await adminApi.get('/api/admin/stats');
    const rawData = res?.data?.stats || res?.data || {};
    stats.value = {
      totalReports: rawData.totalReports ?? 0,
      activeTechnicians: rawData.activeTechnicians ?? 0,
      systemHealth: rawData.systemHealth || 'GOOD'
    };
  } catch (err) {
    console.error('Gagal memuat statistik admin:', err);
    errorMessage.value = 'Gagal memuat data statistik dari server.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  if (typeof logout === 'function') {
    logout();
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

onMounted(() => {
  initTheme();
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  fetchStats();
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
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --theme-toggle-bg: #f1f5f9;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --theme-toggle-bg: #334155;
}

.dashboard-page {
  min-height: 100vh;
  padding: 24px;
  background-color: var(--bg-main);
  color: var(--text-main);
  box-sizing: border-box;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-title h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-theme-toggle {
  background-color: var(--theme-toggle-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.stat-card h3 {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 8px;
  margin-bottom: 0;
}

.health-ok {
  color: #16a34a;
}

.quick-actions {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.quick-actions h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-action:hover {
  background-color: var(--primary-hover);
}

.btn-action.outline {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-action.outline:hover {
  background-color: rgba(37, 99, 235, 0.1);
}

.btn-logout {
  padding: 8px 16px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-logout:hover {
  background-color: #dc2626;
}

.loading-state,
.error-state {
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
  color: var(--text-muted);
}

.btn-retry {
  margin-top: 12px;
  padding: 6px 12px;
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
