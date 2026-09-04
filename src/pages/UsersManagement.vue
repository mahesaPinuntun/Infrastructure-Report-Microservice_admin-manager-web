<template>
  <div class="users-page">
    <!-- Header Section -->
    <header class="header-section">
      <div class="header-left">
        <div class="top-nav">
          <router-link to="/admin" class="btn-back">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>{{ t('backToDashboard') }}</span>
          </router-link>
        </div>

        <div class="title-with-logo">
          <!-- Logo Kanji 築 (Chiku) Header -->
          <div class="kanji-logo-header">
            <span class="kanji-header-text">築</span>
          </div>
          <div>
            <h1 class="page-title">{{ t('userManagementTitle') }}</h1>
            <p class="subtitle">{{ t('userManagementSubtitle') }}</p>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <!-- Language Switcher (Pilihan Bahasa ID / EN) -->
        <div class="lang-switch-wrapper">
          <button 
            @click="toggleLanguage" 
            class="lang-toggle-switch"
            :class="{ 'is-en': currentLang === 'en' }"
            :title="currentLang === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'"
            aria-label="Toggle Language"
          >
            <span class="lang-option" :class="{ active: currentLang === 'id' }">ID</span>
            <span class="lang-option" :class="{ active: currentLang === 'en' }">EN</span>
            <span class="lang-slider"></span>
          </button>
        </div>

        <!-- Fluid Theme Switch (Desain Kapsul Animasi) -->
        <div class="theme-switch-wrapper">
          <button 
            @click="toggleTheme" 
            class="theme-toggle-switch" 
            :class="{ 'is-dark': currentTheme === 'dark' }"
            :title="currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'"
            aria-label="Toggle Theme"
          >
            <span class="switch-handle">
              <!-- Icon Matahari (Light Mode) -->
              <svg v-if="currentTheme === 'light'" class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              
              <!-- Icon Bulan (Dark Mode) -->
              <svg v-else class="switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
        </div>

        <!-- Tombol Tambah Akun Baru -->
        <button @click="showModal = true" class="btn-primary">+ {{ t('newAccount') }}</button>
      </div>
    </header>

    <!-- Alert Notifikasi -->
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>

    <!-- Modal Form Tambah User -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ t('addAccountTitle') }}</h3>
        </div>
        
        <form @submit.prevent="handleCreateUser">
          <div class="form-group">
            <label>{{ t('fullName') }} *</label>
            <input v-model="newUser.name" type="text" :placeholder="t('namePlaceholder')" required class="input-control" />
          </div>

          <div class="form-group">
            <label>{{ t('emailAddress') }} *</label>
            <input v-model="newUser.email" type="email" placeholder="nama@domain.com" required class="input-control" />
          </div>

          <div class="form-group">
            <label>{{ t('phone') }} *</label>
            <input v-model="newUser.phoneNumber" type="tel" placeholder="081234567890" required class="input-control" />
          </div>

          <div class="form-group">
            <label>{{ t('password') }} *</label>
            <input v-model="newUser.password" type="password" placeholder="••••••••" required class="input-control" />
          </div>

          <div class="form-group">
            <label>{{ t('roleAccess') }} *</label>
            <select v-model="newUser.role" required class="input-control select-control">
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Manager Field</option>
              <option value="TECHNICIAN">Teknisi Lapangan</option>
              <option value="USER">User / Reporter</option>
            </select>
          </div>

          <!-- Dynamic Field: Secret PIN jika Role ADMIN -->
          <div v-if="newUser.role === 'ADMIN'" class="form-group highlighted-group">
            <label class="text-danger">{{ t('adminPin') }} *</label>
            <input 
              v-model="newUser.adminPin" 
              type="password" 
              :placeholder="t('adminPinPlaceholder')" 
              required 
              class="input-control"
            />
            <small class="help-text">{{ t('adminPinHelp') }}</small>
          </div>

          <!-- Dynamic Field: Spesialisasi jika Role TECHNICIAN -->
          <div v-if="newUser.role === 'TECHNICIAN'" class="form-group">
            <label>{{ t('specialization') }}</label>
            <input v-model="newUser.specialization" type="text" :placeholder="t('specPlaceholder')" class="input-control" />
          </div>

          <!-- Dynamic Field: Departemen jika Role MANAGER atau USER -->
          <div v-if="['MANAGER', 'USER'].includes(newUser.role)" class="form-group">
            <label>{{ t('department') }}</label>
            <input v-model="newUser.department" type="text" :placeholder="t('deptPlaceholder')" class="input-control" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">{{ t('cancel') }}</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? t('processing') : t('saveAccount') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Content Area (Tabel Desktop & Kartu Mobile) -->
    <main class="content-area">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="table-container desktop-only">
        <div class="skeleton-container">
          <div v-for="n in 5" :key="n" class="skeleton-row">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
      </div>

      <div v-else class="table-container desktop-only">
        <table class="users-table">
          <thead>
            <tr>
              <th>{{ t('colName') }}</th>
              <th>{{ t('colEmail') }}</th>
              <th>{{ t('colRole') }}</th>
              <th>{{ t('colPhone') }}</th>
              <th>{{ t('colInfo') }}</th>
              <th>{{ t('colStatus') }}</th>
              <th>{{ t('colAction') }}</th>
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
                <small v-if="user.specialization">{{ t('specLabel') }}: {{ user.specialization }}</small>
                <small v-else-if="user.department">{{ t('deptLabel') }}: {{ user.department }}</small>
                <small v-else class="text-muted">-</small>
              </td>
              <td>
                <span :class="['status-badge', (user.status || 'ACTIVE').toLowerCase()]">
                  {{ user.status || 'ACTIVE' }}
                </span>
              </td>
              <td>
                <button @click="handleDeleteUser(user.id || user._id)" class="btn-danger-sm">{{ t('delete') }}</button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="empty-state">{{ t('noUsers') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Layout Mobile (Kartu Responsif) -->
      <div v-if="!loading" class="mobile-grid mobile-only">
        <div v-if="users.length === 0" class="empty-state">{{ t('noUsers') }}</div>
        <article v-for="user in users" :key="user.id || user._id" class="user-card">
          <div class="card-header">
            <div>
              <h3 class="user-name">{{ user.name }}</h3>
              <p class="user-email">{{ user.email }}</p>
            </div>
            <span :class="['status-badge', (user.status || 'ACTIVE').toLowerCase()]">
              {{ user.status || 'ACTIVE' }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="info-label">{{ t('colRole') }}:</span>
              <span :class="['role-badge', formatRoleClass(user.role)]">
                {{ formatRoleName(user.role) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('colPhone') }}:</span>
              <span class="phone-text">{{ user.phoneNumber || user.phone || '-' }}</span>
            </div>
            <div class="info-row" v-if="user.specialization || user.department">
              <span class="info-label">{{ t('colInfo') }}:</span>
              <span>{{ user.specialization ? t('specLabel') + ': ' + user.specialization : t('deptLabel') + ': ' + user.department }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button @click="handleDeleteUser(user.id || user._id)" class="btn-danger-sm full-width">{{ t('deleteAccount') }}</button>
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
const currentLang = ref('id');

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

// KAMUS TRANSLASI (i18n)
const translations = {
  id: {
    backToDashboard: 'Kembali ke Dashboard',
    userManagementTitle: 'Manajemen Pengguna & Role',
    userManagementSubtitle: 'Kelola seluruh akun pengguna sistem infrastruktur',
    newAccount: 'Akun Baru',
    addAccountTitle: 'Tambah Akun Pengguna Baru',
    fullName: 'Nama Lengkap',
    namePlaceholder: 'Masukkan nama',
    emailAddress: 'Email Address',
    phone: 'Nomor Telepon / WA',
    password: 'Password',
    roleAccess: 'Role Access',
    adminPin: 'Secret PIN Admin',
    adminPinPlaceholder: 'Masukkan Secret PIN Admin',
    adminPinHelp: 'Diperlukan untuk memverifikasi pendaftaran Administrator baru.',
    specialization: 'Spesialisasi Teknisi',
    specPlaceholder: 'Contoh: Fiber Optic / AC / Listrik',
    department: 'Departemen / Divisi',
    deptPlaceholder: 'Contoh: Divisi Maintenance / Umum',
    cancel: 'Batal',
    saveAccount: 'Simpan Akun',
    processing: 'Memproses...',
    colName: 'Nama',
    colEmail: 'Email',
    colRole: 'Role',
    colPhone: 'No. Telepon / WA',
    colInfo: 'Info Tambahan',
    colStatus: 'Status',
    colAction: 'Aksi',
    delete: 'Hapus',
    deleteAccount: 'Hapus Akun',
    noUsers: 'Belum ada pengguna terdaftar.',
    specLabel: 'Spesialisasi',
    deptLabel: 'Dept',
    confirmDelete: 'Apakah Anda yakin ingin menghapus pengguna ini?'
  },
  en: {
    backToDashboard: 'Back to Dashboard',
    userManagementTitle: 'User & Role Management',
    userManagementSubtitle: 'Manage all system user accounts for infrastructure',
    newAccount: 'New Account',
    addAccountTitle: 'Add New User Account',
    fullName: 'Full Name',
    namePlaceholder: 'Enter full name',
    emailAddress: 'Email Address',
    phone: 'Phone / WhatsApp Number',
    password: 'Password',
    roleAccess: 'Role Access',
    adminPin: 'Admin Secret PIN',
    adminPinPlaceholder: 'Enter Admin Secret PIN',
    adminPinHelp: 'Required to verify new Administrator registration.',
    specialization: 'Technician Specialization',
    specPlaceholder: 'E.g., Fiber Optic / HVAC / Electrical',
    department: 'Department / Division',
    deptPlaceholder: 'E.g., Maintenance Division / General',
    cancel: 'Cancel',
    saveAccount: 'Save Account',
    processing: 'Processing...',
    colName: 'Name',
    colEmail: 'Email',
    colRole: 'Role',
    colPhone: 'Phone / WA',
    colInfo: 'Additional Info',
    colStatus: 'Status',
    colAction: 'Action',
    delete: 'Delete',
    deleteAccount: 'Delete Account',
    noUsers: 'No registered users found.',
    specLabel: 'Specialty',
    deptLabel: 'Dept',
    confirmDelete: 'Are you sure you want to delete this user?'
  }
};

const t = (key) => {
  return translations[currentLang.value]?.[key] || key;
};

// LANGUAGE TOGGLE FUNCTION
const initLanguage = () => {
  const savedLang = localStorage.getItem('user-lang') || 'id';
  currentLang.value = savedLang;
};

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'id' ? 'en' : 'id';
  localStorage.setItem('user-lang', currentLang.value);
};

// THEME TOGGLE LOGIC
const applyThemeToDOM = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  currentTheme.value = savedTheme;
  applyThemeToDOM(savedTheme);
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  localStorage.setItem('user-theme', newTheme);
  applyThemeToDOM(newTheme);
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

    if (['MANAGER', 'USER'].includes(newUser.value.role) && newUser.value.department) {
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
  if (!confirm(t('confirmDelete'))) return;
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
  if (!role) return 'USER';
  return role.toUpperCase();
};

const formatRoleClass = (role) => {
  if (!role) return 'user';
  return role.toLowerCase();
};

onMounted(() => {
  initTheme();
  initLanguage();
  fetchUsers();
});
</script>

<style scoped>
:global(:root),
:global(html),
:global(body),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --table-hover: #f1f5f9;
  --input-bg: #ffffff;
  --skeleton-bg: #e2e8f0;
  --lang-btn-bg: #e2e8f0;
  --lang-btn-active: #ffffff;
  --lang-text-active: #2563eb;
  --modal-bg: #ffffff;
}

:global([data-theme="dark"]),
:global(body[data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --table-hover: #334155;
  --input-bg: #334155;
  --skeleton-bg: #334155;
  --lang-btn-bg: #334155;
  --lang-btn-active: #1e293b;
  --lang-text-active: #3b82f6;
  --modal-bg: #1e293b;
}

:global(html),
:global(body),
:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-height: 100vh !important;
  background-color: var(--bg-main) !important;
  overflow-x: hidden !important;
}

.users-page {
  min-height: 100vh;
  width: 100%;
  padding: 24px;
  background-color: var(--bg-main);
  color: var(--text-main);
  box-sizing: border-box;
  transition: background-color 0.4s ease, color 0.4s ease;
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
  margin-bottom: 12px;
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

.title-with-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kanji-logo-header {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px -2px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.kanji-header-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.subtitle {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* LANGUAGE SWITCHER STYLES */
.lang-switch-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.lang-toggle-switch {
  position: relative;
  width: 68px;
  height: 32px;
  background-color: var(--lang-btn-bg);
  border-radius: 50px;
  border: 1px solid var(--border-color);
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease;
}

.lang-option {
  position: relative;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  width: 28px;
  text-align: center;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.lang-option.active {
  color: var(--lang-text-active);
}

.lang-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 28px;
  height: 24px;
  background-color: var(--lang-btn-active);
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

.lang-toggle-switch.is-en .lang-slider {
  transform: translateX(32px);
}

/* FLUID THEME SWITCH STYLES */
.theme-switch-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.theme-toggle-switch {
  position: relative;
  width: 60px;
  height: 32px;
  background-color: var(--switch-bg);
  border-radius: 50px;
  border: none;
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.4s ease;
}

.switch-handle {
  width: 26px;
  height: 26px;
  background-color: var(--switch-handle-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.4s ease;
  transform: translateX(0);
}

.theme-toggle-switch.is-dark .switch-handle {
  transform: translateX(28px);
}

.switch-icon {
  width: 15px;
  height: 15px;
  color: var(--switch-icon-color);
  transition: color 0.3s ease;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: var(--primary-color);
  color: #ffffff;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-cancel {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-cancel:hover {
  background-color: var(--border-color);
}

.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
}

.alert.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: var(--modal-bg);
  color: var(--text-main);
  padding: 28px;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  animation: scaleUp 0.2s ease-out;
}

.modal-header h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 800;
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

.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--input-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
}

.input-control:focus {
  border-color: var(--primary-color);
}

.select-control {
  cursor: pointer;
}

.highlighted-group {
  background: rgba(239, 68, 68, 0.08);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
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

/* DESKTOP TABLE STYLES */
.table-container {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  font-size: 13px;
}

.users-table th {
  background: var(--bg-main);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.users-table tbody tr:hover {
  background-color: var(--table-hover);
}

/* BADGES */
.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.role-badge.admin { background: #dbeafe; color: #1e40af; }
.role-badge.manager { background: #fef3c7; color: #92400e; }
.role-badge.technician { background: #e0e7ff; color: #3730a3; }
.role-badge.user { background: var(--border-color); color: var(--text-main); }

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-block;
}

.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef3c7; color: #92400e; }

.btn-danger-sm {
  background: #ef4444;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-danger-sm:hover { background: #dc2626; }
.empty-state { text-align: center; color: var(--text-muted); padding: 24px; font-size: 13px; }

/* MOBILE CARD VIEW */
.mobile-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
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
  border-top: 1px dashed var(--border-color);
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

/* SKELETON ANIMATION */
.skeleton-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.skeleton-line {
  height: 20px;
  background-color: var(--skeleton-bg);
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* VISIBILITY RESPONSIVE RULES */
.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .users-page { padding: 16px; }
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .header-section { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: space-between; }
  .btn-primary { flex: 1; }
}
</style>
