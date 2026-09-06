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

    <!-- DROPDOWN 1: SECTION A (ACCOUNT CREATION) -->
    <div class="explainer-dropdown" :class="{ 'is-open': isAccountDropdownOpen }">
      <button class="dropdown-header" @click="isAccountDropdownOpen = !isAccountDropdownOpen">
        <div class="title-group">
          <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>A. Ketentuan Pembuatan Akun (Account Creation)</span>
        </div>
        <svg class="icon-sm chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div v-show="isAccountDropdownOpen" class="dropdown-content">
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
                <path d="M23 21v-2a4 4 0 0 1 0 7.75"/>
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
      </div>
    </div>

    <!-- DROPDOWN 2: SECTION B (USECASE FLOW SEQUENTIAL ANIMATED) -->
    <div class="explainer-dropdown" :class="{ 'is-open': isFlowDropdownOpen }">
      <button class="dropdown-header" @click="isFlowDropdownOpen = !isFlowDropdownOpen">
        <div class="title-group">
          <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
          <span>B. Visualisasi Usecase Flow</span>
        </div>
        <svg class="icon-sm chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div v-show="isFlowDropdownOpen" class="dropdown-content">
        <div ref="diagramRef" class="diagram-wrapper" :class="{ 'is-animated': isDiagramVisible }">
          <!-- Entity 1 -->
          <div class="flow-node shadow-glow node-1">
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

          <!-- Connector 1 -->
          <div class="flow-connector connector-1">
            <svg class="connector-svg desktop-only" viewBox="0 0 100 24">
              <path class="connector-line-bg" d="M 0 12 L 92 12" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="4,4" />
              <path class="connector-line" d="M 0 12 L 92 12" stroke="var(--connector-color)" stroke-width="3" />
              <polygon class="connector-arrowhead" points="92,6 100,12 92,18" fill="var(--connector-color)" />
            </svg>
            <svg class="connector-svg mobile-only" viewBox="0 0 24 60">
              <path class="connector-line-bg" d="M 12 0 L 12 52" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="4,4" />
              <path class="connector-line" d="M 12 0 L 12 52" stroke="var(--connector-color)" stroke-width="3" />
              <polygon class="connector-arrowhead" points="6,52 12,60 18,52" fill="var(--connector-color)" />
            </svg>
          </div>

          <!-- Entity 2 -->
          <div class="flow-node shadow-glow node-2">
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

          <!-- Connector 2 -->
          <div class="flow-connector connector-2">
            <svg class="connector-svg desktop-only" viewBox="0 0 100 24">
              <path class="connector-line-bg" d="M 0 12 L 92 12" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="4,4" />
              <path class="connector-line" d="M 0 12 L 92 12" stroke="var(--connector-color)" stroke-width="3" />
              <polygon class="connector-arrowhead" points="92,6 100,12 92,18" fill="var(--connector-color)" />
            </svg>
            <svg class="connector-svg mobile-only" viewBox="0 0 24 60">
              <path class="connector-line-bg" d="M 12 0 L 12 52" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="4,4" />
              <path class="connector-line" d="M 12 0 L 12 52" stroke="var(--connector-color)" stroke-width="3" />
              <polygon class="connector-arrowhead" points="6,52 12,60 18,52" fill="var(--connector-color)" />
            </svg>
          </div>

          <!-- Entity 3 -->
          <div class="flow-node shadow-glow node-3">
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
      </div>
    </div>

    <!-- TECH STACK EXPLANATION SECTION (MERN + VUE LAYOUT) -->
    <div class="info-card tech-stack-card">
      <div class="card-header">
        <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
        <h3>Arsitektur Perangkat Lunak & Kegunaan Tech Stack</h3>
      </div>
      <p class="tech-description">
        Sistem ini dibangun dengan mengombinasikan ekosistem <strong>MERN Stack</strong> untuk fondasi basis data, server API, serta aplikasi mobile, dipadukan dengan <strong>Vue 3</strong> untuk antarmuka web dashboard interaktif.
      </p>

      <!-- MERN STACK SECTION (GRID 4 KARTU) -->
      <div class="mern-section">
        <div class="stack-badge-title">
          <span class="badge-tag">MERN STACK</span>
          <span class="badge-sub">Database, Backend Microservices & Mobile App</span>
        </div>
        
        <div class="mern-grid">
          <!-- M: MongoDB -->
          <div class="tech-badge-card">
            <div class="tech-badge-header">
              <svg class="official-logo" viewBox="0 0 24 24">
                <path fill="#47A248" d="M12 1.5c-.3 0-.6.2-.7.5C10.5 3.8 5 10.2 5 15c0 3.9 3.1 7 7 7s7-3.1 7-7c0-4.8-5.5-11.2-6.3-13-.1-.3-.4-.5-.7-.5zm0 18.5c-2.8 0-5-2.2-5-5 0-2.8 3.2-7.2 5-9.4 1.8 2.2 5 6.6 5 9.4 0 2.8-2.2 5-5 5z"/>
              </svg>
              <span>MongoDB</span>
            </div>
            <p>Database NoSQL untuk menyimpan dokumen data fleksibel seperti profil akun, laporan infrastruktur, dan Work Order.</p>
          </div>

          <!-- E: Express.js -->
          <div class="tech-badge-card">
            <div class="tech-badge-header">
              <svg class="official-logo express-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span>Express.js</span>
            </div>
            <p>Framework REST API backend untuk verifikasi JWT, validasi data, logika bisnis microservices, dan ekspor PDF.</p>
          </div>

          <!-- R: React Native -->
          <div class="tech-badge-card">
            <div class="tech-badge-header">
              <svg class="official-logo" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="2" fill="#61DAFB"/>
                <g stroke="#61DAFB" stroke-width="1.2" fill="none">
                  <ellipse cx="12" cy="12" rx="9" ry="3.5"/>
                  <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/>
                  <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)"/>
                </g>
              </svg>
              <span>React Native</span>
            </div>
            <p>Framework mobile cross-platform (Android/iOS) untuk aplikasi pelaporan warga dan aplikasi eksekusi tugas teknisi.</p>
          </div>

          <!-- N: Node.js -->
          <div class="tech-badge-card">
            <div class="tech-badge-header">
              <svg class="official-logo" viewBox="0 0 24 24">
                <path fill="#339933" d="M12 2L2.5 7.5v9L12 22l9.5-5.5v-9L12 2zm7.5 13.5L12 19.8l-7.5-4.3V8.5L12 4.2l7.5 4.3v7z"/>
              </svg>
              <span>Node.js</span>
            </div>
            <p>Runtime environment JavaScript server-side berkinerja tinggi untuk mengeksekusi service backend secara asinkron.</p>
          </div>
        </div>
      </div>

      <!-- VUE 3 EXTENSION (POSISI DIBAWAH TENGAH) -->
      <div class="vue-center-container">
        <div class="vue-card">
          <div class="tech-badge-header justify-center">
            <svg class="official-logo vue-logo" viewBox="0 0 24 24">
              <path fill="#41B883" d="M2 3h3.5L12 15 18.5 3H22L12 21 2 3z"/>
              <path fill="#34495E" d="M6.5 3h3L12 8.5 14.5 3h3L12 13 6.5 3z"/>
            </svg>
            <span>Vue 3 (Frontend Web Dashboard)</span>
          </div>
          <p>
            Digunakan khusus membangun antarmuka <strong>Web Single Page Application (SPA)</strong> yang interaktif bagi Admin dalam mengelola sistem serta Manager dalam memverifikasi laporan & menerbitkan Work Order.
          </p>
        </div>
      </div>
    </div>

    <!-- DOWNLOADS SECTION -->
    <div class="info-card downloads-card">
      <div class="card-header">
        <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <h3>Unduh Aplikasi Mobile Lapangan</h3>
      </div>
      
      <div class="downloads-grid">
        <div class="download-box">
          <div class="download-meta">
            <span class="app-role">Pelapor / User</span>
            <h4>Aplikasi Pelaporan Infrastruktur</h4>
            <p>Digunakan oleh masyarakat umum dan staf untuk menyampaikan keluhan kerusakan fasilitas.</p>
          </div>
          <button class="btn-download" disabled>
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download For Users (Under Development)</span>
          </button>
        </div>

        <div class="download-box">
          <div class="download-meta">
            <span class="app-role">Teknisi Lapangan</span>
            <h4>Aplikasi Eksekusi Work Order</h4>
            <p>Khusus teknisi untuk menerima Work Order, memperbarui progres perbaikan, dan laporan akhir.</p>
          </div>
          <button class="btn-download" disabled>
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download For Technician (Under Development)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const isAccountDropdownOpen = ref(true);
const isFlowDropdownOpen = ref(true);

const diagramRef = ref(null);
const isDiagramVisible = ref(false);
let observer = null;

onMounted(() => {
  const savedTheme = localStorage.getItem('user-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isDiagramVisible.value = true;
        }
      });
    },
    { threshold: 0.2 }
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
/* OVERRIDE CSS GLOBAL UNTUK MENGELIMINASI GAP BROWSER */
:global(html),
:global(body),
:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100vh !important;
  height: auto !important;
  background-color: var(--bg-main) !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
}

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
  --connector-color: #2563eb;
  --disabled-bg: #e2e8f0;
  --disabled-text: #94a3b8;
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
  --disabled-bg: #334155;
  --disabled-text: #64748b;
}

.page-wrapper {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 24px 20px;
  max-width: 1100px;
  margin: 0 auto;
  overflow-x: hidden;
}

.header-bar h2 {
  margin: 8px 0 20px 0;
  font-size: 24px;
  font-weight: 800;
  text-align: left;
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

/* DROPDOWN COMPONENTS */
.explainer-dropdown {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  margin-bottom: 20px;
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
  text-align: left;
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

/* ACCOUNT CREATION GRID */
.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  padding-top: 8px;
}

.account-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
  text-align: left;
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

/* SEQUENTIAL ANIMATED USECASE FLOW DIAGRAM */
.diagram-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0;
  width: 100%;
}

.flow-node {
  flex: 1;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  text-align: left;
}

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

/* CONNECTORS & ANIMATED ARROW DRAWING */
.flow-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  flex-shrink: 0;
}

.connector-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.connector-line {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  transition: stroke-dashoffset 0.8s ease-in-out;
}

.connector-arrowhead {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-only { display: none; }
.desktop-only { display: block; }

.diagram-wrapper.is-animated .node-1 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.1s;
}

.diagram-wrapper.is-animated .connector-1 .connector-line {
  stroke-dashoffset: 0;
  transition-delay: 0.5s;
}

.diagram-wrapper.is-animated .connector-1 .connector-arrowhead {
  opacity: 1;
  transition-delay: 1.2s;
}

.diagram-wrapper.is-animated .node-2 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 1.4s;
}

.diagram-wrapper.is-animated .connector-2 .connector-line {
  stroke-dashoffset: 0;
  transition-delay: 1.8s;
}

.diagram-wrapper.is-animated .connector-2 .connector-arrowhead {
  opacity: 1;
  transition-delay: 2.5s;
}

.diagram-wrapper.is-animated .node-3 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 2.7s;
}

/* INFO CARD BASE */
.info-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--primary-color);
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  text-align: left;
}

/* TECH STACK STYLING (MERN + VUE) */
.tech-description {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0 0 20px 0;
  text-align: left;
}

.mern-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.stack-badge-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.badge-tag {
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.badge-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.mern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tech-badge-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  text-align: left;
}

.tech-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.official-logo {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.express-icon {
  color: var(--text-main);
}

.tech-badge-card p {
  margin: 0;
  font-size: 11.5px;
  color: var(--text-muted);
  line-height: 1.45;
}

/* VUE 3 CENTERED CONTAINER */
.vue-center-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.vue-card {
  width: 100%;
  max-width: 600px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.vue-card p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.justify-center {
  justify-content: center;
}

/* DOWNLOADS SECTION */
.downloads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.download-box {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
}

.app-role {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary-color);
}

.download-meta h4 {
  margin: 4px 0 6px 0;
  font-size: 15px;
  color: var(--text-main);
}

.download-meta p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.4;
}

.btn-download {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background-color: var(--disabled-bg);
  color: var(--disabled-text);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: not-allowed;
  opacity: 0.8;
}

.icon-sm { width: 16px; height: 16px; flex-shrink: 0; }
.icon-md { width: 20px; height: 20px; flex-shrink: 0; }

/* RESPONSIVE BREAKPOINTS */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 16px 12px;
  }

  .dropdown-content {
    padding: 0 12px 16px 12px;
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

  .mern-grid {
    grid-template-columns: 1fr;
  }
}
</style>
