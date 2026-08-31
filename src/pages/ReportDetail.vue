<template>
  <div class="page-container">
    <div class="top-bar">
      <router-link to="/reports" class="back-link">&larr; Kembali ke Daftar Laporan</router-link>
    </div>

    <div v-if="loading" class="loading-state">Memuat detail laporan...</div>

    <div v-else-if="!report" class="empty-state">Laporan tidak ditemukan.</div>

    <div v-else class="detail-card">
      <div class="header-section">
        <h2>{{ report.title || 'Detail Laporan Infrastruktur' }}</h2>
        <span :class="['status-badge', report.status?.toLowerCase()]">
          {{ report.status || 'PENDING' }}
        </span>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label>ID Laporan:</label>
          <p>{{ report._id || report.id }}</p>
        </div>
        <div class="info-item">
          <label>Pelapor:</label>
          <p>{{ report.reporterName || report.userEmail || 'Anonim' }}</p>
        </div>
        <div class="info-item">
          <label>Lokasi:</label>
          <p>{{ report.location || 'Tidak dicantumkan' }}</p>
        </div>
        <div class="info-item">
          <label>Tanggal Dibuat:</label>
          <p>{{ formatDate(report.createdAt) }}</p>
        </div>
      </div>

      <div class="description-box">
        <label>Deskripsi Kerusakan:</label>
        <p>{{ report.description || 'Tidak ada deskripsi rinci.' }}</p>
      </div>

      <div v-if="report.imageUrl" class="image-box">
        <label>Foto Bukti Kerusakan:</label>
        <img :src="report.imageUrl" alt="Bukti Kerusakan" class="report-image" />
      </div>

      <!-- Control Panel untuk Update Status -->
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { adminApi, managerApi } from '../services/api';

const route = useRoute();
const report = ref(null);
const loading = ref(true);
const updating = ref(false);
const selectedStatus = ref('PENDING');

const getApiClient = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'ADMIN' ? adminApi : managerApi;
};

onMounted(async () => {
  try {
    const api = getApiClient();
    const reportId = route.params.id;
    const res = await api.get(`/api/reports/${reportId}`);
    report.value = res.data.report || res.data;
    if (report.value?.status) {
      selectedStatus.value = report.value.status;
    }
  } catch (err) {
    console.error('Gagal mengambil detail laporan:', err);
  } finally {
    loading.value = false;
  }
});

const updateReportStatus = async () => {
  updating.value = true;
  try {
    const api = getApiClient();
    const reportId = route.params.id;
    await api.patch(`/api/reports/${reportId}/status`, { status: selectedStatus.value });
    if (report.value) {
      report.value.status = selectedStatus.value;
    }
    alert('Status laporan berhasil diperbarui!');
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal memperbarui status laporan.');
  } finally {
    updating.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
</script>

<style scoped>
.page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
.top-bar { margin-bottom: 20px; }
.back-link { color: #2563eb; text-decoration: none; font-weight: 600; }
.detail-card { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
.status-badge.pending { background-color: #fef3c7; color: #d97706; }
.status-badge.in_progress { background-color: #e0f2fe; color: #0284c7; }
.status-badge.resolved { background-color: #dcfce7; color: #15803d; }
.status-badge.rejected { background-color: #fee2e2; color: #b91c1c; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
.info-item label { font-size: 12px; color: #64748b; font-weight: 600; }
.info-item p { margin: 4px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 500; }
.description-box, .image-box { margin-bottom: 20px; }
.description-box label, .image-box label { font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 6px; }
.report-image { max-width: 100%; max-height: 400px; border-radius: 6px; border: 1px solid #e2e8f0; }
.action-panel { background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; }
.action-panel h3 { margin: 0 0 12px 0; font-size: 14px; color: #334155; }
.action-form { display: flex; gap: 12px; }
.input-select { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 14px; }
.btn-primary { padding: 8px 16px; background-color: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
</style>
