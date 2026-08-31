<template>
  <div class="dashboard-page">
    <div class="header-container">
      <div class="header-title">
        <h1>Manager Field Dashboard</h1>
        <p class="subtitle">Selamat datang kembali, Manager ({{ user?.email }})</p>
      </div>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </div>

    <div v-if="loading" class="loading-state">Memuat data operasional...</div>

    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchStats" class="btn-retry">Coba Lagi</button>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Work Orders Active</h3>
          <p class="stat-number">{{ stats.activeWorkOrders || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Laporan Perlu Approval</h3>
          <p class="stat-number warning">{{ stats.pendingApprovals || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Teknisi Field Ready</h3>
          <p class="stat-number">{{ stats.availableTechnicians || 0 }}</p>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Manajemen Operasional</h3>
        <div class="action-buttons">
          <router-link to="/work-orders" class="btn-action">Kelola Work Orders</router-link>
          <router-link to="/reports" class="btn-action outline">Review Laporan Masuk</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { managerApi, logout } from '../services/api';

const router = useRouter();
const stats = ref({ activeWorkOrders: 0, pendingApprovals: 0, availableTechnicians: 0 });
const user = ref(null);
const loading = ref(true);
const errorMessage = ref('');

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await managerApi.get('/api/manager/stats');
    // Fleksibel mendukung format res.data.stats atau res.data langsung
    stats.value = res?.data?.stats || res?.data || { activeWorkOrders: 0, pendingApprovals: 0, availableTechnicians: 0 };
  } catch (err) {
    console.error('Gagal memuat statistik manager:', err);
    errorMessage.value = 'Gagal memuat data statistik dari server.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  logout();
};

onMounted(() => {
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
.dashboard-page { padding: 24px; }
.header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.subtitle { color: #64748b; margin-top: 4px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
.stat-card { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
.stat-number { font-size: 32px; font-weight: bold; color: #0284c7; margin-top: 8px; }
.warning { color: #d97706; }
.quick-actions { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
.action-buttons { display: flex; gap: 12px; margin-top: 12px; }
.btn-action { padding: 10px 16px; background-color: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
.btn-action.outline { background-color: transparent; color: #0284c7; border: 1px solid #0284c7; }
.btn-logout { padding: 8px 16px; background-color: #ef4444; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-logout:hover { background-color: #dc2626; }
.loading-state, .error-state { padding: 24px; background: #f8fafc; border-radius: 8px; text-align: center; color: #64748b; }
.btn-retry { margin-top: 12px; padding: 6px 12px; background: #0284c7; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
</style>
