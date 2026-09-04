<template>
  <div class="landing-wrapper">
    <!-- Fluid Theme Toggle Switch (Sesuai Desain Gambar) -->
    <div class="theme-switch-container">
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

    <!-- Main Landing Card -->
    <div class="landing-card">
      <div class="brand-header">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h1>エサの ー Infrastructure Report</h1>
        <h2 class="subtitle">Page for Admin and Manager Control</h2>
        <p class="subtitle">Silakan pilih opsi akses untuk masuk ke sistem</p>
      </div>

      <!-- Action Options -->
      <div class="options-container">
        <!-- Reroute Penuh ke /visit -->
        <button @click="navigateTo('/visit')" class="btn-option btn-visit pulse-jump">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Visit Mode (Tamu)</span>
        </button>

        <button @click="navigateTo('/login')" class="btn-option btn-manager">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Login Akun</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentTheme = ref('light');

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

const navigateTo = (path) => {
  router.push(path);
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
  --primary-color: #2563eb;
  --border-color: rgba(148, 163, 184, 0.15);
  --switch-bg: #2d3748;
  --switch-handle-bg: #ffffff;
  --switch-icon-color: #0f172a;
  --card-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.05), 0 10px 15px -5px rgba(0, 0, 0, 0.03);
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --border-color: rgba(255, 255, 255, 0.08);
  --switch-bg: #020617;
  --switch-handle-bg: #1e293b;
  --switch-icon-color: #f8fafc;
  --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

/* MENELIMINASI MARGIN/PADDING SELURUH LAYAR */
:global(html),
:global(body) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
}

.landing-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  background-color: var(--bg-main);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  /* Transisi Gradasi Halus Saat Perubahan Warna Tema */
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* POSISI & DESAIN FLUID SWITCH TOGGLE (Sesuai Gambar) */
.theme-switch-container {
  position: absolute;
  top: 28px;
  right: 28px;
  z-index: 10;
}

.theme-toggle-switch {
  position: relative;
  width: 72px;
  height: 38px;
  background-color: var(--switch-bg);
  border-radius: 50px;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.4s ease;
}

.switch-handle {
  width: 30px;
  height: 30px;
  background-color: var(--switch-handle-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  /* Animasi Fluid Pegas / Spring Fluid */
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.4s ease;
  transform: translateX(0);
}

/* Tampilan Handle Saat Mode Dark Active */
.theme-toggle-switch.is-dark .switch-handle {
  transform: translateX(34px);
}

.switch-icon {
  width: 18px;
  height: 18px;
  color: var(--switch-icon-color);
  transition: color 0.3s ease;
}

/* LANDING CARD DENGAN TRANSISI TEMAL */
.landing-card {
  background-color: var(--bg-card);
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  box-sizing: border-box;
  transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}

.brand-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand-icon {
  width: 46px;
  height: 46px;
  color: var(--primary-color);
  margin-bottom: 12px;
  transition: color 0.4s ease;
}

.brand-header h1 {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
  transition: color 0.4s ease;
}

.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
  transition: color 0.4s ease;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.btn-option:active {
  transform: scale(0.98);
}

.pulse-jump {
  animation: jump 1.8s infinite ease-in-out;
  background-color: #10b981;
  color: #ffffff;
}

.pulse-jump:hover {
  background-color: #059669;
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.btn-manager {
  background-color: var(--primary-color);
  color: #ffffff;
}

.btn-manager:hover {
  opacity: 0.92;
}

.icon-sm { width: 18px; height: 18px; }
</style>
