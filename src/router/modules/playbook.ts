import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/playbook',
  component: Layout,
  name: 'playbook',
  meta: {
    title: '预案管理',
    icon: 'i-ri:file-list-3-line',
  },
  children: [
    {
      path: '',
      name: 'playbookList',
      component: () => import('@/views/playbook/index.vue'),
      meta: {
        title: '预案管理',
        menu: false,
        breadcrumb: false,
        activeMenu: '/playbook',
      },
    },
    {
      path: 'editor',
      name: 'playbookAdd',
      component: () => import('@/views/playbook/editor.vue'),
      meta: {
        title: '新建预案',
        activeMenu: '/playbook',
        menu: false,
      },
    },
    {
      path: 'editor/:id',
      name: 'playbookEdit',
      component: () => import('@/views/playbook/editor.vue'),
      meta: {
        title: '编辑预案',
        activeMenu: '/playbook',
        menu: false,
      },
    },
    {
      path: 'execution/:id',
      name: 'playbookExecution',
      component: () => import('@/views/playbook/execution.vue'),
      meta: {
        title: '执行报告',
        activeMenu: '/playbook',
        menu: false,
      },
    },
    {
      path: 'history',
      name: 'playbookHistory',
      component: () => import('@/views/playbook/history.vue'),
      meta: {
        title: '历史记录',
        activeMenu: '/playbook',
        menu: false,
      },
    },
  ],
}

export default routes
