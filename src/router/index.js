import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import ManagerDashboard from '../views/ManagerDashboard.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { 
    path: '/admin', 
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  { 
    path: '/manager', 
    component: ManagerDashboard,
    // Diubah dari INFRASTRUCTURE_MANAGER ke MANAGER agar cocok dengan payload JWT auth-service
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  // Catch-all route untuk menangani 404 / path yang tidak terdaftar
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard (Route Protection)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Safe JSON Parsing untuk mencegah app crash
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error('Failed to parse stored user:', err);
    user = null;
  }

  // Check 1: Halaman butuh autentikasi tapi token tidak ada
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // Check 2: Verifikasi role akses halaman
  if (to.meta.requiresAuth && to.meta.role && user?.role !== to.meta.role) {
    // Redirect ke dashboard role masing-masing jika pengguna salah alamat
    if (user?.role === 'ADMIN') return next('/admin');
    if (user?.role === 'MANAGER') return next('/manager');
    return next('/login');
  }

  // Check 3: Jika pengguna sudah login tapi mencoba akses /login lagi
  if (to.path === '/login' && token && user?.role) {
    if (user.role === 'ADMIN') return next('/admin');
    if (user.role === 'MANAGER') return next('/manager');
  }

  next();
});

export default router;
