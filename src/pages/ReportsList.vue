<template>
  <div class="page-container">
    <h2>Daftar Laporan Infrastruktur</h2>
    
    <div v-if="loading">Memuat laporan...</div>
    
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Judul</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="reports.length === 0">
          <td colSpan="4">Belum ada laporan.</td>
        </tr>
        <tr v-for="item in reports" :key="item._id || item.id">
          <td>{{ item._id || item.id }}</td>
          <td>{{ item.title || item.description }}</td>
          <td><span class="badge">{{ item.status || 'PENDING' }}</span></td>
          <td>
            <router-link :to="`/reports/${item._id || item.id}`">Detail</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi, managerApi } from '../services/api';

const reports = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const api = user.role === 'ADMIN' ? adminApi : managerApi;
    const endpoint = user.role === 'ADMIN' ? '/api/admin/reports' : '/api/manager/reports';

    const res = await api.get(endpoint);
    reports.value = res.data.reports || res.data || [];
  } catch (err) {
    console.error('Failed to fetch reports:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-container { padding: 24px; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
.data-table th { background-color: #f1f5f9; }
.badge { background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
</style>
