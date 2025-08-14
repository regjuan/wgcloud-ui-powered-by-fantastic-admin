import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/command',
  component: Layout,
  name: 'command',
  meta: {
    title: '指令库',
    icon: 'i-ri:terminal-box-line',
  },
  children: [
    {
      path: '',
      name: 'commandIndex',
      component: () => import('@/views/command/index.vue'),
      meta: {
        title: '指令库管理',
        menu: false,
        breadcrumb: false,
        activeMenu: '/command',
      },
    },
  ],
}

export default routes
