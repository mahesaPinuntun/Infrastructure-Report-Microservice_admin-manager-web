<template>
  <div class="users-page">
    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <div class="top-nav">
          <router-link to="/dashboard" class="btn-back">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali ke Dashboard
          </router-link>
        </div>
        <h1>Manajemen Pengguna & Role</h1>
        <p class="subtitle">Kelola seluruh akun pengguna sistem infrastruktur</p>
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

        <button @click="showModal = true" class="btn-primary">+ Akun Baru</button>
      </div>
    </header>

    <!-- Alert Notifikasi -->
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>

    <!-- Modal Form Tambah User -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <h3>Tambah Akun Pengguna Baru</h3>
        <form @submit.prevent="handleCreateUser">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input v-model="newUser.name" type="text" placeholder="Masukkan nama" required />
          </div>

          <div class="form-group">
            <label>Email Address *</label>
            <input v-model="newUser.email" type="email" placeholder="nama@domain.com" required />
          </div>

          <div class="form-group">
            <label>Nomor Telepon / WA *</label>
            <input v-model="newUser.phoneNumber" type="tel" placeholder="081234567890" required />
          </div>

          <div class="form-group">
            <label>Password *</label>
            <input v-model="newUser.password" type="password" placeholder="••••••••" required />
          </div>

          <div class="form-group">
            <label>Role Access *</label>
            <select v-model="newUser.role" required>
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Manager Field</option>
              <option value="TECHNICIAN">Teknisi Lapangan</option>
              <option value="USER">User / Reporter</option>
            </select>
          </div>

          <div v-if="newUser.role === 'ADMIN'" class="form-group highlighted-group">
            <label class="text-danger">Secret PIN Admin *</label>
            <input 
              v-model="newUser.adminPin" 
              type="password" 
              placeholder="Masukkan Secret PIN Admin" 
              required 
            />
            <small class="help-text">Diperlukan untuk memverifikasi pendaftaran Administrator baru.</small>
          </div>

          <div v-if="newUser.role === 'TECHNICIAN'" class="form-group">
            <label>Spesialisasi Teknisi</label>
            <input v-model="newUser.specialization" type="text" placeholder="Contoh: Fiber Optic / AC / Listrik" />
          </div>

          <div v-if="['INFRASTRUCTURE_MANAGER', 'USER', 'MANAGER'].includes(newUser.role)" class="form-group">
            <label>Departemen / Divisi</label>
            <input v-model="newUser.department" type="text" placeholder="Contoh: Divisi Maintenance / Umum" />
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

    <!-- Layout Desktop (Tabel) -->
    <main class="content-area">
      <div v-if="loading" class="loading-state">Memuat data pengguna...</div>

      <div v-else class="table-container desktop-only">
        <table class="users-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>No. Telepon / WA</th>
              <th>Info Tambahan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id || user._id">
              <td><strong>{{ user.name }}</strong></td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-badge', formatRoleClass(user.role)]">
                  {{ formatRoleName(user.role) }}
                </span>
              </td>
              <td>
                <span v-if="user.phoneNumber || user.phone" class="phone-text">
                  {{ user.phoneNumber || user.phone }}
                </span>
                <small v-else class="text-muted">-</small>
              </td>
              <td>
                <small v-if="user.specialization">Spesialisasi: {{ user.specialization }}</small>
                <small v-else-if="user.department">Dept: {{ user.department }}</small>
                <small v-else class="text-muted">-</small>
              </td>
              <td>
                <span :class="['status-badge', user.status?.toLowerCase()]">
                  {{ user.status || 'ACTIVE' }}
                </span>
              </td>
              <td>
                <button @click="handleDeleteUser(user.id || user._id)" class="btn-danger-sm">Hapus</button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="empty-state">Belum ada pengguna terdaftar.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Layout Mobile (Kartu Responsif) -->
      <div v-if="!loading" class="mobile-grid mobile-only">
        <div v-if="users.length === 0" class="empty-state">Belum ada pengguna terdaftar.</div>
        <article v-for="user in users" :key="user.id || user._id" class="user-card">
          <div class="card-header">
            <div>
              <h3 class="user-name">{{ user.name }}</h3>
              <p class="user-email">{{ user.email }}</p>
            </div>
            <span :class="['status-badge', user.status?.toLowerCase()]">
              {{ user.status || 'ACTIVE' }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="info-label">Role:</span>
              <span :class="['role-badge', formatRoleClass(user.role)]">
                {{ formatRoleName(user.role) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Telepon:</span>
              <span class="phone-text">{{ user.phoneNumber || user.phone || '-' }}</span>
            </div>
            <div class="info-row" v-if="user.specialization || user.department">
              <span class="info-label">Info:</span>
              <span>{{ user.specialization ? 'Spesialisasi: ' + user.specialization : 'Dept: ' + user.department }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button @click="handleDeleteUser(user.id || user._id)" class="btn-danger-sm full-width">Hapus Akun</button>
          </div>
        </article>
      </div>
    </main>
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
const currentTheme = ref('light');

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'ADMIN',
  adminPin: '',
  phoneNumber: '',
  specialization: '',
  department: ''
});

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

const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await getAllUsers();
    const userList = res?.users || res?.data?.users || res?.data || [];
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
    const contactNum = newUser.value.phoneNumber || '';

    const payload = {
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      role: newUser.value.role,
      phoneNumber: contactNum,
      phone: contactNum
    };

    if (newUser.value.role === 'ADMIN') {
      payload.adminPin = newUser.value.adminPin;
    }

    if (newUser.value.role === 'TECHNICIAN' && newUser.value.specialization) {
      payload.specialization = newUser.value.specialization;
    }

    if (['INFRASTRUCTURE_MANAGER', 'USER', 'MANAGER'].includes(newUser.value.role) && newUser.value.department) {
      payload.department = newUser.value.department;
    }

    const res = await createUser(payload);
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
  newUser.value = {
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    adminPin: '',
    phoneNumber: '',
    specialization: '',
    department: ''
  };
};

const formatRoleName = (role) => {
  if (role === 'INFRASTRUCTURE_MANAGER' || role === 'MANAGER') return 'MANAGER';
  return role || 'USER';
};

const formatRoleClass = (role) => {
  if (!role) return 'user';
  if (role === 'INFRASTRUCTURE_MANAGER' || role === 'MANAGER') return 'manager';
  return role.toLowerCase();
};

onMounted(() => {
  initTheme();
  fetchUsers();
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
  --table-hover: #f1f5f9;
  --input-bg: #ffffff;
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
  --table-hover: #334155;
  --input-bg: #0f172a;
}

/* Fullscreen Root Layout */
.users-page {
  min-height: 100vh;
  width: 100%;
  padding: 24px;
  background-color: var(--bg-main);
  color: var(--text-main);
  box-sizing: border-box;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.top-nav {
  margin-bottom: 8px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-back:hover {
  opacity: 0.8;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
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

.btn-primary {
  background: var(--primary-color);
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-cancel {
  background: var(--theme-toggle-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.alert.success { background: #dcfce7; color: #166534; }
.alert.error { background: #fee2e2; color: #991b1b; }

/* Modal Component */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 16px;
}

.modal-card {
  background: var(--bg-card);
  color: var(--text-main);
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--input-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
}

.highlighted-group {
  background: rgba(239, 68, 68, 0.1);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #fca5a5;
}

.text-danger { color: #dc2626 !important; }
.help-text { font-size: 11px; color: #ef4444; margin-top: 4px; display: block; }
.text-muted { color: var(--text-muted); font-style: italic; }
.phone-text { font-family: monospace; font-weight: 600; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Desktop Table Design */
.table-container {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
  width: 100%;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th,
.users-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.users-table th {
  background: var(--bg-main);
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table tbody tr:hover {
  background-color: var(--table-hover);
}

/* Badges */
.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  display: inline-block;
}

.role-badge.admin { background: #dbeafe; color: #1e40af; }
.role-badge.manager { background: #fef3c7; color: #92400e; }
.role-badge.technician { background: #e0e7ff; color: #3730a3; }
.role-badge.user { background: var(--theme-toggle-bg); color: var(--text-muted); }

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-block;
}

.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef3c7; color: #92400e; }

.btn-danger-sm {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.btn-danger-sm:hover { background: #dc2626; }
.empty-state, .loading-state { text-align: center; color: var(--text-muted); padding: 24px; }

/* Mobile Card View (Responsif Layar Kecil) */
.mobile-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.user-email {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  border-top: 1px border-dash var(--border-color);
  padding-top: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: var(--text-muted);
  font-size: 12px;
}

.full-width {
  width: 100%;
}

/* Visibility Rules untuk Responsif */
.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .users-page { padding: 16px; }
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .header-actions { width: 100%; justify-content: space-between; }
  .btn-primary { flex: 1; }
}
</style>
