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
  background: rgba(0, 0, 0, 0.7);
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
  background: var(--modal-bg);
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
.btn-remove { background: #ef4444; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
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
.btn-download { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background-color: #d97706; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-cancel { padding: 10px 18px; background: transparent; border: 1px solid var(--input-border); color: var(--text-label); font-weight: 600; border-radius: 8px; cursor: pointer; }
.btn-submit { padding: 10px 18px; background-color: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* PDF printable area styling - Tetap Putih untuk Cetak Dokumentasi */
.pdf-document { padding: 24px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; }
.pdf-header { text-align: center; }
.pdf-divider { margin: 16px 0; border: 0; border-top: 2px solid #333; }
.pdf-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
.pdf-section { margin-bottom: 16px; }
.pdf-section h4 { margin-bottom: 6px; font-size: 14px; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; text-align: left; color: #000; }
.pdf-subtotal { text-align: right; margin-top: 6px; font-size: 12px; }
.pdf-footer-summary { text-align: right; font-size: 15px; font-weight: bold; padding: 12px; background: #e2e8f0; margin-top: 20px; color: #000; }
.icon-sm { width: 16px; height: 16px; }
</style>
