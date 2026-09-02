<template>
  <div class="page-wrapper">
    <header class="header-bar">
      <button @click="router.push('/')" class="btn-back">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        <span>Kembali ke Halaman Utama</span>
      </button>
      <h2>Sistem Workflow & Alur Kerja Operasional</h2>
    </header>

    <div class="workflow-steps">
      <div class="step-card">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Pelaporan Masalah Infrastruktur</h3>
          <p>User/Pelapor mengirimkan laporan kerusakan fasilitas atau kendala sistem melalui form pelaporan.</p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Review & Approval Manager</h3>
          <p>Manager memeriksa keabsahan laporan yang masuk pada menu <strong>Review Laporan</strong>. Jika disetujui, laporan dikonfirmasi untuk tindakan lebih lanjut.</p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Penerbitan Work Order (Surat Tugas)</h3>
          <p>Manager atau Admin membuat Work Order baru dengan mengalokasikan teknisi lapangan serta memperhitungkan rincian biaya resource (bahan/peralatan).</p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>Eksekusi & Dokumen PDF</h3>
          <p>Surat tugas diterbitkan dalam bentuk dokumen PDF resmi yang dapat diunduh untuk dibawa teknisi saat pengerjaan lapangan.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
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

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
}

.header-bar h2 {
  margin: 8px 0 24px 0;
  font-size: 24px;
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

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background-color: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: var(--text-main);
}

.step-content p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.icon-sm { width: 16px; height: 16px; }
</style>
