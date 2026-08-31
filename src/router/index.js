import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('../pages/LoginView.vue') 
  },
  { 
    path: '/admin', 
    name: 'AdminDashboard',
    component: () => import('../pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  { 
    path: '/manager', 
    name: 'ManagerDashboard',
    component: () => import('../pages/ManagerDashboard.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  { 
    path: '/reports', 
    name: 'ReportsList',
    component: () => import('../pages/ReportsList.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER'] }
  },
  { 
    path: '/reports/:id', 
    name: 'ReportDetail',
    component: () => import('../pages/ReportDetail.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER'] }
  },
  { 
    path: '/work-orders', 
    name: 'WorkOrders',
    component: () => import('../pages/WorkOrders.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER'] }
  },
  { 
    path: '/users', 
    name: 'UsersManagement',
    component: () => import('../pages/UsersManagement.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/login' 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard (Tahan pergerakan berulang/glitch)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error('Gagal membaca data user dari storage:', err);
    user = null;
  }

  const userRole = user?.role?.toUpperCase();
  const isAllowedRole = ['ADMIN', 'MANAGER'].includes(userRole);
  const getDashboardPath = (role) => (role === 'ADMIN' ? '/admin' : '/manager');

  // 1. Jika pengguna belum login dan mencoba mengakses rute terproteksi
  if (to.meta.requiresAuth && (!token || !userRole || !isAllowedRole)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return next({ path: '/login', replace: true });
  }

  // 2. Jika rute khusus single role (ADMIN/MANAGER) dan role tidak sesuai
  if (to.meta.requiresAuth && to.meta.role && userRole !== to.meta.role) {
    const targetPath = getDashboardPath(userRole);
    if (to.path !== targetPath) {
      return next({ path: targetPath, replace: true });
    }
  }

  // 3. Jika rute mendukung multiple roles
  if (to.meta.requiresAuth && to.meta.roles && !to.meta.roles.includes(userRole)) {
    const targetPath = getDashboardPath(userRole);
    if (to.path !== targetPath) {
      return next({ path: targetPath, replace: true });
    }
  }

  // 4. Jika pengguna sudah login dan mencoba mengakses /login secara manual
  if (to.path === '/login' && token && isAllowedRole) {
    const targetPath = getDashboardPath(userRole);
    if (from.path !== targetPath) {
      return next({ path: targetPath, replace: true });
    }
  }

  next();
});

export default router;
