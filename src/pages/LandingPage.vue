<template>
  <div class="landing-wrapper">
    <div class="landing-card">
      <div class="brand-header">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h1>Infrastructure Field System</h1>
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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
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
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --border-color: rgba(255, 255, 255, 0.08);
}

:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

.landing-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.landing-card {
  background-color: var(--bg-card);
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.brand-header {
  text-align: center;
  margin-bottom: 28px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.brand-header h1 {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
}

.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  transition: all 0.2s ease;
}

.pulse-jump {
  animation: jump 1.6s infinite ease-in-out;
  background-color: #059669;
  color: #ffffff;
}

.pulse-jump:hover {
  background-color: #047857;
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.btn-manager {
  background-color: var(--primary-color);
  color: #ffffff;
}

.icon-sm { width: 18px; height: 18px; }
</style>
