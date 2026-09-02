<template>
  <div class="landing-wrapper">
    <div class="landing-card">
      <div class="brand-header">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h1>Infrastructure Field System</h1>
        <p class="subtitle">Silakan pilih akses untuk masuk ke sistem</p>
      </div>

      <!-- Action Options -->
      <div class="options-container">
        <!-- Tombol Visit dengan Animasi Bouncing/Jumping -->
        <button @click="handleVisit" class="btn-option btn-visit pulse-jump">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Visit Mode (Tamu)</span>
        </button>

        <button @click="navigateTo('/login/manager')" class="btn-option btn-manager">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Login sebagai Manager</span>
        </button>

        <button @click="navigateTo('/login/admin')" class="btn-option btn-admin">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Login sebagai Admin</span>
        </button>
      </div>

      <!-- Section Khusus Visit Mode -->
      <Transition name="fade">
        <div v-if="isVisitMode" class="visit-section">
          <hr class="divider" />
          
          <div class="workflow-banner">
            <p>Ingin mempelajari alur kerja sistem operasional lapangan?</p>
            <button @click="navigateTo('/workflow')" class="btn-workflow">
              <span>Lihat Workflow Sistem</span>
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          <!-- Toggle Preview Tables -->
          <div class="table-toggle-buttons">
            <button 
              @click="activeTable = 'work-orders'" 
              :class="['btn-toggle', { active: activeTable === 'work-orders' }]"
            >
              Preview Work Orders
            </button>
            <button 
              @click="activeTable = 'reports'" 
              :class="['btn-toggle', { active: activeTable === 'reports' }]"
            >
              Preview Review Laporan
            </button>
          </div>

          <!-- Dynamic Table Content -->
          <div class="table-preview-box">
            <!-- Tabel Work Orders -->
            <div v-if="activeTable === 'work-orders'" class="table-responsive">
              <h4>Daftar Preview Work Orders</h4>
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>WO ID</th>
                    <th>Perusahaan</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="code-cell">WO-20260902-4778</td>
                    <td>Infrastructure_Report</td>
                    <td>Lantai 3 Gedung A</td>
                    <td><span class="badge-status assigned">ASSIGNED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Tabel Review Laporan -->
            <div v-else-if="activeTable === 'reports'" class="table-responsive">
              <h4>Daftar Preview Laporan Masuk</h4>
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>Laporan ID</th>
                    <th>Pelapor</th>
                    <th>Kategori Kerusakan</th>
                    <th>Status Review</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="code-cell">REP-88912</td>
                    <td>Pelapor Lapangan</td>
                    <td>Jaringan Fiber Optik Putus</td>
                    <td><span class="badge-status warning">PENDING</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isVisitMode = ref(false);
const activeTable = ref('work-orders');

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const handleVisit = () => {
  isVisitMode.value = true;
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
  max-width: 640px;
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
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 6px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

/* Animasi Jumping secara Loop */
.pulse-jump {
  animation: jump 1.6s infinite ease-in-out;
  background-color: #059669;
  color: #ffffff;
}

.pulse-jump:hover {
  background-color: #047857;
}

@keyframes jump {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.btn-manager {
  background-color: var(--primary-color);
  color: #ffffff;
}

.btn-admin {
  background-color: #4f46e5;
  color: #ffffff;
}

.divider {
  margin: 24px 0;
  border: none;
  border-top: 1px solid var(--border-color);
}

.workflow-banner {
  text-align: center;
  margin-bottom: 20px;
}

.workflow-banner p {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.btn-workflow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #d97706;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.table-toggle-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.btn-toggle {
  flex: 1;
  padding: 10px;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle.active {
  background-color: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.table-preview-box {
  background-color: var(--bg-main);
  padding: 16px;
  border-radius: 12px;
}

.table-preview-box h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-main);
}

.minimal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.minimal-table th, .minimal-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.minimal-table th {
  color: var(--text-muted);
  font-size: 11px;
}

.code-cell {
  font-family: monospace;
  font-weight: 700;
  color: var(--primary-color);
}

.badge-status {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-status.assigned { background: #eff6ff; color: #2563eb; }
.badge-status.warning { background: #fffbeb; color: #d97706; }

.icon-sm { width: 18px; height: 18px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
