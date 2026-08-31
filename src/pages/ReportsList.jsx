import React, { useEffect, useState } from 'react';
import { adminApi, managerApi } from '../services/api';
import { Link } from 'react-router-dom';

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const api = user.role === 'ADMIN' ? adminApi : managerApi;
    const endpoint = user.role === 'ADMIN' ? '/api/admin/reports' : '/api/manager/reports';

    api.get(endpoint)
      .then((res) => setReports(res.data.reports || res.data || []))
      .catch((err) => console.error('Error fetching reports:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Daftar Laporan Infrastruktur</h2>
      {loading ? (
        <p>Memuat laporan...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
              <th style={cellStyle}>ID</th>
              <th style={cellStyle}>Judul Laporan</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan="4" style={cellStyle}>Belum ada laporan yang tersedia.</td></tr>
            ) : (
              reports.map((item) => (
                <tr key={item._id || item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={cellStyle}>{item._id || item.id}</td>
                  <td style={cellStyle}>{item.title || item.description}</td>
                  <td style={cellStyle}><strong>{item.status || 'PENDING'}</strong></td>
                  <td style={cellStyle}>
                    <Link to={`/reports/${item._id || item.id}`} style={{ color: '#2563eb' }}>Detail</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cellStyle = { padding: '12px', fontSize: '14px' };
