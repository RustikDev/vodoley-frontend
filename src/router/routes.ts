import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'categories', component: () => import('pages/CategoriesPage.vue') },
      { path: 'catalog', component: () => import('pages/CatalogPage.vue') },
      { path: 'product/:id', component: () => import('pages/ProductPage.vue') },
      { path: 'estimate', component: () => import('pages/EstimatePage.vue') },
      { path: 'favorites', component: () => import('pages/FavoritesPage.vue') },
      { path: 'brands', component: () => import('pages/BrandsPage.vue') },
      { path: 'brands/:slug', component: () => import('pages/BrandPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
    ],
  },

  {
    path: '/admin/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/AdminLoginPage.vue') }],
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/AdminDashboardPage.vue') },
      { path: 'units', component: () => import('pages/AdminUnitsPage.vue') },
      { path: 'categories', component: () => import('pages/AdminCategoriesPage.vue') },
      { path: 'brands', component: () => import('pages/AdminBrandsPage.vue') },
      { path: 'products', component: () => import('pages/AdminProductsPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;



