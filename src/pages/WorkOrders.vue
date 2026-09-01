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
              <th>Path Bukti Surat</th>
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
              <td>{{ item.createdBy || '-' }}</td>
              <td>{{ item.locationName || '-' }}</td>
              <td class="price-cell">Rp {{ formatCurrency(item.grandTotal) }}</td>
              <td>
                <span class="badge-url" :title="item.proofDocumentUrl">{{ item.proofDocumentUrl || '-' }}</span>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Create Work Order -->
    <Transition name="fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-card wide-modal">
          <div class="modal-header">
            <h3>Buat Work Order Baru</h3>
            <button @click="showCreateModal = false" class="btn-close">&times;</button>
          </div>
          
          <form @submit.prevent="handleCreateWO">
            <!-- Header Grid: Company, Creator, Date -->
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Perusahaan:</label>
                <input type="text" v-model="form.companyName" class="input-control" />
              </div>
              <div class="form-group">
                <label>Nama Pembuat Surat (Terisi Otomatis):</label>
                <input type="text" :value="creatorName" readonly class="input-control readonly" />
              </div>
              <div class="form-group full-width">
                <label>Tanggal Pembuatan Surat:</label>
                <input type="text" :value="formattedTodayDate" readonly class="input-control readonly" />
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

            <!-- SECTION 1: List Teknisi -->
            <div class="section-box">
              <div class="section-header">
                <h4>List Teknisi yang Dipekerjakan</h4>
                <button type="button" @click="addTechnician" class="btn-sm-add">+ Tambah Teknisi</button>
              </div>
              <div class="table-responsive">
                <table class="form-table">
                  <thead>
                    <tr>
                      <th>Nama Teknisi</th>
                      <th>Email Teknisi</th>
                      <th>Nomor Handphone</th>
                      <th>Bayaran (Rp)</th>
                      <th class="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tech, index) in form.technicians" :key="index">
                      <td><input type="text" v-model="tech.name" required placeholder="Nama Teknisi" class="input-table" /></td>
                      <td><input type="email" v-model="tech.email" required placeholder="email@domain.com" class="input-table" /></td>
                      <td><input type="tel" v-model="tech.phone" placeholder="0812..." class="input-table" /></td>
                      <td><input type="number" v-model.number="tech.fee" min="0" required class="input-table" /></td>
                      <td class="text-center">
                        <button type="button" @click="removeTechnician(index)" class="btn-remove" title="Hapus">&times;</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="total-summary">Total Bayaran Teknisi: <strong>Rp {{ formatCurrency(totalTechFee) }}</strong></div>
            </div>

            <!-- SECTION 2: List Biaya Resource -->
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

            <div class="modal-actions">
              <button type="button" @click="downloadPDF" class="btn-download">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download PDF</span>
              </button>
              <button type="button" @click="showCreateModal = false" class="btn-cancel">Batal</button>
              <button type="submit" :disabled="creating" class="btn-primary">
                {{ creating ? 'Menyimpan...' : 'Simpan Work Order' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- HIDDEN CONTAINER FOR HTML2PDF CONVERSION -->
    <div style="display: none;">
      <div id="pdf-printable-area" class="pdf-document">
        <div class="pdf-header">
          <h2>SURAT TUGAS WORK ORDER</h2>
          <h3>{{ form.companyName }}</h3>
        </div>
        <hr class="pdf-divider" />
        <div class="pdf-meta">
          <div><strong>Nama Pembuat Surat:</strong> {{ creatorName }}</div>
          <div><strong>Tanggal Pembuatan:</strong> {{ formattedTodayDate }}</div>
        </div>

        <div class="pdf-section">
          <h4>1. Pendahuluan</h4>
          <p>{{ form.introduction || '-' }}</p>
        </div>

        <div class="pdf-section">
          <h4>2. Lokasi Perbaikan</h4>
          <p><strong>Nama Tempat:</strong> {{ form.locationName || '-' }}</p>
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
import { useRouter } from 'vue-router';
import html2pdf from 'html2pdf.js';
import { adminApi, managerApi } from '../services/api';

const router = useRouter();

const orders = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);

const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const creatorName = computed(() => {
  return currentUser.value.name || currentUser.value.email || 'Mahesa Putra Pinuntun';
});

const formattedTodayDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const form = ref({
  companyName: 'Infrastructure_Report',
  introduction: '',
  locationName: '',
  mapsUrl: '',
  technicians: [
    { name: '', email: '', phone: '', fee: 0 }
  ],
  resources: [
    { name: '', quantity: 1, unit: 'pcs', price: 0 }
  ]
});

const totalTechFee = computed(() => {
  return form.value.technicians.reduce((acc, curr) => acc + (Number(curr.fee) || 0), 0);
});

const totalResourceCost = computed(() => {
  return form.value.resources.reduce((acc, curr) => acc + ((Number(curr.quantity) || 0) * (Number(curr.price) || 0)), 0);
});

const grandTotal = computed(() => totalTechFee.value + totalResourceCost.value);

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

const addTechnician = () => {
  form.value.technicians.push({ name: '', email: '', phone: '', fee: 0 });
};

const removeTechnician = (index) => {
  if (form.value.technicians.length > 1) {
    form.value.technicians.splice(index, 1);
  }
};

const addResource = () => {
  form.value.resources.push({ name: '', quantity: 1, unit: 'pcs', price: 0 });
};

const removeResource = (index) => {
  if (form.value.resources.length > 1) {
    form.value.resources.splice(index, 1);
  }
};

const openCreateModal = () => {
  showCreateModal.value = true;
};

const handleCreateWO = async () => {
  creating.value = true;
  try {
    const api = getApiClient();
    const user = getUserData();
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';

    await api.post(endpoint, form.value);

    alert('Surat Work Order berhasil disimpan ke MongoDB!');
    showCreateModal.value = false;
    form.value = {
      companyName: 'Infrastructure_Report',
      introduction: '',
      locationName: '',
      mapsUrl: '',
      technicians: [{ name: '', email: '', phone: '', fee: 0 }],
      resources: [{ name: '', quantity: 1, unit: 'pcs', price: 0 }]
    };
    fetchWorkOrders();
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal menyimpan Work Order baru.');
  } finally {
    creating.value = false;
  }
};

const downloadPDF = () => {
  const element = document.getElementById('pdf-printable-area');
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
  --primary-hover: #1d4ed8;
  --amber-color: #d97706;
  --emerald-color: #059669;
  --danger-color: #ef4444;
  --icon-bg-blue: #eff6ff;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --primary-hover: #60a5fa;
  --amber-color: #f59e0b;
  --emerald-color: #10b981;
  --danger-color: #f87171;
  --icon-bg-blue: #1e3a8a;
}

.page-wrapper {
  min-height: 100vh;
  width: 100vw;
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
  color: #fff;
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.minimal-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
}

.code-cell { font-family: monospace; font-weight: 700; color: var(--primary-color); }
.title-cell { font-weight: 600; }
.price-cell { font-weight: 700; color: var(--emerald-color); }
.badge-url { font-family: monospace; font-size: 11px; background: var(--bg-main); padding: 4px 8px; border-radius: 6px; }

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

.wide-modal {
  max-width: 860px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card {
  background: var(--bg-card);
  color: var(--text-main);
  padding: 24px;
  border-radius: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; }

.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--bg-main);
  border: none;
  border-radius: 8px;
  color: var(--text-main);
  font-size: 13px;
  box-sizing: border-box;
}

.readonly { opacity: 0.7; cursor: not-allowed; }
.textarea { height: 70px; resize: vertical; }

.section-box {
  background-color: var(--bg-main);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 { margin: 0; font-size: 14px; font-weight: 700; }

.btn-sm-add {
  padding: 6px 12px;
  background-color: var(--emerald-color);
  color: #fff;
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
}

.input-table {
  width: 100%;
  padding: 6px 10px;
  background-color: var(--bg-card);
  border: none;
  border-radius: 6px;
  color: var(--text-main);
  font-size: 12px;
  box-sizing: border-box;
}

.select-table { cursor: pointer; }
.btn-remove { background: var(--danger-color); color: #fff; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
.total-summary { text-align: right; margin-top: 10px; font-size: 13px; }

.grand-total-box {
  background-color: var(--icon-bg-blue);
  color: var(--primary-color);
  padding: 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  text-align: right;
  margin-bottom: 20px;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn-download { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background-color: var(--amber-color); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-cancel { padding: 10px 18px; background: transparent; border: none; color: var(--text-muted); font-weight: 600; cursor: pointer; }
.btn-primary { padding: 10px 18px; background-color: var(--primary-color); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* PDF printable area styling */
.pdf-document { padding: 24px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; }
.pdf-header { text-align: center; }
.pdf-divider { margin: 16px 0; border: 0; border-top: 2px solid #333; }
.pdf-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
.pdf-section { margin-bottom: 16px; }
.pdf-section h4 { margin-bottom: 6px; font-size: 14px; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; text-align: left; }
.pdf-subtotal { text-align: right; margin-top: 6px; font-size: 12px; }
.pdf-footer-summary { text-align: right; font-size: 15px; font-weight: bold; padding: 12px; background: #e2e8f0; margin-top: 20px; }
</style>
