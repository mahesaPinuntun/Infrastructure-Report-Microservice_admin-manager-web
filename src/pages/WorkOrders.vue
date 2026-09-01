<template>
  <div class="page-container">
    <div class="header-bar">
      <div class="header-left">
        <!-- Tombol Kembali ke Dashboard Utama -->
        <button @click="goToDashboard" class="btn-back">
          &larr; Kembali ke Dashboard Utama
        </button>
        <h2>Manajemen Surat Tugas (Work Orders)</h2>
      </div>

      <button @click="openCreateModal" class="btn-create">+ Buat Work Order Baru</button>
    </div>

    <div v-if="loading" class="loading-state">Memuat daftar Work Orders...</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>WO Code</th>
          <th>Judul Tugas</th>
          <th>Teknisi</th>
          <th>Status</th>
          <th>Tanggal Penugasan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="orders.length === 0">
          <td colSpan="5" class="empty-cell">Belum ada Work Order aktif.</td>
        </tr>
        <tr v-for="item in orders" :key="item._id || item.id">
          <td class="code-cell">{{ item.code || item._id?.substring(0, 8) }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.technicianName || item.technicianEmail || 'Belum ditugaskan' }}</td>
          <td>
            <span :class="['status-badge', item.status?.toLowerCase()]">
              {{ item.status || 'ASSIGNED' }}
            </span>
          </td>
          <td>{{ formatDate(item.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Create Work Order -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-card">
        <h3>Buat Work Order Baru</h3>
        <form @submit.prevent="handleCreateWO">
          
          <!-- 1. Input ID Laporan (Wajib untuk validasi backend manager-service) -->
          <div class="form-group">
            <label>ID Laporan (Report ID):</label>
            <input 
              type="text" 
              v-model="newWO.reportId" 
              required 
              placeholder="Masukkan ID Laporan (contoh: 64f1a2...)" 
              class="input-control" 
            />
          </div>

          <!-- 2. Input Judul Tugas -->
          <div class="form-group">
            <label>Judul Tugas / Deskripsi:</label>
            <input 
              type="text" 
              v-model="newWO.title" 
              required 
              placeholder="Contoh: Perbaikan Router Lantai 2" 
              class="input-control" 
            />
          </div>

          <!-- 3. Pilihan Teknisi Dropdown -->
          <div class="form-group">
            <label>Pilih Teknisi Penanggung Jawab:</label>
            <select v-model="newWO.technicianId" required class="input-control" :disabled="loadingTechs">
              <option value="" disabled>-- {{ loadingTechs ? 'Memuat Teknisi...' : 'Pilih Teknisi' }} --</option>
              <option 
                v-for="tech in technicians" 
                :key="tech.id" 
                :value="tech.id"
              >
                {{ tech.name }} ({{ tech.specialization || 'Umum' }}) - {{ tech.email }}
              </option>
            </select>

            <!-- Kontrol Pagination Dropdown -->
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
            <button type="submit" :disabled="creating || !newWO.technicianId || !newWO.reportId || !newWO.title" class="btn-primary">
              {{ creating ? 'Menyimpan...' : 'Terbitkan WO' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi, managerApi, getTechnicians } from '../services/api';

const router = useRouter();
const orders = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);

// State Teknisi & Pagination
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

const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');

const getApiClient = () => {
  const user = getUserData();
  return user.role === 'ADMIN' ? adminApi : managerApi;
};

// Navigasi Kembali ke Dashboard Sesuai Role
const goToDashboard = () => {
  const user = getUserData();
  const rawRole = (user.role || '').toUpperCase();
  const targetPath = (rawRole === 'MANAGER' || rawRole === 'INFRASTRUCTURE_MANAGER') ? '/manager' : '/admin';
  router.push(targetPath);
};

const fetchWorkOrders = async () => {
  try {
    const api = getApiClient();
    const user = getUserData();
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';
    const res = await api.get(endpoint);
    orders.value = res.data.workOrders || res.data || [];
  } catch (err) {
    console.error('Gagal memuat Work Orders:', err);
  } finally {
    loading.value = false;
  }
};

// Fetch Daftar Teknisi Berpaginasi
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

const openCreateModal = () => {
  showCreateModal.value = true;
  fetchTechniciansList(1);
};

const changeTechPage = (newPage) => {
  fetchTechniciansList(newPage);
};

onMounted(() => {
  fetchWorkOrders();
});

const handleCreateWO = async () => {
  creating.value = true;
  try {
    const api = getApiClient();
    const user = getUserData();
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';

    // Kirimkan reportId, title, dan array assignedTechnicianIds
    await api.post(endpoint, {
      reportId: newWO.value.reportId,
      title: newWO.value.title,
      assignedTechnicianIds: [newWO.value.technicianId]
    });

    alert('Work Order berhasil dibuat!');
    showCreateModal.value = false;
    newWO.value = { reportId: '', title: '', technicianId: '' };
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
</script>

<style scoped>
.page-container { padding: 24px; }
.header-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.header-left { display: flex; flex-direction: column; gap: 8px; }

.btn-back {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.header-left h2 { margin: 0; }
.btn-create { padding: 10px 16px; background-color: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.data-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
.data-table th { background-color: #f8fafc; font-weight: 600; color: #475569; }
.code-cell { font-family: monospace; font-weight: bold; color: #475569; }
.empty-cell { text-align: center; color: #94a3b8; padding: 24px; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.status-badge.assigned { background-color: #e0f2fe; color: #0284c7; }
.status-badge.completed { background-color: #dcfce7; color: #15803d; }
.status-badge.in_progress { background-color: #fef3c7; color: #d97706; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: #fff; width: 100%; max-width: 450px; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.modal-card h3 { margin-top: 0; margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; }
.input-control { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }

/* Pagination Controls Style */
.pagination-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.btn-page { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; }
.btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 12px; color: #64748b; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: transparent; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; }
.btn-primary { padding: 8px 16px; background-color: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
