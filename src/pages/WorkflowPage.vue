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

    <div class="explainer-dropdown" :class="{ 'is-open': isDropdownOpen }">
      <button class="dropdown-header" @click="isDropdownOpen = !isDropdownOpen">
        <div class="title-group">
          <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Panduan Hak Akses Akun & Alur Interaksi Sistem</span>
        </div>
        <svg class="icon-sm chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div v-show="isDropdownOpen" class="dropdown-content">
        <section class="info-section">
          <h4 class="section-title">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            A. Ketentuan Pembuatan Akun (Account Creation)
          </h4>
          <div class="account-grid">
            <div class="account-card admin">
              <div class="entity-badge">
                <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Admin</span>
              </div>
              <p>
                Akun Admin dibuat melalui tautan khusus:
                <a 
                  href="https://infrastructure-report-microservice-admin-manager.vercel.app/register-admin" 
                  target="_blank" 
                  rel="noopener"
                  class="link-highlight"
                >
                  Registrasi Admin
                </a> 
                dengan memasukkan <code>Secret Key</code> yang terkonfigurasi di file <code>.env</code>.
              </p>
            </div>

            <div class="account-card internal">
              <div class="entity-badge">
                <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Manager & Teknisi</span>
              </div>
              <p>Akun peran Manager dan Teknisi <strong>hanya dapat dibuat oleh Admin</strong> melalui panel pengelolaan pengguna.</p>
            </div>

            <div class="account-card user">
              <div class="entity-badge">
                <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span>User / Pelapor</span>
              </div>
              <p>Masyarakat/User dapat membuat akun secara mandiri. Wajib melakukan <strong>konfirmasi aktivasi via Email</strong> sebelum dapat login.</p>
            </div>
          </div>
        </section>

        <hr class="section-divider" />

        <section class="info-section">
          <h4 class="section-title">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
            </svg>
            B. Visualisasi Usecase Flow
          </h4>
          
          <div ref="diagramRef" class="diagram-wrapper" :class="{ 'is-animated': isDiagramVisible }">
            <div class="flow-node shadow-glow">
              <div class="node-header">
                <div class="node-icon user-icon">
                  <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h5>User / Pelapor</h5>
              </div>
              <p>Mengirimkan laporan kerusakan fasilitas infrastruktur & kendala operasional melalui form.</p>
            </div>

            <div class="flow-connector">
              <svg class="connector-svg desktop-only" viewBox="0 0 100 24">
                <path d="M 0 12 L 100 12" stroke="currentColor" stroke-width="3" stroke-dasharray="6,6" />
                <polygon points="92,6 100,12 92,18" fill="currentColor" />
              </svg>
              <svg class="connector-svg mobile-only" viewBox="0 0 24 60">
                <path d="M 12 0 L 12 60" stroke="currentColor" stroke-width="3" stroke-dasharray="6,6" />
                <polygon points="6,52 12,60 18,52" fill="currentColor" />
              </svg>
            </div>

            <div class="flow-node shadow-glow">
              <div class="node-header">
                <div class="node-icon manager-icon">
                  <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h5>Infrastructure Manager</h5>
              </div>
              <p>Memeriksa laporan, menyetujui, serta menerbitkan Work Order yang merinci alokasi resource & biaya.</p>
            </div>

            <div class="flow-connector">
              <svg class="connector-svg desktop-only" viewBox="0 0 100 24">
                <path d="M 0 12 L 100 12" stroke="currentColor" stroke-width="3" stroke-dasharray="6,6" />
                <polygon points="92,6 100,12 92,18" fill="currentColor" />
              </svg>
              <svg class="connector-svg mobile-only" viewBox="0 0 24 60">
                <path d="M 12 0 L 12 60" stroke="currentColor" stroke-width="3" stroke-dasharray="6,6" />
                <polygon points="6,52 12,60 18,52" fill="currentColor" />
              </svg>
            </div>

            <div class="flow-node shadow-glow">
              <div class="node-header">
                <div class="node-icon tech-icon">
                  <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <h5>Teknisi Lapangan</h5>
              </div>
              <p>Menerima surat tugas PDF, mengeksekusi perbaikan fisik, dan mengunggah laporan hasil pengerjaan.</p>
            </div>
          </div>
        </section>
      </div>
    </div>

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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Collapsible dropdown state
const isDropdownOpen = ref(true);

// Scroll animation state via Intersection Observer
const diagramRef = ref(null);
const isDiagramVisible = ref(false);
let observer = null;

onMounted(() => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Setup IntersectionObserver for scroll-triggered flow animations
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isDiagramVisible.value = true;
        }
      });
    },
    { threshold: 0.25 }
  );

  if (diagramRef.value) {
    observer.observe(diagramRef.value);
  }
});

onUnmounted(() => {
  if (observer && diagramRef.value) {
    observer.unobserve(diagramRef.value);
  }
});
</script>

<style scoped>
:global(:root),
:global([data-theme="light"]) {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --bg-secondary: #f1f5f9;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --primary-color: #2563eb;
  --primary-glow: rgba(37, 99, 235, 0.15);
  --border-color: rgba(148, 163, 184, 0.25);
  --connector-color: #3b82f6;
}

:global([data-theme="dark"]) {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --bg-secondary: #334155;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-color: #3b82f6;
  --primary-glow: rgba(59, 130, 246, 0.25);
  --border-color: rgba(255, 255, 255, 0.1);
  --connector-color: #60a5fa;
}

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.header-bar h2 {
  margin: 8px 0 20px 0;
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
  transition: opacity 0.2s;
}

.btn-back:hover {
  opacity: 0.8;
}

/* --- EXPLANATORY DROPDOWN --- */
.explainer-dropdown {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  margin-bottom: 28px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.dropdown-header {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
}

.dropdown-header .title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--primary-color);
}

.chevron {
  transition: transform 0.3s ease;
  color: var(--text-muted);
}

.explainer-dropdown.is-open .chevron {
  transform: rotate(180deg);
}

.dropdown-content {
  padding: 0 20px 24px 20px;
}

.section-divider {
  border: none;
  border-top: 1px dashed var(--border-color);
  margin: 24px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--text-main);
}

/* ACCOUNT CREATION GRID */
.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.account-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
}

.entity-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--primary-color);
}

.account-card p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
}

.account-card code {
  background: rgba(0,0,0,0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 11px;
}

.link-highlight {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: underline;
}

/* --- ANIMATED USECASE FLOW DIAGRAM --- */
.diagram-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}

.flow-node {
  flex: 1;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
  opacity: 0.6;
  transform: translateY(12px);
}

.diagram-wrapper.is-animated .flow-node {
  opacity: 1;
  transform: translateY(0);
}

.diagram-wrapper.is-animated .flow-node:nth-child(1) { transition-delay: 0.1s; }
.diagram-wrapper.is-animated .flow-node:nth-child(3) { transition-delay: 0.3s; }
.diagram-wrapper.is-animated .flow-node:nth-child(5) { transition-delay: 0.5s; }

.flow-node:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px var(--primary-glow);
  transform: translateY(-4px) !important;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.node-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-glow);
  color: var(--primary-color);
}

.flow-node p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ANIMATED CONNECTOR LINES */
.flow-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--connector-color);
  width: 70px;
  flex-shrink: 0;
}

.connector-svg {
  width: 100%;
  height: auto;
}

.mobile-only { display: none; }
.desktop-only { display: block; }

.diagram-wrapper.is-animated .connector-svg path {
  animation: dashFlow 1.2s linear infinite;
}

@keyframes dashFlow {
  from { stroke-dashoffset: 12; }
  to { stroke-dashoffset: 0; }
}

/* --- WORKFLOW STEPS (ORIGINAL SECTION IMPROVED) --- */
.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background-color: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
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

.icon-sm { width: 16px; height: 16px; flex-shrink: 0; }
.icon-md { width: 20px; height: 20px; flex-shrink: 0; }

/* RESPONSIVE BREAKPOINTS */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 16px;
  }

  .diagram-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .flow-connector {
    width: 100%;
    height: 40px;
    margin: 4px 0;
  }

  .desktop-only { display: none; }
  .mobile-only { display: block; height: 100%; }
}
</style>
