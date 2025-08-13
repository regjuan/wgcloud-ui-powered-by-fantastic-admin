import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/tag',
  component: Layout,
  name: 'tag',
  meta: {
    title: '标签管理',
    icon: 'i-ri:price-tag-3-line',
  },
  children: [
    {
      path: '',
      name: 'tagIndex',
      component: () => import('@/views/tag/index.vue'),
      meta: {
        title: '标签管理',
        // 作为一次菜单跳转 而不是二级功能
        menu: false,
        breadcrumb: false,
        activeMenu: '/tag',
      },
    },
  ],
}

export default routes
