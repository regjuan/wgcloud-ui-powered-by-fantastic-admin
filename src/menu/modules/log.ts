import type { Menu } from '#/menu'

const menu: Menu.recordRaw = {
  path: '/log',
  meta: {
    title: '日志监控',
    icon: 'ep:monitor',
  },
  children: [
    {
      path: '/log/task',
      meta: {
        title: '任务管理',
      },
    },
    {
      path: '/log/status',
      meta: {
        title: '主机状态',
      },
    },
  ],
}

export default menu
