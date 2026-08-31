import React, { useEffect, useState } from 'react';
import { useParams } from 'react{
import { useParams, Link } from 'react-router-dom';
import { adminApi, managerApi } from '../services/api';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const api = user.role === 'ADMIN' ? adminApi : managerApi;

    api.get(`/api/reports/${id}`)
      .then((res) => setReport(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '24px' }}>Memuat detail laporan...</div>;
  if (!report) return <div style={{ padding: '24px' }}>Laporan tidak ditemukan.</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <Link to="/reports" style={{ color: '#2563eb', marginBottom: '16px', display: 'inline-block' }}>&larr; Kembali ke Daftar</Link>
      <h2>{report.title || 'Detail Laporan Infrastruktur'}</h2>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Status:</strong> {report.status || 'PENDING'}</p>
      <p><strong>Deskripsi:</strong> {report.description || 'Tidak ada deskripsi.'}</p>
    </div>
  );
}
