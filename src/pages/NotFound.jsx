import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1>404</h1>
      <p>Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/dashboard" style={{ color: '#2563eb' }}>Kembali ke Dashboard</Link>
    </div>
  );
}
