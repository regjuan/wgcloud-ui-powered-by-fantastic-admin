import type { Menu } from '#/menu'

const menu: Menu.recordRaw = {
  path: '/thread',
  meta: {
    title: '线程监控',
    icon: 'i-icon-park-outline:thread',
  },
  children: [
    {
      path: '/thread/list',
      meta: {
        title: '任务管理',
      },
    },
  ],
}

export default menu