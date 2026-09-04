<template>
  <div class="page-container">
    <div class="top-bar">
      <router-link to="/reports" class="back-link">&larr; Kembali ke Daftar Laporan</router-link>
    </div>

    <div v-if="feedbackMessage" :class="['feedback-alert', feedbackType]">
      {{ feedbackMessage }}
    </div>

    <div v-if="loading" class="state-card loading-state">
      <div class="spinner"></div>
      <p>Memuat detail laporan...</p>
    </div>

    <div v-else-if="!report" class="state-card empty-state">
      <svg class="icon-lg text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="17"/>
      </svg>
      <p>Laporan tidak ditemukan atau gagal dimuat dari server.</p>
      <button @click="fetchReportDetail" class="btn-retry">Coba Lagi</button>
    </div>

    <div v-else class="detail-card">
      <div class="header-section">
        <div>
          <h2>{{ report.title || report.location || 'Detail Laporan Infrastruktur' }}</h2>
          <span class="category-tag">{{ report.category || report.infrastructureType || 'Infrastruktur Umum' }}</span>
        </div>
        <span :class="['status-badge', (report.status || 'PENDING').toLowerCase()]">
          {{ report.status || 'PENDING' }}
        </span>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label>ID Laporan:</label>
          <p class="code-text">{{ report._id || report.id || route.params.id }}</p>
        </div>
        <div class="info-item">
          <label>Pelapor:</label>
          <p>{{ report.reporterName || report.userName || report.userEmail || report.reporter || 'Anonim' }}</p>
        </div>
        <div class="info-item">
          <label>Lokasi:</label>
          <p>{{ report.location || report.locationName || 'Tidak dicantumkan' }}</p>
        </div>
        <div class="info-item">
          <label>Tanggal Dibuat:</label>
          <p>{{ formatDate(report.createdAt || report.date) }}</p>
        </div>
      </div>

      <div class="description-box">
        <label>Deskripsi Kerusakan:</label>
        <p>{{ report.description || report.details || 'Tidak ada deskripsi rinci.' }}</p>
      </div>

      <div v-if="imageUrl" class="image-box">
        <label>Foto Bukti Kerusakan:</label>
        <img :src="imageUrl" alt="Bukti Kerusakan" class="report-image" @error="handleImageError" />
      </div>

      <div class="action-panel">
        <h3>Update Status Laporan</h3>
        <div class="action-form">
          <select v-model="selectedStatus" class="input-select">
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button @click="updateReportStatus" :disabled="updating" class="btn-primary">
            {{ updating ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { adminApi, managerApi } from '../services/api';

const route = useRoute();
const report = ref(null);
const loading = ref(true);
const updating = ref(false);
const selectedStatus = ref('PENDING');

const feedbackMessage = ref('');
const feedbackType = ref('success');

// Normalisasi Role Pengguna
const getUserRole = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const rawRole = (storedUser.role || '').toString().trim().toUpperCase();
  return rawRole.includes('MANAGER') ? 'MANAGER' : rawRole;
};

const getApiClient = () => {
  const role = getUserRole();
  return role === 'ADMIN' ? adminApi : managerApi;
};

const imageUrl = computed(() => {
  if (!report.value) return '';
  return report.value.imageUrl || report.value.image || report.value.photoUrl || report.value.evidenceUrl || '';
});

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

const showFeedback = (msg, type = 'success') => {
  feedbackMessage.value = msg;
  feedbackType.value = type;
  setTimeout(() => {
    feedbackMessage.value = '';
  }, 4000);
};

// Fungsi Utama Fetching Detail Laporan dengan Fallback Mechanism
const fetchReportDetail = async () => {
  const reportId = route.params.id;
  if (!reportId) return;

  loading.value = true;
  feedbackMessage.value = '';

  try {
    const role = getUserRole();
    const primaryApi = getApiClient();
    const primaryEndpoint = role === 'ADMIN' 
      ? `/api/admin/reports/${reportId}` 
      : `/api/manager/reports/${reportId}`;

    let res;
    try {
      res = await primaryApi.get(primaryEndpoint);
    } catch (primaryErr) {
      console.warn('Gagal memuat lewat API utama, mencoba fallback endpoint...', primaryErr);
      // Fallback: coba endpoint seberang jika endpoint awal gagal 404/403
      const fallbackApi = role === 'ADMIN' ? managerApi : adminApi;
      const fallbackEndpoint = role === 'ADMIN' 
        ? `/api/manager/reports/${reportId}` 
        : `/api/admin/reports/${reportId}`;

      res = await fallbackApi.get(fallbackEndpoint);
    }

    const rawData = res?.data?.report || res?.data?.data || res?.data;

    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Data laporan tidak ditemukan.');
    }

    report.value = rawData;

    if (report.value?.status) {
      selectedStatus.value = report.value.status.toString().toUpperCase();
    }
  } catch (err) {
    console.error('Gagal mengambil detail laporan:', err);
    report.value = null;
    showFeedback(
      err.response?.data?.error || err.response?.data?.message || 'Gagal memuat detail laporan dari server.',
      'error'
    );
  } finally {
    loading.value = false;
  }
};

// Update Status Laporan
const updateReportStatus = async () => {
  if (!selectedStatus.value) return;
  updating.value = true;

  try {
    const role = getUserRole();
    const reportId = route.params.id;
    const primaryApi = getApiClient();

    const primaryEndpoint = role === 'ADMIN'
      ? `/api/admin/reports/${reportId}/status`
      : `/api/manager/reports/${reportId}/status`;

    try {
      await primaryApi.patch(primaryEndpoint, { status: selectedStatus.value });
    } catch (patchErr) {
      // Fallback jika API menggunakan method PUT
      await primaryApi.put(primaryEndpoint, { status: selectedStatus.value });
    }

    if (report.value) {
      report.value.status = selectedStatus.value;
    }

    showFeedback('Status laporan berhasil diperbarui!', 'success');
  } catch (err) {
    console.error('Gagal memperbarui status:', err);
    showFeedback(
      err.response?.data?.error || err.response?.data?.message || 'Gagal memperbarui status laporan.',
      'error'
    );
  } finally {
    updating.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Reaktif saat ID di URL berubah
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchReportDetail();
  }
);

onMounted(() => {
  fetchReportDetail();
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --box-bg: #f8fafc;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --box-bg: #0f172a;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
}

.page-container { 
  padding: 24px; 
  max-width: 900px; 
  margin: 0 auto; 
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
}

.top-bar { 
  margin-bottom: 20px; 
}

.back-link { 
  color: var(--primary-color); 
  text-decoration: none; 
  font-weight: 600; 
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.feedback-alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
}

.feedback-alert.success {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.feedback-alert.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.detail-card { 
  background: var(--bg-card); 
  border-radius: 12px; 
  border: 1px solid var(--border-color); 
  padding: 28px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); 
}

.header-section { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 20px; 
  border-bottom: 1px solid var(--border-color); 
  padding-bottom: 16px; 
}

.header-section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
}

.category-tag {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  display: inline-block;
  margin-top: 4px;
}

.status-badge { 
  padding: 6px 12px; 
  border-radius: 20px; 
  font-size: 11px; 
  font-weight: bold; 
  text-transform: uppercase; 
}

.status-badge.pending { background-color: #fef3c7; color: #d97706; }
.status-badge.in_progress { background-color: #e0f2fe; color: #0284c7; }
.status-badge.resolved { background-color: #dcfce7; color: #15803d; }
.status-badge.rejected { background-color: #fee2e2; color: #b91c1c; }

.info-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 16px; 
  margin-bottom: 20px; 
}

.info-item label { 
  font-size: 11px; 
  color: var(--text-muted); 
  font-weight: 700; 
  text-transform: uppercase;
}

.info-item p { 
  margin: 4px 0 0 0; 
  font-size: 14px; 
  color: var(--text-main); 
  font-weight: 600; 
}

.code-text {
  font-family: monospace;
  color: var(--primary-color) !important;
}

.description-box, .image-box { 
  margin-bottom: 20px; 
}

.description-box label, .image-box label { 
  font-size: 11px; 
  color: var(--text-muted); 
  font-weight: 700; 
  text-transform: uppercase;
  display: block; 
  margin-bottom: 6px; 
}

.description-box p {
  background: var(--box-bg);
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin: 0;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.5;
}

.report-image { 
  max-width: 100%; 
  max-height: 400px; 
  border-radius: 8px; 
  border: 1px solid var(--border-color); 
  object-fit: cover;
}

.action-panel { 
  background: var(--box-bg); 
  padding: 20px; 
  border-radius: 8px; 
  border: 1px solid var(--border-color); 
}

.action-panel h3 { 
  margin: 0 0 12px 0; 
  font-size: 14px; 
  color: var(--text-main); 
  font-weight: 700;
}

.action-form { 
  display: flex; 
  gap: 12px; 
}

.input-select { 
  padding: 8px 12px; 
  border-radius: 6px; 
  border: 1px solid var(--border-color); 
  font-size: 14px; 
  background-color: var(--bg-card);
  color: var(--text-main);
  outline: none;
}

.btn-primary { 
  padding: 8px 18px; 
  background-color: var(--primary-color); 
  color: #fff; 
  border: none; 
  border-radius: 6px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state-card {
  text-align: center;
  padding: 48px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-muted);
  font-size: 14px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

.btn-retry {
  margin-top: 14px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.text-muted { color: var(--text-muted); }
.icon-lg { width: 36px; height: 36px; margin-bottom: 8px; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
