<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <h3>Buat Work Order Baru</h3>

      <form @submit.prevent="handleSubmit">
        <!-- Title Input -->
        <div class="form-group">
          <label>Judul Tugas / Deskripsi:</label>
          <input
            v-model="title"
            type="text"
            placeholder="Contoh: Perbaikan Router Lantai 2"
            required
          />
        </div>

        <!-- Technician Dropdown Select -->
        <div class="form-group">
          <label>Pilih Teknisi Penanggung Jawab:</label>
          <div class="select-wrapper">
            <select v-model="selectedTechnicianId" required :disabled="loadingTechs">
              <option value="" disabled>-- Pilih Teknisi --</option>
              <option
                v-for="tech in technicians"
                :key="tech.id"
                :value="tech.id"
              >
                {{ tech.name }} ({{ tech.specialization }}) - {{ tech.email }}
              </option>
            </select>
          </div>

          <!-- Pagination Controls for Dropdown -->
          <div class="pagination-controls" v-if="pagination.totalPages > 1">
            <button
              type="button"
              class="btn-page"
              :disabled="!pagination.hasPrevPage || loadingTechs"
              @click="changePage(pagination.currentPage - 1)"
            >
              &laquo; Prev
            </button>

            <span class="page-info">
              Halaman {{ pagination.currentPage }} dari {{ pagination.totalPages }}
            </span>

            <button
              type="button"
              class="btn-page"
              :disabled="!pagination.hasNextPage || loadingTechs"
              @click="changePage(pagination.currentPage + 1)"
            >
              Next &raquo;
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn-submit" :disabled="submitting || !selectedTechnicianId">
            <span v-if="submitting">Memproses...</span>
            <span v-else>Terbitkan WO</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTechnicians, createWorkOrder } from '../services/api';

const props = defineProps({
  reportId: { type: String, required: true }
});

const emit = defineEmits(['close', 'created']);

const title = ref('');
const selectedTechnicianId = ref('');
const technicians = ref([]);
const loadingTechs = ref(false);
const submitting = ref(false);

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
});

const fetchTechniciansList = async (page = 1) => {
  loadingTechs.value = true;
  try {
    const res = await getTechnicians(page, 5); // 5 teknisi per halaman
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

const changePage = (newPage) => {
  fetchTechniciansList(newPage);
};

const handleSubmit = async () => {
  if (!selectedTechnicianId.value || !title.value) return;
  submitting.value = true;

  try {
    await createWorkOrder({
      reportId: props.reportId,
      title: title.value,
      assignedTechnicianIds: [selectedTechnicianId.value]
    });
    emit('created');
    emit('close');
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal menerbitkan Work Order');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchTechniciansList(1);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #1e293b;
  font-size: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.btn-page {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: #64748b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
