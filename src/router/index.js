import { createRouter, createWebHistory } from 'vue-router';

// Impor halaman dari folder pages/
import LoginView from '../pages/LoginView.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import ManagerDashboard from '../pages/ManagerDashboard.vue';

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
    // Disesuaikan dengan enum role 'MANAGER' dari auth-service
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard (Proteksi Halaman)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error('Failed to parse stored user:', err);
    user = null;
  }

  // 1. Jika butuh login tapi token tidak ada
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // 2. Jika role tidak sesuai
  if (to.meta.requiresAuth && to.meta.role && user?.role !== to.meta.role) {
    if (user?.role === 'ADMIN') return next('/admin');
    if (user?.role === 'MANAGER') return next('/manager');
    return next('/login');
  }

  // 3. Jika sudah login tapi mencoba ke /login lagi
  if (to.path === '/login' && token && user?.role) {
    if (user.role === 'ADMIN') return next('/admin');
    if (user.role === 'MANAGER') return next('/manager');
  }

  next();
});

export default router;
