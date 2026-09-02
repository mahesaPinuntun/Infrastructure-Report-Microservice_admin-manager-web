<template>
  <div class="page-wrapper">
    <!-- Header Bar -->
    <header class="header-bar">
      <div class="header-left">
        <button @click="goToDashboard" class="btn-back">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Kembali ke Dashboard Utama</span>
        </button>
        <h2>Manajemen Surat Tugas (Work Orders)</h2>
      </div>

      <button @click="showCreateModal = true" class="btn-create">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Buat Work Order Baru</span>
      </button>
    </header>

    <!-- State Card: Loading -->
    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>Memuat daftar Surat Tugas (Work Orders)...</p>
    </div>

    <!-- Table Preview Section -->
    <div v-else class="table-container">
      <div class="table-responsive">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>Surat ID</th>
              <th>Nama Perusahaan</th>
              <th>Pembuat Surat</th>
              <th>Lokasi Perbaikan</th>
              <th>Total Biaya</th>
              <th>Bukti Surat (Dokumen)</th>
              <th>Tanggal Buat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="orders.length === 0">
              <td colspan="7" class="empty-cell">Belum ada Work Order aktif di sistem.</td>
            </tr>
            <tr v-for="item in orders" :key="item._id || item.id">
              <td class="code-cell">{{ item.woCode || item._id?.substring(0, 8) }}</td>
              <td class="title-cell">{{ item.companyName || 'Infrastructure_Report' }}</td>
              <td>
                <div class="creator-cell">
                  <span class="creator-name">{{ item.createdBy || '-' }}</span>
                  <span v-if="item.createdByEmail" class="creator-email">{{ item.createdByEmail }}</span>
                </div>
              </td>
              <td>{{ item.locationName || '-' }}</td>
              <td class="price-cell">Rp {{ formatCurrency(item.grandTotal) }}</td>
              <td>
                <button @click="generateAndDownloadPDF(item)" class="btn-pdf-action">
                  <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Download PDF</span>
                </button>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Panggil Komponen Modal Terpisah -->
    <CreateWorkOrderModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="fetchWorkOrders"
    />

    <!-- Hidden Template Rendering PDF untuk Item yang Diunduh -->
    <div style="display: none;">
      <div v-if="activePdfItem" id="dynamic-pdf-area" class="pdf-document">
        <div class="pdf-header">
          <h2>SURAT TUGAS WORK ORDER</h2>
          <h3>{{ activePdfItem.companyName || 'Infrastructure_Report' }}</h3>
          <p><strong>ID Surat:</strong> {{ activePdfItem.woCode }}</p>
        </div>
        <hr class="pdf-divider" />
        <div class="pdf-meta">
          <div>
            <strong>Nama Pembuat Surat:</strong> {{ activePdfItem.createdBy }}
            <span v-if="activePdfItem.createdByEmail"> ({{ activePdfItem.createdByEmail }})</span>
          </div>
          <div>
            <strong>Tanggal Pembuatan:</strong> {{ formatDate(activePdfItem.createdAt) }}<br />
            <!-- PERBAIKAN 1: Tampilkan Tanggal Pelaksanaan -->
            <strong>Tanggal Pelaksanaan:</strong> {{ formatDate(activePdfItem.executionDate || activePdfItem.createdAt) }}
          </div>
        </div>

        <div class="pdf-section">
          <h4>1. Pendahuluan</h4>
          <p>{{ activePdfItem.introduction || '-' }}</p>
        </div>

        <div class="pdf-section">
          <h4>2. Lokasi Perbaikan & Tanggal Pelaksanaan</h4>
          <p><strong>Nama Tempat:</strong> {{ activePdfItem.locationName || '-' }}</p>
          <!-- PERBAIKAN 2: Tampilkan Tanggal Pelaksanaan di Seksi Lokasi -->
          <p><strong>Tanggal Pelaksanaan:</strong> {{ formatDate(activePdfItem.executionDate || activePdfItem.createdAt) }}</p>
          <p v-if="activePdfItem.mapsUrl"><strong>Google Maps URL:</strong> {{ activePdfItem.mapsUrl }}</p>
        </div>

        <div class="pdf-section">
          <h4>3. List Teknisi yang Dipekerjakan</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Nama Teknisi</th>
                <th>Email Teknisi</th>
                <th>Nomor Handphone</th>
                <th>Bayaran</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, idx) in (activePdfItem.technicians || [])" :key="idx">
                <td>{{ t.name }}</td>
                <td>{{ t.email }}</td>
                <!-- PERBAIKAN 3: Fallback ke t.phone || t.phoneNumber || '-' -->
                <td>{{ t.phone || t.phoneNumber || '-' }}</td>
                <td>Rp {{ formatCurrency(t.fee) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Bayaran Teknisi: <strong>Rp {{ formatCurrency(activePdfItem.totalTechnicianFee) }}</strong></p>
        </div>

        <div class="pdf-section">
          <h4>4. List Biaya Resource</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Nama Sumber Daya</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in (activePdfItem.resources || [])" :key="idx">
                <td>{{ r.name }}</td>
                <td>{{ r.quantity }}</td>
                <td>{{ r.unit }}</td>
                <td>Rp {{ formatCurrency(r.price) }}</td>
                <td>Rp {{ formatCurrency(r.subtotal || (r.quantity * r.price)) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Biaya Resource: <strong>Rp {{ formatCurrency(activePdfItem.totalResourceCost) }}</strong></p>
        </div>

        <div class="pdf-footer-summary">
          GRAND TOTAL BIAYA: Rp {{ formatCurrency(activePdfItem.grandTotal) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import html2pdf from 'html2pdf.js';
import { adminApi, managerApi } from '../services/api';
import CreateWorkOrderModal from './CreateWorkOrderModal.vue';

const router = useRouter();

const orders = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const activePdfItem = ref(null);

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');

const getApiClient = () => {
  const user = getUserData();
  return user.role === 'ADMIN' ? adminApi : managerApi;
};

const goToDashboard = () => {
  const user = getUserData();
  const rawRole = (user.role || '').toUpperCase();
  const targetPath = (rawRole === 'MANAGER' || rawRole === 'INFRASTRUCTURE_MANAGER') ? '/manager' : '/admin';
  router.push(targetPath);
};

const fetchWorkOrders = async () => {
  loading.value = true;
  try {
    const api = getApiClient();
    const user = getUserData();
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';
    const res = await api.get(endpoint);
    orders.value = res.data.workOrders || res.data.data || res.data || [];
  } catch (err) {
    console.error('Gagal memuat Work Orders:', err);
  } finally {
    loading.value = false;
  }
};

const generateAndDownloadPDF = async (item) => {
  activePdfItem.value = item;
  await nextTick();

  const element = document.getElementById('dynamic-pdf-area');
  if (!element) return;

  const pdfName = `WorkOrder_${item.woCode || item._id}.pdf`;

  const opt = {
    margin: 10,
    filename: pdfName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    activePdfItem.value = null;
  });
};

const formatCurrency = (val) => Number(val || 0).toLocaleString('id-ID');

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

onMounted(() => {
  initTheme();
  fetchWorkOrders();
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
  --emerald-color: #059669;
  --border-color: rgba(148, 163, 184, 0.15);
  --badge-bg: #f1f5f9;
  --badge-text: #334155;
  --btn-pdf-bg: #d97706;
  --btn-pdf-hover: #b45309;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --emerald-color: #10b981;
  --border-color: rgba(255, 255, 255, 0.08);
  --badge-bg: #334155;
  --badge-text: #cbd5e1;
  --btn-pdf-bg: #f59e0b;
  --btn-pdf-hover: #d97706;
}

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.table-container {
  background-color: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.minimal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.minimal-table th, .minimal-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.minimal-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
}

.empty-cell {
  text-align: center;
  color: var(--text-muted);
  padding: 24px !important;
}

.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color); }
.title-cell { font-weight: 600; }
.price-cell { font-weight: 700; color: var(--emerald-color); }

.creator-cell {
  display: flex;
  flex-direction: column;
}

.creator-name {
  font-weight: 600;
}

.creator-email {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-pdf-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--btn-pdf-bg);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-pdf-action:hover {
  background-color: var(--btn-pdf-hover);
}

.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 14px; height: 14px; }

.state-card { background-color: var(--bg-card); border-radius: 16px; padding: 36px; text-align: center; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; margin: 0 auto 14px; border: 3px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* CSS Khusus PDF Download */
.pdf-document { padding: 24px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; }
.pdf-header { text-align: center; }
.pdf-header h2 { margin: 0; font-size: 18px; }
.pdf-header h3 { margin: 4px 0; font-size: 14px; color: #333; }
.pdf-divider { margin: 16px 0; border: 0; border-top: 2px solid #333; }
.pdf-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
.pdf-section { margin-bottom: 16px; }
.pdf-section h4 { margin-bottom: 6px; font-size: 14px; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; text-align: left; color: #000000; }
.pdf-subtotal { text-align: right; margin-top: 6px; font-size: 12px; }
.pdf-footer-summary { text-align: right; font-size: 15px; font-weight: bold; padding: 12px; background: #e2e8f0; margin-top: 20px; color: #000000; }
</style>
