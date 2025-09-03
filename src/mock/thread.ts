import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import type { ThreadMon } from '@/api/modules/thread'

const threadMonList: ThreadMon[] = [
  {
    id: '1',
    taskName: 'Monitor WebServer Threads',
    processKeyword: 'nginx',
    active: '1',
    targetTags: '[{"label":"web","value":"web"}]',
    alertRules: '{"maxTotalThreads":500,"maxBlockedThreads":50}',
    createTime: '2025-08-29 10:00:00',
  },
  {
    id: '2',
    taskName: 'Monitor DB Threads',
    processKeyword: 'mysql',
    active: '1',
    targetTags: '[{"label":"db","value":"db"}]',
    alertRules: '{"maxTotalThreads":200,"maxBlockedThreads":20}',
    createTime: '2025-08-29 10:00:00',
  },
]

export default defineFakeRoute([
  {
    url: '/api/threadMon/list',
    method: 'get',
    response: ({ query }) => {
      const { page = '1', pageSize = '10' } = query
      const start = (Number(page) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = threadMonList.slice(start, end)
      return {
        code: 200,
        msg: 'success',
        data: {
          total: threadMonList.length,
          list,
          pageNum: Number(page),
          pageSize: Number(pageSize),
          pages: Math.ceil(threadMonList.length / Number(pageSize)),
        },
      }
    },
  },
  {
    url: '/api/threadMon/save',
    method: 'post',
    response: ({ body }) => {
      const { id } = body
      if (id) {
        const index = threadMonList.findIndex(item => item.id === id)
        threadMonList[index] = { ...threadMonList[index], ...body }
      }
      else {
        threadMonList.push({ ...body, id: String(threadMonList.length + 1), createTime: '2025-08-29 10:00:00' })
      }
      return {
        code: 200,
        msg: 'success',
        data: null,
      }
    },
  },
  {
    url: '/api/threadMon/edit',
    method: 'get',
    response: ({ query }) => {
      const { id } = query
      const item = threadMonList.find(item => item.id === id)
      return {
        code: 200,
        msg: 'success',
        data: item,
      }
    },
  },
  {
    url: '/api/threadMon/del/:id',
    method: 'delete',
    response: ({ params }) => {
      const { id } = params
      const ids = id.split(',')
      ids.forEach((i) => {
        const index = threadMonList.findIndex(item => item.id === i)
        threadMonList.splice(index, 1)
      })
      return {
        code: 200,
        msg: 'success',
        data: null,
      }
    },
  },
  {
    url: '/api/threadMon/view',
    method: 'get',
    response: () => {
      const data = []
      for (let i = 0; i < 10; i++) {
        data.push({
          id: String(i),
          threadMonId: '1',
          threadsCount: String(Math.floor(Math.random() * 100)),
          createTime: `2025-08-29 11:${i * 5}:00`,
        })
      }
      return {
        code: 200,
        msg: 'success',
        data,
      }
    },
  },
])
