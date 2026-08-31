import React, { useState } from 'react';
import { loginAdmin, loginManager } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let data;
      if (role === 'ADMIN') {
        data = await loginAdmin(email, password);
      } else {
        data = await loginManager(email, password);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { email, role }));

      window.location.href = '/dashboard';
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login gagal, periksa email dan password.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Portal Admin & Manager</h2>
        <p style={styles.subtitle}>Infrastructure Report Management System</p>

        {errorMsg && <div style={styles.alert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Pilih Peran (Role):</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="ADMIN">System Administrator</option>
              <option value="MANAGER">Manager Lapangan</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Memproses...' : `Masuk sebagai ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  card: { width: '100%', maxWidth: '420px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  subtitle: { margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', textAlign: 'center' },
  alert: { padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }
};
