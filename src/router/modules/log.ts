import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw
  = {
    path: '/log',
    component: Layout,
    redirect: '/log/task',
    name: 'Log',
    meta: {
      title: '日志监控',
      icon: 'ep:monitor',
    },
    children: [
      {
        path: 'task',
        name: 'LogTask',
        component: () => import('@/views/log/task/index.vue'),
        meta: {
          title: '监控任务管理',
        },
      },
      {
        path: 'status',
        name: 'LogStatus',
        component: () => import('@/views/log/status/index.vue'),
        meta: {
          title: '日志监控归档',
        },
      },
    ],
  }

export default routes
