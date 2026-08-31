import { createRouter, createWebHistory } from 'vue-router';

// Impor halaman dari folder pages/
import LoginView from '../pages/LoginView.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import ManagerDashboard from '../pages/ManagerDashboard.vue';
import ReportsList from '../pages/ReportsList.vue';
import ReportDetail from '../pages/ReportDetail.vue';
import WorkOrders from '../pages/WorkOrders.vue';
import UsersManagement from '../pages/UsersManagement.vue';

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
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  { 
    path: '/reports', 
    component: ReportsList,
    meta: { requiresAuth: true }
  },
  { 
    path: '/reports/:id', 
    component: ReportDetail,
    meta: { requiresAuth: true }
  },
  { 
    path: '/work-orders', 
    component: WorkOrders,
    meta: { requiresAuth: true }
  },
  { 
    path: '/users', 
    component: UsersManagement,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  // Catch-all route untuk 404 / path yang tidak dikenal
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard (Proteksi Halaman & Role)
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

  const userRole = user?.role?.toUpperCase();
  const isAllowedRole = ['ADMIN', 'MANAGER'].includes(userRole);

  // 1. Jika rute membutuhkan auth tetapi token/user tidak valid atau role tidak diizinkan di portal ini
  if (to.meta.requiresAuth && (!token || !userRole || !isAllowedRole)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return next('/login');
  }

  // Helper menentukan dashboard tujuan berdasarkan role
  const getDashboardPath = (role) => (role === 'ADMIN' ? '/admin' : '/manager');

  // 2. Jika rute memiliki batasan role khusus (ADMIN/MANAGER) dan role user tidak sesuai
  if (to.meta.requiresAuth && to.meta.role && userRole !== to.meta.role) {
    const targetPath = getDashboardPath(userRole);
    if (to.path !== targetPath) {
      return next(targetPath);
    }
  }

  // 3. Jika user sudah login dan mencoba mengakses halaman /login secara manual
  if (to.path === '/login' && token && isAllowedRole) {
    const targetPath = getDashboardPath(userRole);
    return next(targetPath);
  }

  next();
});

export default router;
