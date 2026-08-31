<template>
  <div class="page-container">
    <h2>Manajemen Pengguna (Admin Only)</h2>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u._id">
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.status || 'ACTIVE' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '../services/api';

const users = ref([]);

onMounted(async () => {
  try {
    const res = await adminApi.get('/api/admin/users');
    users.value = res.data.users || res.data || [];
  } catch (err) {
    console.error('Failed to fetch users:', err);
  }
});
</script>

<style scoped>
.page-container { padding: 24px; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
.data-table th { background-color: #f1f5f9; }
</style>
