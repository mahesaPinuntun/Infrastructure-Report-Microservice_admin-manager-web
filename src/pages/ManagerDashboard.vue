<template>
  <div class="dashboard-page">
    <div class="header">
      <h1>Manager Field Dashboard</h1>
      <p class="subtitle">Selamat datang kembali, Manager ({{ user?.email }})</p>
    </div>

    <div v-if="loading" class="loading-state">Memuat data operasional...</div>

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
import { managerApi } from '../services/api';

const stats = ref({ activeWorkOrders: 0, pendingApprovals: 0, availableTechnicians: 0 });
const user = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) user.value = JSON.parse(storedUser);

    const res = await managerApi.get('/api/manager/stats');
    if (res?.data?.stats) {
      stats.value = res.data.stats;
    }
  } catch (err) {
    console.error('Gagal memuat statistik manager:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-page { padding: 24px; }
.subtitle { color: #64748b; margin-bottom: 24px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
.stat-card { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
.stat-number { font-size: 32px; font-weight: bold; color: #0284c7; margin-top: 8px; }
.warning { color: #d97706; }
.quick-actions { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
.action-buttons { display: flex; gap: 12px; margin-top: 12px; }
.btn-action { padding: 10px 16px; background-color: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
.btn-action.outline { background-color: transparent; color: #0284c7; border: 1px solid #0284c7; }
</style>
