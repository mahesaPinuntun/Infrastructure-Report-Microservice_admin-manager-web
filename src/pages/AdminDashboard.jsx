<template>
  <div class="dashboard-page">
    <div class="header">
      <h1>Admin System Dashboard</h1>
      <p class="subtitle">Selamat datang kembali, Administrator ({{ user?.email }})</p>
    </div>

    <div v-if="loading" class="loading-state">Memuat data statistik admin...</div>

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
import { adminApi } from '../services/api';

const stats = ref({ totalReports: 0, activeTechnicians: 0, systemHealth: 'GOOD' });
const user = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) user.value = JSON.parse(storedUser);

    const res = await adminApi.get('/api/admin/stats');
    if (res?.data?.stats) {
      stats.value = res.data.stats;
    }
  } catch (err) {
    console.error('Gagal memuat statistik admin:', err);
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
.stat-number { font-size: 32px; font-weight: bold; color: #2563eb; margin-top: 8px; }
.health-ok { color: #16a34a; }
.quick-actions { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
.action-buttons { display: flex; gap: 12px; margin-top: 12px; }
.btn-action { padding: 10px 16px; background-color: #2563eb; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
.btn-action.outline { background-color: transparent; color: #2563eb; border: 1px solid #2563eb; }
</style>
