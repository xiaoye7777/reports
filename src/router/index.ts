import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/create-report'
    },
    {
      path: '/create-report',
      component: () => import('@/createReport/index.vue')
    }
  ]
})

export default router
