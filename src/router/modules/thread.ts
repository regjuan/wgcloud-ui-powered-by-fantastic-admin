import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/thread',
  component: Layout,
  name: 'thread',
  meta: {
    title: '线程监控',
    icon: 'i-ri:window-line',
  },
  children: [
    {
      path: 'list',
      name: 'threadList',
      component: () => import('@/views/thread/list.vue'),
      meta: {
        title: '任务管理',
      },
    },
    {
      path: 'detail',
      name: 'threadDetail',
      component: () => import('@/views/thread/detail.vue'),
      meta: {
        title: '监控详情',
      },
    },
    {
      path: 'add',
      name: 'threadAdd',
      component: () => import('@/views/thread/edit.vue'),
      meta: {
        title: '新建任务',
        menu: false,
        activeMenu: '/thread/list',
      },
    },
    {
      path: 'edit/:id',
      name: 'threadEdit',
      component: () => import('@/views/thread/edit.vue'),
      meta: {
        title: '编辑任务',
        menu: false,
        activeMenu: '/thread/list',
      },
    },
  ],
}

export default routes
