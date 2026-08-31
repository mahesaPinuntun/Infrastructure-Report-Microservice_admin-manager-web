<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Login System Portal</h2>
      <p class="subtitle">Pilih role dan masukkan kredensial akun Anda</p>

      <form @submit.prevent="handleLogin">
        <!-- Role Selection -->
        <div class="form-group">
          <label for="role">Pilih Role Access</label>
          <select id="role" v-model="selectedRole">
            <option value="ADMIN">Administrator</option>
            <option value="MANAGER">Manager Field</option>
          </select>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="nama@domain.com"
            required
          />
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Memproses Login...</span>
          <span v-else>Login ke Dashboard</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginAdmin, loginManager } from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const selectedRole = ref('ADMIN');
const errorMessage = ref('');
const loading = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    let response;
    
    // 1. Panggil API sesuai role yang dipilih
    if (selectedRole.value === 'ADMIN') {
      response = await loginAdmin(email.value, password.value);
    } else {
      response = await loginManager(email.value, password.value);
    }

    // 2. Ekstrak token dan data user dari payload respon backend
    const token = response?.token || response?.data?.token;
    const userData = response?.user || response?.data?.user;

    if (!token || !userData) {
      throw new Error('Respon server tidak mengandung token atau data user yang valid.');
    }

    // 3. Simpan Token & User ke localStorage
    const effectiveRole = (userData.role || selectedRole.value).toUpperCase();
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id: userData.id || userData._id,
      email: userData.email,
      name: userData.name || userData.username || 'User',
      role: effectiveRole
    }));

    // 4. Hard Redirect langsung ke Dashboard sesuai Role
    const targetPath = effectiveRole === 'ADMIN' ? '/admin' : '/manager';
    window.location.href = targetPath;

  } catch (err) {
    console.error('Login Error:', err);
    errorMessage.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Login gagal. Periksa email dan password.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 16px;
}

.login-card {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #2563eb;
}

.error-alert {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.btn-login:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
