import React, { useEffect, useState } from 'react';
import { adminApi, managerApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalReports: 0, 
    activeTechnicians: 0, 
    pendingTasks: 0 
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(savedUser);

    const fetchStats = async () => {
      try {
        let res;
        if (savedUser.role === 'ADMIN') {
          res = await adminApi.get('/api/admin/stats');
        } else if (savedUser.role === 'MANAGER') {
          res = await managerApi.get('/api/manager/stats');
        }

        if (res?.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard {user?.role || 'Portal'}</h1>
      <p style={{ color: '#64748b' }}>Selamat datang kembali, {user?.email || 'User'}</p>

      {loading ? (
        <p>Memuat statistik...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={cardStyle}>
            <h3>Total Laporan</h3>
            <p style={statNumberStyle}>{stats.totalReports ?? 0}</p>
          </div>
          <div style={cardStyle}>
            <h3>Teknisi Aktif</h3>
            <p style={statNumberStyle}>{stats.activeTechnicians ?? 0}</p>
          </div>
          <div style={cardStyle}>
            <h3>Tugas Pending</h3>
            <p style={statNumberStyle}>{stats.pendingTasks ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = { 
  backgroundColor: '#ffffff', 
  padding: '20px', 
  borderRadius: '8px', 
  border: '1px solid #e2e8f0', 
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
};

const statNumberStyle = { 
  fontSize: '32px', 
  fontWeight: 'bold', 
  color: '#2563eb', 
  margin: '8px 0 0 0' 
};
