import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/basic',
    name: 'Basic',
    component: () => import('../views/BasicSettings.vue')
  },
  {
    path: '/supply',
    name: 'Supply',
    component: () => import('../views/SupplyChain.vue')
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Inventory.vue')
  },
  {
    path: '/production',
    name: 'Production',
    component: () => import('../views/Production.vue')
  },
  {
    path: '/sales',
    name: 'Sales',
    component: () => import('../views/Sales.vue')
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('../views/Finance.vue')
  },
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('../views/Personnel.vue')
  },
  {
    path: '/quality',
    name: 'Quality',
    component: () => import('../views/Quality.vue')
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('../views/Analysis.vue')
  },
  {
    path: '/ai-demand',
    name: 'AIDemand',
    component: () => import('../views/AIDemandForecast.vue')
  },
  {
    path: '/ai-menu',
    name: 'AIMenu',
    component: () => import('../views/AIMenuPlanning.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router