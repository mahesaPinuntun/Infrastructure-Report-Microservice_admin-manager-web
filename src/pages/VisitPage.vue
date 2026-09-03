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
              <option value="INFRASTRUCTURE_MANAGER">Manager Field</option>
              <option value="TECHNICIAN">Teknisi Lapangan</option>
              <option value="USER">User / Reporter</option>
            </select>
          </div>

          <!-- Dynamic Field: Secret PIN jika Role ADMIN -->
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

          <!-- Dynamic Field: Spesialisasi jika Role TECHNICIAN -->
          <div v-if="newUser.role === 'TECHNICIAN'" class="form-group">
            <label>Spesialisasi Teknisi</label>
            <input v-model="newUser.specialization" type="text" placeholder="Contoh: Fiber Optic / AC / Listrik" />
          </div>

          <!-- Dynamic Field: Departemen jika Role MANAGER atau USER -->
          <div v-if="['INFRASTRUCTURE_MANAGER', 'USER'].includes(newUser.role)" class="form-group">
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

    <!-- Desktop View: Tabel Daftar Pengguna -->
    <div class="table-container desktop-view">
      <div v-if="loading" class="loading-state">Memuat data pengguna...</div>
      <table v-else class="users-table">
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

    <!-- Mobile View: Key-Value Card Layout (3 Baris × 2 Kolom Grid) -->
    <div class="mobile-view">
      <div v-if="loading" class="loading-state">Memuat data pengguna...</div>
      <div v-else-if="users.length === 0" class="empty-state">Belum ada pengguna terdaftar.</div>
      <div v-else class="cards-list">
        <div v-for="user in users" :key="user.id || user._id" class="user-card">
          <div class="card-grid">
            <!-- Row 1: Nama & Role -->
            <div class="grid-item">
              <span class="grid-label">Nama</span>
              <span class="grid-value primary-text">{{ user.name }}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">Role</span>
              <span class="grid-value">
                <span :class="['role-badge', formatRoleClass(user.role)]">
                  {{ formatRoleName(user.role) }}
                </span>
              </span>
            </div>

            <!-- Row 2: Email & No. Telepon -->
            <div class="grid-item">
              <span class="grid-label">Email</span>
              <span class="grid-value email-text">{{ user.email }}</span>
            </div>
            <div class="grid-item">
              <span class="grid-label">No. Telepon / WA</span>
              <span class="grid-value phone-text">
                {{ user.phoneNumber || user.phone || '-' }}
              </span>
            </div>

            <!-- Row 3: Status & Info Tambahan -->
            <div class="grid-item">
              <span class="grid-label">Status</span>
              <span class="grid-value">
                <span :class="['status-badge', user.status?.toLowerCase()]">
                  {{ user.status || 'ACTIVE' }}
                </span>
              </span>
            </div>
            <div class="grid-item">
              <span class="grid-label">Info Tambahan</span>
              <span class="grid-value">
                <span v-if="user.specialization">Spesialisasi: {{ user.specialization }}</span>
                <span v-else-if="user.department">Dept: {{ user.department }}</span>
                <span v-else class="text-muted">-</span>
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button @click="handleDeleteUser(user.id || user._id)" class="btn-danger-sm full-width">
              Hapus Akun
            </button>
          </div>
        </div>
      </div>
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
  role: 'ADMIN',
  adminPin: '',
  phoneNumber: '',
  specialization: '',
  department: ''
});

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

    if (['INFRASTRUCTURE_MANAGER', 'USER'].includes(newUser.value.role) && newUser.value.department) {
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
  if (role === 'INFRASTRUCTURE_MANAGER') return 'MANAGER';
  return role || 'USER';
};

const formatRoleClass = (role) => {
  if (!role) return 'user';
  if (role === 'INFRASTRUCTURE_MANAGER') return 'manager';
  return role.toLowerCase();
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
.modal-card { background: white; padding: 24px; border-radius: 8px; width: 100%; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #334155; }
.form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px; }

.highlighted-group { background: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fca5a5; }
.text-danger { color: #dc2626 !important; }
.help-text { font-size: 11px; color: #ef4444; margin-top: 4px; display: block; }
.text-muted { color: #94a3b8; font-style: italic; }
.phone-text { font-family: monospace; font-weight: 600; color: #0f172a; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

.table-container { background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
.users-table { width: 100%; border-collapse: collapse; text-align: left; }
.users-table th, .users-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
.users-table th { background: #f8fafc; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }

.role-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e2e8f0; }
.role-badge.admin { background: #dbeafe; color: #1e40af; }
.role-badge.manager { background: #fef3c7; color: #92400e; }
.role-badge.technician { background: #e0e7ff; color: #3730a3; }
.role-badge.user { background: #f1f5f9; color: #475569; }

.status-badge { font-size: 11px; font-weight: 700; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef3c7; color: #92400e; }

.btn-danger-sm { background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
.btn-danger-sm:hover { background: #dc2626; }
.empty-state, .loading-state { text-align: center; color: #64748b; padding: 24px; }

/* Responsive View Switcher */
.mobile-view { display: none; }
.desktop-view { display: block; }

/* Mobile Grid Styling (Card Key-Value 3 Baris x 2 Kolom) */
@media (max-width: 768px) {
  .desktop-view { display: none; }
  .mobile-view { display: block; }
  .users-page { padding: 16px; }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .header-section button {
    width: 100%;
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .user-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }

  /* Grid 3 Baris x 2 Kolom */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 12px 16px;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .grid-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .grid-value {
    font-size: 13px;
    color: #334155;
    word-break: break-word;
  }

  .primary-text {
    font-weight: 700;
    color: #0f172a;
  }

  .email-text {
    font-size: 12px;
    color: #2563eb;
  }

  .card-actions {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }

  .full-width {
    width: 100%;
    padding: 8px;
  }
}
</style>
