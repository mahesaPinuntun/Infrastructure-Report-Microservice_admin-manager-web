import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminApi.get('/api/admin/users')
      .then((res) => setUsers(res.data.users || res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Manajemen Pengguna System (Admin Only)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Role</th>
            <th style={{ padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{u.email}</td>
              <td style={{ padding: '12px' }}>{u.role}</td>
              <td style={{ padding: '12px' }}>{u.status || 'ACTIVE'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
