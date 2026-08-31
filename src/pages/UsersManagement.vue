<template>
  <div class="users-page">
    <div class="header-section">
      <div>
        <h1>Manajemen Pengguna & Role</h1>
        <p class="subtitle">Kelola seluruh akun pengguna sistem infrastruktur</p>
      </div>
      <button @click="showModal = true" class="btn-primary">+ Tambah Akun Baru</button>
    </div>

    <!-- Alert Notifikasi -->
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>

    <!-- Modal Form Tambah User -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <h3>Tambah Akun Pengguna Baru</h3>
        <form @submit.prevent="handleCreateUser">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="newUser.name" type="text" placeholder="Masukkan nama" required />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input v-model="newUser.email" type="email" placeholder="nama@domain.com" required />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input v-model="newUser.password" type="password" placeholder="••••••••" required />
          </div>

          <div class="form-group">
            <label>Role Access</label>
            <select v-model="newUser.role" required>
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Manager Field</option>
              <option value="TECHNICIAN">Teknisi Lapangan</option>
              <option value="USER">User / Reporter</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Memproses...' : 'Simpan Akun' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabel Daftar Pengguna -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">Memuat data pengguna...</div>
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id || user._id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span :class="['role-badge', user.role?.toLowerCase()]">{{ user.role }}</span></td>
            <td><span :class="['status-badge', user.status?.toLowerCase()]">{{ user.status || 'ACTIVE' }}</span></td>
            <td>
              <button @click="handleDeleteUser(user.id || user._id)" class="btn-danger-sm">Hapus</button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5" class="empty-state">Belum ada pengguna terdaftar.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createUser, getAllUsers, deleteUser } from '../services/api';

const users = ref([]);
const loading = ref(true);
const submitting = ref(false);
const showModal = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'ADMIN'
});

const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await getAllUsers();
    
    // Ekstrak array dari res.users, res.data.users, res.data, atau fallback ke []
    const userList = res?.users || res?.data?.users || res?.data || [];
    
    // Pastikan data yang dimasukkan benar-benar bertipe Array
    users.value = Array.isArray(userList) ? userList : [];
  } catch (err) {
    console.error('Gagal memuat pengguna:', err);
    errorMessage.value = err.response?.data?.error || 'Gagal mengambil daftar pengguna dari server.';
  } finally {
    loading.value = false;
  }
};

const handleCreateUser = async () => {
  submitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const res = await createUser(newUser.value);
    successMessage.value = res?.message || 'Akun berhasil dibuat!';
    closeModal();
    fetchUsers();
  } catch (err) {
    console.error('Gagal membuat akun:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Gagal membuat akun baru.';
  } finally {
    submitting.value = false;
  }
};

const handleDeleteUser = async (userId) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
  try {
    await deleteUser(userId);
    fetchUsers();
  } catch (err) {
    alert('Gagal menghapus pengguna.');
  }
};

const closeModal = () => {
  showModal.value = false;
  newUser.value = { name: '', email: '', password: '', role: 'ADMIN' };
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-page { padding: 24px; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.subtitle { color: #64748b; margin-top: 4px; }
.btn-primary { background: #2563eb; color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-primary:hover { background: #1d4ed8; }
.btn-cancel { background: #e2e8f0; color: #475569; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.alert { padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
.alert.success { background: #dcfce7; color: #166534; }
.alert.error { background: #fee2e2; color: #991b1b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50; }
.modal-card { background: white; padding: 24px; border-radius: 8px; width: 100%; max-width: 450px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
.form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

.table-container { background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
.users-table { width: 100%; border-collapse: collapse; text-align: left; }
.users-table th, .users-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
.users-table th { background: #f8fafc; color: #475569; font-size: 14px; }
.role-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e2e8f0; }
.role-badge.admin { background: #dbeafe; color: #1e40af; }
.role-badge.manager { background: #fef3c7; color: #92400e; }
.role-badge.technician { background: #e0e7ff; color: #3730a3; }
.btn-danger-sm { background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.empty-state, .loading-state { text-align: center; color: #64748b; padding: 24px; }
</style>
