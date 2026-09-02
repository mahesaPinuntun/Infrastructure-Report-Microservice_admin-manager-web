<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Registrasi Administrator</h2>
        <p class="subtitle">Buat akun pengelola sistem infrastruktur baru</p>
      </div>

      <!-- Alert Notifikasi -->
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

      <form @submit.prevent="handleRegister">
        <!-- Secret PIN Admin -->
        <div class="form-group highlighted-group">
          <label class="text-danger">Secret PIN Admin *</label>
          <input
            v-model="form.adminPin"
            type="password"
            placeholder="Masukkan Secret PIN Admin"
            required
            class="input-control"
          />
          <small class="help-text">PIN otorisasi khusus untuk mendaftarkan akun Administrator.</small>
        </div>

        <!-- Nama Lengkap -->
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Masukkan nama lengkap"
            required
            class="input-control"
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>Email Address *</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@domain.com"
            required
            class="input-control"
          />
        </div>

        <!-- Nomor Telepon / WA -->
        <div class="form-group">
          <label>Nomor Telepon / WhatsApp</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="081234567890"
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

        <!-- Konfirmasi Password -->
        <div class="form-group">
          <label>Konfirmasi Password *</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            class="input-control"
          />
        </div>

        <!-- Action Buttons -->
        <button type="submit" class="btn-submit" :disabled="submitting">
          <span v-if="submitting">Memproses Registrasi...</span>
          <span v-else>Daftar Administrator</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>Sudah punya akun? <router-link to="/login">Login di sini</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = ref({
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  adminPin: ''
});

// URL Auth Service API (Menyesuaikan Microservice backend)
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'https://infrastructure-report-microservice-auth-service.vercel.app';

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Validasi Password
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Konfirmasi password tidak cocok.';
    return;
  }

  if (form.value.password.length < 6) {
    errorMessage.value = 'Password minimal terdiri dari 6 karakter.';
    return;
  }

  submitting.value = true;

  try {
    const contactNum = form.value.phoneNumber || '';

    // Payload dikirim lengkap termasuk phone & phoneNumber
    const payload = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      adminPin: form.value.adminPin,
      role: 'ADMIN',
      phone: contactNum,
      phoneNumber: contactNum
    };

    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register/admin`, payload);

    successMessage.value = response.data?.message || 'Registrasi Admin berhasil! Silakan periksa email Anda untuk verifikasi.';
    
    // Reset Form
    form.value = {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      adminPin: ''
    };

    // Redirect otomatis ke halaman login setelah 3 detik
    setTimeout(() => {
      router.push('/login');
    }, 3000);

  } catch (err) {
    console.error('Error Admin Register:', err);
    errorMessage.value = err.response?.data?.error || err.response?.data?.message || 'Gagal melakukan registrasi Admin.';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  initTheme();
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #cbd5e1;
  --input-bg: #ffffff;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #475569;
  --input-bg: #334155;
}

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-main);
  padding: 24px;
  box-sizing: border-box;
}

.auth-card {
  background-color: var(--bg-card);
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  color: var(--text-main);
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
  transition: border-color 0.2s;
}

.input-control:focus {
  outline: none;
  border-color: #2563eb;
}

.highlighted-group {
  background-color: rgba(239, 68, 68, 0.08);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.text-danger {
  color: #ef4444 !important;
}

.help-text {
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
  display: block;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  font-size: 13px;
  color: var(--text-muted);
}

.auth-footer a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
