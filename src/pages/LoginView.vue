<template>
  <div class="page-wrapper">
    <!-- Top Header Bar -->
    <header class="top-header">
      <div class="header-left">
        <router-link to="/" class="brand-logo">
          <!-- Logo Kanji 築 (Chiku) Small Badge -->
          <div class="kanji-logo-badge">
            <span class="kanji-badge-text">築</span>
          </div>
          <span class="brand-title">エサの ー Infrastructure Report</span>
        </router-link>
      </div>

      <div class="header-right">
        <!-- Fluid Theme Switch (Desain Kapsul Animasi) -->
        <div class="theme-switch-wrapper">
          <button 
            @click="toggleTheme" 
            class="theme-toggle-switch" 
            :class="{ 'is-dark': currentTheme === 'dark' }"
            title="Ubah Tema"
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

        <!-- Tombol Create Admin Account -->
        <router-link to="/register-admin" class="btn-admin-register">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
          <span class="btn-admin-text">Create Admin Account</span>
        </router-link>
      </div>
    </header>

    <!-- Main Container Card -->
    <main class="auth-container">
      <!-- CHUNK LOADING INITIALIZER -->
      <div v-if="initialLoading" class="auth-card skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-input" v-for="n in 3" :key="n"></div>
        <div class="skeleton-btn"></div>
      </div>

      <!-- MAIN FORM CONTENT -->
      <div v-else class="auth-card">
        <div class="auth-header">
          <h2>Selamat Datang</h2>
          <p class="subtitle">Masuk ke sistem manajemen infrastruktur</p>
        </div>

        <!-- Alert Notifikasi -->
        <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

        <form @submit.prevent="handleLogin">
          <!-- Select Role Portal -->
          <div class="form-group">
            <label>Login Sebagai *</label>
            <select v-model="form.role" class="input-control select-control">
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Manager Field</option>
              <option value="TECHNICIAN">Teknisi Lapangan</option>
              <option value="USER">User / Pelapor</option>
            </select>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label>Email Address *</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="nama@domain.com"
              required
              class="input-control"
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label>Password *</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
              class="input-control"
            />
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-submit" :disabled="submitting">
            <span v-if="submitting" class="btn-loading-state">
              <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Login...
            </span>
            <span v-else>Masuk ke Akun</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Butuh bantuan akses? Hubungi Tim Admin Infrastruktur.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const initialLoading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const currentTheme = ref('light');

const form = ref({
  email: '',
  password: '',
  role: 'ADMIN'
});

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'https://infrastructure-report-microservice-auth-service.vercel.app';

// Terapkan tema ke DOM
const applyThemeToDOM = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
};

// Inisialisasi Tema dari Local Storage
const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  currentTheme.value = savedTheme;
  applyThemeToDOM(savedTheme);
};

// Toggle Tema (Light / Dark)
const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  localStorage.setItem('user-theme', newTheme);
  applyThemeToDOM(newTheme);
};

const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  submitting.value = true;

  try {
    let endpointRole = 'user';
    if (form.value.role === 'ADMIN') endpointRole = 'admin';
    if (form.value.role === 'MANAGER') endpointRole = 'manager';
    if (form.value.role === 'TECHNICIAN') endpointRole = 'technician';

    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login/${endpointRole}`, {
      email: form.value.email,
      password: form.value.password
    });

    const { token, user } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || { role: form.value.role, email: form.value.email }));

      successMessage.value = 'Login berhasil! Mengalihkan...';

      setTimeout(() => {
        const rawRole = (user?.role || form.value.role).toUpperCase();
        if (rawRole === 'ADMIN') {
          router.push('/admin');
        } else if (rawRole === 'MANAGER' || rawRole === 'INFRASTRUCTURE_MANAGER') {
          router.push('/manager');
        } else {
          router.push('/reports');
        }
      }, 1000);
    }
  } catch (err) {
    console.error('Error Login:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Email atau password salah.';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  initTheme();
  // Simulasi chunk/skeleton loading saat pertama membuka halaman
  setTimeout(() => {
    initialLoading.value = false;
  }, 400);
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
  --border-color: #cbd5e1;
  --input-bg: #ffffff;
  --header-bg: #ffffff;
  --header-border: #e2e8f0;
  --btn-admin-bg: #2563eb;
  --btn-admin-hover: #1d4ed8;
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --skeleton-bg: #e2e8f0;
}

:global([data-theme="dark"]),
:global(body[data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #475569;
  --input-bg: #334155;
  --header-bg: #1e293b;
  --header-border: #334155;
  --btn-admin-bg: #3b82f6;
  --btn-admin-hover: #2563eb;
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --skeleton-bg: #334155;
}

/* KONTROL GLOBAL BODY AGAR TIDAK ADA MARGIN/SCROLLBAR KANAN KIRI */
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

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* Header Navbar */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-main);
  font-weight: 800;
  font-size: 18px;
}

/* BADGE LOGO KANJI 築 (Chiku) */
.kanji-logo-badge {
  width: 32px;
  height: 32px;
  background-color: var(--btn-admin-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px -1px rgba(37, 99, 235, 0.4);
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

.kanji-badge-text {
  font-family: 'sans-serif', 'Noto Sans JP';
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.brand-title {
  letter-spacing: -0.3px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* FLUID THEME SWITCH STYLES (KAPSUL) */
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

/* Button Admin Register Top Right */
.btn-admin-register {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--btn-admin-bg);
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-admin-register:hover {
  background-color: var(--btn-admin-hover);
}

/* Card Content Area */
.auth-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.auth-card {
  background-color: var(--bg-card);
  width: 100%;
  max-width: 440px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
}

.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-main);
}

.input-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-main);
  box-sizing: border-box;
  transition: background-color 0.4s ease, border-color 0.2s ease;
}

.select-control {
  cursor: pointer;
}

.input-control:focus {
  outline: none;
  border-color: #2563eb;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: var(--btn-admin-bg);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-submit:hover {
  background-color: var(--btn-admin-hover);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-icon {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

.alert {
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.alert.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.alert.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: var(--text-muted);
}

.icon-sm {
  width: 16px;
  height: 16px;
}

/* CHUNK SKELETON ANIMATION FOR INITIAL LOAD */
.skeleton-card {
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-title {
  height: 28px;
  width: 50%;
  margin: 0 auto 12px;
  background-color: var(--skeleton-bg);
  border-radius: 6px;
}

.skeleton-subtitle {
  height: 16px;
  width: 70%;
  margin: 0 auto 24px;
  background-color: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-input {
  height: 42px;
  width: 100%;
  margin-bottom: 16px;
  background-color: var(--skeleton-bg);
  border-radius: 8px;
}

.skeleton-btn {
  height: 44px;
  width: 100%;
  margin-top: 8px;
  background-color: var(--skeleton-bg);
  border-radius: 8px;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .top-header {
    padding: 16px;
  }

  .btn-admin-text {
    display: none;
  }

  .auth-card {
    padding: 24px 16px;
  }
}
</style>
