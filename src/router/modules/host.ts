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
    icon: 'ep:monitor',
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
    {
      path: 'detail/:hostname',
      name: 'hostDetail',
      component: () => import('@/views/host/detail.vue'),
      meta: {
        title: '主机详情',
        menu: false,
        breadcrumb: true,
        activeMenu: '/host',
      },
    },
    {
      path: 'container/:hostId',
      name: 'hostContainer',
      component: () => import('@/views/host/container.vue'),
      meta: {
        title: '容器列表',
        menu: false,
        breadcrumb: true,
        activeMenu: '/host',
      },
    },
  ],
}

export default routes
