<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card wide-modal">
      <div class="modal-header">
        <h3>Buat Work Order Baru</h3>
        <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Header Grid -->
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Perusahaan:</label>
            <input type="text" v-model="form.companyName" class="input-control" />
          </div>
          <div class="form-group">
            <label>Nama Pembuat Surat (Auto):</label>
            <input type="text" :value="creatorName" readonly class="input-control readonly" />
          </div>
          <div class="form-group">
            <label>Tanggal Pembuatan Surat:</label>
            <input type="text" :value="formattedTodayDate" readonly class="input-control readonly" />
          </div>
          <!-- Input Baru: Tanggal Pelaksanaan Pekerjaan -->
          <div class="form-group">
            <label>Tanggal Pelaksanaan Pekerjaan *:</label>
            <input type="date" v-model="form.executionDate" required class="input-control" />
          </div>
        </div>

        <!-- Pendahuluan & Lokasi -->
        <div class="form-group">
          <label>Pendahuluan / Deskripsi Pekerjaan:</label>
          <textarea v-model="form.introduction" required placeholder="Tuliskan pendahuluan atau deskripsi perbaikan..." class="input-control textarea"></textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Lokasi Perbaikan (Nama Tempat):</label>
            <input type="text" v-model="form.locationName" required placeholder="Contoh: Gedung Server Lantai 2" class="input-control" />
          </div>
          <div class="form-group">
            <label>Google Maps URL (Opsional):</label>
            <input type="url" v-model="form.mapsUrl" placeholder="https://maps.google.com/..." class="input-control" />
          </div>
        </div>

        <!-- SECTION 1: Dynamic Dropdown List Teknisi -->
        <div class="section-box">
          <div class="section-header">
            <h4>List Teknisi yang Dipekerjakan</h4>
            <button type="button" @click="addTechnicianRow" class="btn-sm-add">+ Tambah Teknisi Lagi</button>
          </div>
          <div class="table-responsive">
            <table class="form-table">
              <thead>
                <tr>
                  <th>Pilih Teknisi (Cluster)</th>
                  <th>Email Teknisi</th>
                  <th>Nomor Handphone</th>
                  <th>Bayaran (Rp)</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tech, index) in form.technicians" :key="index">
                  <td>
                    <select 
                      v-model="tech.technicianId" 
                      @change="onTechnicianSelect(index)" 
                      required 
                      class="input-table select-table"
                      :disabled="loadingTechs"
                    >
                      <option value="" disabled>-- {{ loadingTechs ? 'Memuat Teknisi...' : 'Pilih Teknisi' }} --</option>
                      <option 
                        v-for="t in getAvailableOptionsForIndex(index)" 
                        :key="t.id || t._id" 
                        :value="t.id || t._id"
                      >
                        {{ t.name }} ({{ t.specialization || 'Umum' }})
                      </option>
                    </select>
                  </td>
                  <td><input type="email" v-model="tech.email" readonly placeholder="Otomatis terisi" class="input-table readonly" /></td>
                  <td><input type="tel" v-model="tech.phone" readonly placeholder="Otomatis terisi" class="input-table readonly" /></td>
                  <td><input type="number" v-model.number="tech.fee" min="0" required class="input-table" /></td>
                  <td class="text-center">
                    <button type="button" @click="removeTechnicianRow(index)" class="btn-remove" title="Hapus">&times;</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-summary">Total Bayaran Teknisi: <strong>Rp {{ formatCurrency(totalTechFee) }}</strong></div>
        </div>

        <!-- SECTION 2: Dynamic List Biaya Resource -->
        <div class="section-box">
          <div class="section-header">
            <h4>List Biaya Resource (Bahan & Peralatan)</h4>
            <button type="button" @click="addResource" class="btn-sm-add">+ Tambah Resource</button>
          </div>
          <div class="table-responsive">
            <table class="form-table">
              <thead>
                <tr>
                  <th>Nama Sumber Daya</th>
                  <th>Jumlah</th>
                  <th>Satuan</th>
                  <th>Harga Satuan (Rp)</th>
                  <th>Subtotal (Rp)</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(res, index) in form.resources" :key="index">
                  <td><input type="text" v-model="res.name" required placeholder="Nama Barang" class="input-table" /></td>
                  <td><input type="number" v-model.number="res.quantity" min="1" required class="input-table" /></td>
                  <td>
                    <select v-model="res.unit" class="input-table select-table">
                      <option value="pcs">pcs</option>
                      <option value="box">box</option>
                      <option value="KG">KG</option>
                      <option value="liter">liter</option>
                      <option value="meter">meter</option>
                    </select>
                  </td>
                  <td><input type="number" v-model.number="res.price" min="0" required class="input-table" /></td>
                  <td class="font-bold">Rp {{ formatCurrency((res.quantity || 0) * (res.price || 0)) }}</td>
                  <td class="text-center">
                    <button type="button" @click="removeResource(index)" class="btn-remove" title="Hapus">&times;</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-summary">Total Biaya Resource: <strong>Rp {{ formatCurrency(totalResourceCost) }}</strong></div>
        </div>

        <!-- Grand Total Summary -->
        <div class="grand-total-box">
          GRAND TOTAL KESELURUHAN BIAYA: <span>Rp {{ formatCurrency(grandTotal) }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button type="button" @click="downloadPDF" class="btn-download">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download PDF</span>
          </button>
          <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn-submit" :disabled="submitting">
            <span v-if="submitting">Memproses...</span>
            <span v-else>Terbitkan WO</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Hidden Printable Element untuk Konversi HTML2PDF -->
    <div style="display: none;">
      <div id="pdf-printable-modal-area" class="pdf-document">
        <div class="pdf-header">
          <h2>SURAT TUGAS WORK ORDER</h2>
          <h3>{{ form.companyName }}</h3>
        </div>
        <hr class="pdf-divider" />
        <div class="pdf-meta">
          <div>
            <strong>Nama Pembuat Surat:</strong> {{ creatorName }}
            <span v-if="creatorEmail"> ({{ creatorEmail }})</span>
          </div>
          <div>
            <strong>Tanggal Pembuatan:</strong> {{ formattedTodayDate }}<br />
            <strong>Tanggal Pelaksanaan:</strong> {{ formatFormattedExecutionDate }}
          </div>
        </div>

        <div class="pdf-section">
          <h4>1. Pendahuluan</h4>
          <p>{{ form.introduction || '-' }}</p>
        </div>

        <div class="pdf-section">
          <h4>2. Lokasi Perbaikan & Tanggal Pelaksanaan</h4>
          <p><strong>Nama Tempat:</strong> {{ form.locationName || '-' }}</p>
          <p><strong>Tanggal Pelaksanaan:</strong> {{ formatFormattedExecutionDate }}</p>
          <p v-if="form.mapsUrl"><strong>Google Maps URL:</strong> {{ form.mapsUrl }}</p>
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
              <tr v-for="(t, idx) in form.technicians" :key="idx">
                <td>{{ t.name }}</td>
                <td>{{ t.email }}</td>
                <td>{{ t.phone || '-' }}</td>
                <td>Rp {{ formatCurrency(t.fee) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Bayaran Teknisi: <strong>Rp {{ formatCurrency(totalTechFee) }}</strong></p>
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
              <tr v-for="(r, idx) in form.resources" :key="idx">
                <td>{{ r.name }}</td>
                <td>{{ r.quantity }}</td>
                <td>{{ r.unit }}</td>
                <td>Rp {{ formatCurrency(r.price) }}</td>
                <td>Rp {{ formatCurrency(r.quantity * r.price) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-subtotal">Total Biaya Resource: <strong>Rp {{ formatCurrency(totalResourceCost) }}</strong></p>
        </div>

        <div class="pdf-footer-summary">
          GRAND TOTAL BIAYA: Rp {{ formatCurrency(grandTotal) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';
import { createWorkOrder, getTechnicians } from '../services/api';

const props = defineProps({
  reportId: { type: String, default: '' }
});

const emit = defineEmits(['close', 'created']);

const submitting = ref(false);
const loadingTechs = ref(false);
const availableTechnicians = ref([]);

const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const creatorName = computed(() => currentUser.value.name || 'Mahesa Putra Pinuntun');
const creatorEmail = computed(() => currentUser.value.email || '');

const formattedTodayDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const todayString = new Date().toISOString().split('T')[0];

const form = ref({
  companyName: 'Infrastructure_Report',
  executionDate: todayString, // Default tanggal pelaksanaan hari ini (YYYY-MM-DD)
  introduction: '',
  locationName: '',
  mapsUrl: '',
  technicians: [{ technicianId: '', name: '', email: '', phone: '', fee: 0 }],
  resources: [{ name: '', quantity: 1, unit: 'pcs', price: 0 }]
});

const formatFormattedExecutionDate = computed(() => {
  if (!form.value.executionDate) return '-';
  return new Date(form.value.executionDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const initTheme = () => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const fetchTechnicians = async () => {
  loadingTechs.value = true;
  try {
    const res = await getTechnicians(1, 100);
    availableTechnicians.value = res.data || [];
  } catch (err) {
    console.error('Gagal mengambil daftar teknisi:', err);
  } finally {
    loadingTechs.value = false;
  }
};

const getAvailableOptionsForIndex = (currentIndex) => {
  const selectedIds = form.value.technicians
    .map((tech, idx) => (idx !== currentIndex ? tech.technicianId : null))
    .filter(Boolean);

  return availableTechnicians.value.filter(
    (tech) => !selectedIds.includes(tech.id || tech._id)
  );
};

const onTechnicianSelect = (index) => {
  const row = form.value.technicians[index];
  const selectedTech = availableTechnicians.value.find(
    (t) => (t.id || t._id) === row.technicianId
  );
  if (selectedTech) {
    row.name = selectedTech.name || '';
    row.email = selectedTech.email || '';
    row.phone = selectedTech.phone || selectedTech.phoneNumber || '';
  }
};

const addTechnicianRow = () => {
  form.value.technicians.push({ technicianId: '', name: '', email: '', phone: '', fee: 0 });
};

const removeTechnicianRow = (index) => {
  if (form.value.technicians.length > 1) {
    form.value.technicians.splice(index, 1);
  }
};

const totalTechFee = computed(() => {
  return form.value.technicians.reduce((acc, curr) => acc + (Number(curr.fee) || 0), 0);
});

const totalResourceCost = computed(() => {
  return form.value.resources.reduce((acc, curr) => acc + ((Number(curr.quantity) || 0) * (Number(curr.price) || 0)), 0);
});

const grandTotal = computed(() => totalTechFee.value + totalResourceCost.value);

const addResource = () => {
  form.value.resources.push({ name: '', quantity: 1, unit: 'pcs', price: 0 });
};

const removeResource = (index) => {
  if (form.value.resources.length > 1) {
    form.value.resources.splice(index, 1);
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    await createWorkOrder({
      reportId: props.reportId || null,
      creatorName: creatorName.value,
      creatorEmail: creatorEmail.value,
      ...form.value
    });
    alert('Work Order berhasil diterbitkan!');
    emit('created');
    emit('close');
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal menerbitkan Work Order');
  } finally {
    submitting.value = false;
  }
};

const downloadPDF = () => {
  const element = document.getElementById('pdf-printable-modal-area');
  const pdfName = `${form.value.companyName}_${Date.now()}.pdf`;

  const opt = {
    margin: 10,
    filename: pdfName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

const formatCurrency = (val) => Number(val || 0).toLocaleString('id-ID');

onMounted(() => {
  initTheme();
  fetchTechnicians();
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --modal-bg: #ffffff;
  --modal-text: #0f172a;
  --section-bg: #f8fafc;
  --input-bg: #ffffff;
  --input-border: #cbd5e1;
  --text-label: #475569;
  --grand-total-bg: #eff6ff;
  --grand-total-text: #2563eb;
}

:global([data-theme="dark"]) {
  --modal-bg: #1e293b;
  --modal-text: #f8fafc;
  --section-bg: #0f172a;
  --input-bg: #334155;
  --input-border: #475569;
  --text-label: #94a3b8;
  --grand-total-bg: #1e3a8a;
  --grand-total-text: #60a5fa;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.wide-modal {
  max-width: 860px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card {
  background-color: var(--modal-bg);
  border-radius: 16px;
  padding: 24px;
  color: var(--modal-text);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--modal-text);
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-label);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-label); }

.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--section-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--modal-text);
  box-sizing: border-box;
}

.readonly { opacity: 0.7; cursor: not-allowed; }
.textarea { height: 70px; resize: vertical; }

.section-box {
  background-color: var(--section-bg);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--input-border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--modal-text); }

.btn-sm-add {
  padding: 6px 12px;
  background-color: #059669;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.form-table {
  width: 100%;
  border-collapse: collapse;
}

.form-table th, .form-table td {
  padding: 8px;
  font-size: 12px;
  color: var(--modal-text);
}

.input-table {
  width: 100%;
  padding: 6px 10px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--modal-text);
  box-sizing: border-box;
}

.select-table { cursor: pointer; }
.btn-remove { background: #ef4444; color: #ffffff; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
.total-summary { text-align: right; margin-top: 10px; font-size: 13px; color: var(--modal-text); }

.grand-total-box {
  background-color: var(--grand-total-bg);
  color: var(--grand-total-text);
  padding: 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  text-align: right;
  margin-bottom: 20px;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn-download { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background-color: #d97706; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-cancel { padding: 10px 18px; background: transparent; border: 1px solid var(--input-border); color: var(--text-label); font-weight: 600; border-radius: 8px; cursor: pointer; }
.btn-submit { padding: 10px 18px; background-color: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* PDF printable area styling */
.pdf-document { padding: 24px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; }
.pdf-header { text-align: center; }
.pdf-divider { margin: 16px 0; border: 0; border-top: 2px solid #333; }
.pdf-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
.pdf-section { margin-bottom: 16px; }
.pdf-section h4 { margin-bottom: 6px; font-size: 14px; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; text-align: left; color: #000000; }
.pdf-subtotal { text-align: right; margin-top: 6px; font-size: 12px; }
.pdf-footer-summary { text-align: right; font-size: 15px; font-weight: bold; padding: 12px; background: #e2e8f0; margin-top: 20px; color: #000000; }
.icon-sm { width: 16px; height: 16px; }
</style>
