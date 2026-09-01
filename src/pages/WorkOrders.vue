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

      <button @click="openCreateModal" class="btn-create">
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

    <!-- Table preview Section -->
    <div v-else class="table-container">
      <div class="table-responsive">
        <table class="minimal-table">
          <thead>
            <tr>
              <th>WO Code</th>
              <th>Judul Tugas</th>
              <th>Laporan Terkait</th>
              <th>Teknisi Penanggung Jawab</th>
              <th>Status</th>
              <th>Tanggal Penugasan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="orders.length === 0">
              <td colspan="6" class="empty-cell">Belum ada Work Order aktif di sistem.</td>
            </tr>
            <tr v-for="item in orders" :key="item._id || item.id">
              <td class="code-cell">{{ item.code || item._id?.substring(0, 8) }}</td>
              <td class="title-cell">{{ item.title }}</td>
              <td>
                <span v-if="item.reportId" class="badge-report">{{ item.reportId }}</span>
                <span v-else class="text-muted">Mandiri (Tanpa Laporan)</span>
              </td>
              <td>
                <!-- Pengecekan Dinamis Penanganan Array / Object Teknisi -->
                <span v-if="item.assignedTechnicianIds && item.assignedTechnicianIds.length > 0">
                  <template v-if="typeof item.assignedTechnicianIds[0] === 'object'">
                    {{ item.assignedTechnicianIds.map(t => t.name || t.email).join(', ') }}
                  </template>
                  <template v-else-if="item.technicianName || item.technicianEmail">
                    {{ item.technicianName || item.technicianEmail }}
                  </template>
                  <template v-else>
                    {{ item.assignedTechnicianIds.length }} Teknisi Ditugaskan
                  </template>
                </span>
                <span v-else-if="item.technicianName || item.technicianEmail">
                  {{ item.technicianName || item.technicianEmail }}
                </span>
                <span v-else class="text-muted">Belum ditugaskan</span>
              </td>
              <td>
                <span :class="['badge-status', item.status?.toLowerCase()]">
                  {{ item.status || 'ASSIGNED' }}
                </span>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Create Work Order -->
    <Transition name="fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Buat Work Order Baru</h3>
            <button @click="showCreateModal = false" class="btn-close">&times;</button>
          </div>
          
          <form @submit.prevent="handleCreateWO">
            <!-- 1. Dropdown Pilih Laporan (OPSIONAL) -->
            <div class="form-group">
              <label>Pilih Laporan Terkait (Opsional):</label>
              <select v-model="newWO.reportId" class="input-control" :disabled="loadingReports">
                <option value="">-- Tanpa Laporan (Tugas Mandiri / Pemeliharaan) --</option>
                <option 
                  v-for="rep in reportsList" 
                  :key="rep._id || rep.reportId" 
                  :value="rep.reportId || rep._id"
                >
                  {{ rep.reportId ? rep.reportId : (rep.title || 'Laporan Tanpa ID') }}
                </option>
              </select>
            </div>

            <!-- 2. Input Judul Tugas (WAJIB) -->
            <div class="form-group">
              <label>Judul Tugas / Deskripsi Pekerjaan:</label>
              <input 
                type="text" 
                v-model="newWO.title" 
                required 
                placeholder="Contoh: Pemeliharaan Rutin Server Lantai 2" 
                class="input-control" 
              />
            </div>

            <!-- 3. Unggah Dokumen PDF (WAJIB) -->
            <div class="form-group">
              <label>Dokumen PDF (Wajib: Awalan "Infrastructure_Report_"):</label>
              <input 
                type="file" 
                accept=".pdf,application/pdf"
                @change="handleFileChange"
                required
                class="file-control"
              />
              <span v-if="fileError" class="error-text">{{ fileError }}</span>
              <span v-else-if="selectedFile" class="file-info-text">
                File terpilih: <strong>{{ selectedFile.name }}</strong>
              </span>
            </div>

            <!-- 4. Pilihan Teknisi Dropdown (WAJIB) -->
            <div class="form-group">
              <label>Pilih Teknisi Penanggung Jawab:</label>
              <select v-model="newWO.technicianId" required class="input-control" :disabled="loadingTechs">
                <option value="" disabled>-- {{ loadingTechs ? 'Memuat Teknisi...' : 'Pilih Teknisi' }} --</option>
                <option 
                  v-for="tech in technicians" 
                  :key="tech.id || tech._id" 
                  :value="tech.id || tech._id"
                >
                  {{ tech.name }} ({{ tech.specialization || 'Umum' }}) - {{ tech.email }}
                </option>
              </select>

              <!-- Pagination Teknisi -->
              <div class="pagination-controls" v-if="pagination.totalPages > 1">
                <button 
                  type="button" 
                  class="btn-page" 
                  :disabled="!pagination.hasPrevPage || loadingTechs" 
                  @click="changeTechPage(pagination.currentPage - 1)"
                >
                  &laquo; Prev
                </button>
                <span class="page-info">Hal {{ pagination.currentPage }} / {{ pagination.totalPages }}</span>
                <button 
                  type="button" 
                  class="btn-page" 
                  :disabled="!pagination.hasNextPage || loadingTechs" 
                  @click="changeTechPage(pagination.currentPage + 1)"
                >
                  Next &raquo;
                </button>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-cancel">Batal</button>
              <button 
                type="submit" 
                :disabled="creating || !newWO.technicianId || !newWO.title || !selectedFile || !!fileError" 
                class="btn-primary"
              >
                {{ creating ? 'Menyimpan...' : 'Terbitkan WO' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { adminApi, managerApi, getTechnicians } from '../services/api';

const router = useRouter();
const route = useRoute();

const orders = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);

const reportsList = ref([]);
const loadingReports = ref(false);

const technicians = ref([]);
const loadingTechs = ref(false);
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
});

const newWO = ref({
  reportId: '',
  title: '',
  technicianId: ''
});

const selectedFile = ref(null);
const fileError = ref('');

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

const fetchReportsList = async () => {
  loadingReports.value = true;
  try {
    const api = getApiClient();
    const endpoint = getUserData().role === 'ADMIN' ? '/api/admin/reports' : '/api/manager/reports';
    const res = await api.get(endpoint);
    reportsList.value = res.data.reports || res.data.data || res.data || [];
  } catch (err) {
    console.error('Gagal mengambil daftar laporan:', err);
  } finally {
    loadingReports.value = false;
  }
};

const fetchTechniciansList = async (page = 1) => {
  loadingTechs.value = true;
  try {
    const res = await getTechnicians(page, 5);
    technicians.value = res.data || [];
    if (res.pagination) {
      pagination.value = res.pagination;
    }
  } catch (err) {
    console.error('Gagal mengambil daftar teknisi:', err);
  } finally {
    loadingTechs.value = false;
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  fileError.value = '';
  selectedFile.value = null;

  if (!file) return;

  // 1. Validasi Tipe Harus PDF
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    fileError.value = 'File harus berformat PDF.';
    return;
  }

  // 2. Validasi Nama File Harus Diawali "Infrastructure_Report_"
  if (!file.name.startsWith('Infrastructure_Report_')) {
    fileError.value = 'Nama file wajib diawali dengan "Infrastructure_Report_" (Contoh: Infrastructure_Report_01.pdf)';
    return;
  }

  selectedFile.value = file;
};

const openCreateModal = () => {
  showCreateModal.value = true;
  selectedFile.value = null;
  fileError.value = '';
  fetchTechniciansList(1);
  fetchReportsList();
};

const changeTechPage = (newPage) => {
  fetchTechniciansList(newPage);
};

const handleCreateWO = async () => {
  if (!selectedFile.value || fileError.value) {
    alert('Silakan sertakan file PDF yang valid terlebih dahulu.');
    return;
  }

  creating.value = true;
  try {
    const api = getApiClient();
    const user = getUserData();
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';

    // Menyusun payload FormData untuk multipart/form-data (upload file)
    const formData = new FormData();
    formData.append('title', newWO.value.title);
    if (newWO.value.reportId) {
      formData.append('reportId', newWO.value.reportId);
    }
    formData.append('assignedTechnicianIds', JSON.stringify([newWO.value.technicianId]));
    formData.append('pdfFile', selectedFile.value);

    await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    alert('Work Order berhasil dibuat!');
    showCreateModal.value = false;
    newWO.value = { reportId: '', title: '', technicianId: '' };
    selectedFile.value = null;
    fileError.value = '';
    fetchWorkOrders();
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal membuat Work Order baru.');
  } finally {
    creating.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

onMounted(() => {
  fetchWorkOrders();

  if (route.query.reportId) {
    newWO.value.reportId = route.query.reportId;
    newWO.value.title = route.query.title || '';
    openCreateModal();
  }
});
</script>

<style scoped>
/* Palette CSS Variables Dynamic Integration */
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: transparent;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --amber-color: #d97706;
  --emerald-color: #059669;
  --danger-color: #ef4444;
  --icon-bg-blue: #eff6ff;
  --icon-bg-amber: #fffbeb;
  --icon-bg-emerald: #ecfdf5;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: transparent;
  --primary-color: #3b82f6;
  --primary-hover: #60a5fa;
  --amber-color: #f59e0b;
  --emerald-color: #10b981;
  --danger-color: #f87171;
  --icon-bg-blue: #1e3a8a;
  --icon-bg-amber: #78350f;
  --icon-bg-emerald: #064e3b;
}

:global(html),
:global(body),
:global(#app) {
  background-color: var(--bg-main) !important;
  color: var(--text-main) !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.page-wrapper {
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* Header Section */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-left h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main) !important;
  letter-spacing: -0.5px;
}

.btn-back {
  background: transparent;
  border: none !important;
  outline: none !important;
  color: var(--primary-color) !important;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
}

.btn-back:hover { opacity: 0.8; }

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: var(--primary-color);
  color: #ffffff !important;
  border: none !important;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.btn-create:hover { background-color: var(--primary-hover); }

/* Table Container - Clean Flat Styling */
.table-container {
  background-color: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.table-responsive { overflow-x: auto; }

.minimal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--text-main) !important;
}

.minimal-table th, .minimal-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.minimal-table th {
  font-weight: 600;
  color: var(--text-muted) !important;
  font-size: 11px;
  text-transform: uppercase;
}

.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color) !important; }
.title-cell { font-weight: 600; color: var(--text-main) !important; }
.badge-report { font-family: monospace; font-size: 11px; background: var(--bg-main); padding: 3px 8px; border-radius: 6px; color: var(--text-main) !important; }
.text-muted { color: var(--text-muted) !important; font-size: 12px; font-style: italic; }
.empty-cell { text-align: center; color: var(--text-muted) !important; padding: 24px; }

.badge-status { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
.badge-status.assigned { background-color: var(--icon-bg-blue); color: var(--primary-color); }
.badge-status.in_progress { background-color: var(--icon-bg-amber); color: var(--amber-color); }
.badge-status.completed { background-color: var(--icon-bg-emerald); color: var(--emerald-color); }

/* Modal Design */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: var(--bg-card);
  color: var(--text-main) !important;
  width: 100%;
  max-width: 480px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main) !important; }
.btn-close { background: none; border: none; font-size: 22px; color: var(--text-muted); cursor: pointer; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-main) !important; }

.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--bg-main);
  border: none !important;
  outline: none !important;
  border-radius: 8px;
  color: var(--text-main) !important;
  font-size: 13px;
  box-sizing: border-box;
}

.file-control {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--bg-main);
  border: 1px dashed rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  color: var(--text-main) !important;
  font-size: 13px;
  box-sizing: border-box;
  cursor: pointer;
}

.error-text {
  display: block;
  font-size: 12px;
  color: var(--danger-color);
  margin-top: 4px;
}

.file-info-text {
  display: block;
  font-size: 12px;
  color: var(--emerald-color);
  margin-top: 4px;
}

.pagination-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.btn-page { background: var(--bg-main); border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; color: var(--text-main); cursor: pointer; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 12px; color: var(--text-muted) !important; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.btn-cancel { padding: 10px 18px; background: transparent; border: none !important; color: var(--text-muted) !important; font-weight: 600; cursor: pointer; }
.btn-primary { padding: 10px 18px; background-color: var(--primary-color); color: #ffffff !important; border: none !important; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Icons & Spinners */
.icon-sm { width: 16px; height: 16px; }
.state-card { background-color: var(--bg-card); border-radius: 16px; padding: 36px; text-align: center; color: var(--text-muted) !important; }
.spinner { width: 28px; height: 28px; margin: 0 auto 14px; border: 3px solid rgba(148, 163, 184, 0.2); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
