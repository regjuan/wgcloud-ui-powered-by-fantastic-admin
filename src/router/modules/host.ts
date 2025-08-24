import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/host',
  component: Layout,
  name: 'host',
  meta: {
    title: '主机管理',
    icon: 'i-ri:price-tag-3-line',
  },
  children: [
    {
      path: '',
      name: 'hostIndex',
      component: () => import('@/views/host/index.vue'),
      meta: {
        title: '主机管理',
        // 作为一次菜单跳转 而不是二级功能
        menu: false,
        breadcrumb: false,
        activeMenu: '/host',
      },
    },
  ],
}

export default routes
