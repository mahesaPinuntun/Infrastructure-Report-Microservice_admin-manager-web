import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { 
    path: '/', 
    name: 'LandingPage',
    component: () => import('../pages/LandingPage.vue') 
  },
  { 
    path: '/visit', 
    name: 'VisitPage',
    component: () => import('../pages/VisitPage.vue') 
  },
  { 
    path: '/workflow', 
    name: 'WorkflowPage',
    component: () => import('../pages/WorkflowPage.vue') 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('../pages/LoginView.vue') 
  },
  // ROUTE BARU: Halaman Registrasi Admin
  { 
    path: '/register-admin', 
    name: 'AdminRegister',
    component: () => import('../pages/AdminRegister.vue') 
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
    redirect: '/' 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
