<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Portal Login Web</h2>
      <p class="subtitle">Infrastructure Report Management System</p>

      <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Pilih Role:</label>
          <select v-model="role" class="input-control">
            <option value="ADMIN">Admin System</option>
            <option value="MANAGER">Manager Lapangan</option>
          </select>
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="email" required placeholder="nama@domain.com" class="input-control" />
        </div>

        <div class="form-group">
          <label>Password:</label>
          <input type="password" v-model="password" required placeholder="••••••••" class="input-control" />
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Logging in...' : `Masuk sebagai ${role}` }}
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
const role = ref('ADMIN');
const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    let data;
    if (role.value === 'ADMIN') {
      data = await loginAdmin(email.value, password.value);
    } else {
      data = await loginManager(email.value, password.value);
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || { email: email.value, role: role.value }));

    router.push('/dashboard');
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || 'Login gagal, periksa email & password.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8fafc; }
.login-card { width: 100%; max-width: 400px; padding: 32px; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.subtitle { color: #64748b; margin-bottom: 20px; font-size: 14px; }
.error-alert { background-color: #fef2f2; color: #dc2626; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
.form-group { margin-bottom: 16px; text-align: left; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
.input-control { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
.btn-submit { width: 100%; padding: 12px; background-color: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>
