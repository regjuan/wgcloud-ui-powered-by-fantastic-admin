import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/demos',
  component: Layout,
  name: 'demos',
  meta: {
    title: '开发演示',
    icon: 'i-carbon:application-web',
  },
  children: [
    {
      path: 'table',
      name: 'demosTable',
      component: () => import('@/views/demos/table/index.vue'),
      meta: {
        title: '通用表格',
      },
    },
    {
      path: 'apiTable',
      name: 'mockTableDemo',
      component: () => import('@/views/demos/table/index-api-demo.vue'),
      meta: {
        title: 'mock测试',
      },
    },
  ],
}

export default routes
