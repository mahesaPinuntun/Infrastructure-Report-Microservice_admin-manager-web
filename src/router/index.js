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

  // 1. Jika rute membutuhkan auth tetapi token/user tidak valid
  if (to.meta.requiresAuth && (!token || !userRole)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return next('/login');
  }

  // 2. Jika rute memiliki batasan role tertentu dan role user tidak sesuai
  if (to.meta.requiresAuth && to.meta.role && userRole !== to.meta.role) {
    const targetPath = userRole === 'ADMIN' ? '/admin' : '/manager';
    // Cegah infinite loop jika tujuan rute saat ini sudah sama dengan targetPath
    if (to.path !== targetPath) {
      return next(targetPath);
    }
  }

  // 3. Jika user sudah login dan mencoba mengakses halaman /login secara manual
  if (to.path === '/login' && token && userRole) {
    const targetPath = userRole === 'ADMIN' ? '/admin' : '/manager';
    return next(targetPath);
  }

  next();
});

export default router;
