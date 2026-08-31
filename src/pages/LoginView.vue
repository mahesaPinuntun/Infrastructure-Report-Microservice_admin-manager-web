<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginAdmin, loginManager } from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const selectedRole = ref('ADMIN'); // 'ADMIN' atau 'MANAGER'
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
    const token = response.token || response.data?.token;
    const userData = response.user || response.data?.user;

    if (!token || !userData) {
      throw new Error('Respon server tidak mengandung token atau data user yang valid.');
    }

    // 3. WAJIB: Simpan Token & User (Memastikan role kapital)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id: userData.id || userData._id,
      email: userData.email,
      name: userData.name || userData.username,
      role: (userData.role || selectedRole.value).toUpperCase()
    }));

    // 4. Redirect Otomatis Berdasarkan Role
    const targetPath = (userData.role || selectedRole.value).toUpperCase() === 'ADMIN' ? '/admin' : '/manager';

    // Gunakan window.location.href untuk hard-redirect bersih (memastikan state router & localstorage re-sync)
    window.location.href = targetPath;

  } catch (err) {
    console.error('Login Error:', err);
    errorMessage.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Login gagal. Periksa email dan password.';
  } finally {
    loading.value = false;
  }
};
</script>
