import React, { useEffect, useState } from 'react';
import { adminApi, managerApi } from '../services/api';

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const api = user.role === 'ADMIN' ? adminApi : managerApi;
    const endpoint = user.role === 'ADMIN' ? '/api/admin/work-orders' : '/api/manager/work-orders';

    api.get(endpoint)
      .then((res) => setOrders(res.data.workOrders || res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Manajemen Surat Tugas (Work Orders)</h2>
      <ul style={{ marginTop: '16px' }}>
        {orders.length === 0 ? (
          <p>Belum ada Work Order aktif.</p>
        ) : (
          orders.map((item) => (
            <li key={item._id} style={{ marginBottom: '8px' }}>
              <strong>{item.title}</strong> - Status: {item.status} (Teknisi: {item.technicianId || 'Belum ditugaskan'})
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
