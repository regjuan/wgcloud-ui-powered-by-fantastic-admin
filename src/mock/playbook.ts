import type { MockMethod } from 'vite-plugin-mock'
import { faker } from '@faker-js/faker'

const mockCommands = Array.from({ length: 10 }).map((_, i) => ({
  id: `cmd-${i + 1}`,
  cmdName: `基础操作-命令${i + 1}`,
}))

const playbooks = Array.from({ length: 15 }).map(() => {
  const taskStepList = faker.helpers.arrayElements(mockCommands, faker.number.int({ min: 1, max: 4 })).map((cmd, index) => ({
    stepName: `步骤${index + 1}: ${cmd.cmdName}`,
    commandId: cmd.id,
  }))

  return {
    id: faker.string.uuid(),
    playbookName: `${faker.word.adjective()}的${faker.word.noun()}预案`,
    playbookDesc: faker.lorem.sentence(),
    cronExpression: '0 0 * * * ?',
    isEnabled: faker.helpers.arrayElement([0, 1]),
    taskStepList,
    createTime: faker.date.past().toISOString().split('T')[0],
  }
})

export default [
  // POST /playbook/list (List)
  {
    url: '/playbook/list',
    method: 'post',
    response: ({ body }) => {
      const { playbookName, page = 1, pageSize = 10 } = body
      const pageAsNum = Number(page)
      const pageSizeAsNum = Number(pageSize)
      const filtered = playbooks.filter(p => playbookName ? p.playbookName.includes(playbookName) : true)
      const paginated = filtered.slice((pageAsNum - 1) * pageSizeAsNum, pageAsNum * pageSizeAsNum)

      return {
        code: 200,
        msg: 'success',
        data: {
          pageNum: pageAsNum,
          pageSize: pageSizeAsNum,
          size: paginated.length,
          startRow: (pageAsNum - 1) * pageSizeAsNum + 1,
          endRow: (pageAsNum - 1) * pageSizeAsNum + paginated.length,
          pages: Math.ceil(filtered.length / pageSizeAsNum),
          prePage: pageAsNum > 1 ? pageAsNum - 1 : 0,
          nextPage: pageAsNum < Math.ceil(filtered.length / pageSizeAsNum) ? pageAsNum + 1 : 0,
          isFirstPage: pageAsNum === 1,
          isLastPage: pageAsNum === Math.ceil(filtered.length / pageSizeAsNum),
          hasPreviousPage: pageAsNum > 1,
          hasNextPage: pageAsNum < Math.ceil(filtered.length / pageSizeAsNum),
          navigatePages: 8,
          navigatepageNums: [pageAsNum],
          total: filtered.length,
          list: paginated,
        },
      }
    },
  },

  // GET /playbook/{id} (Detail)
  {
    url: '/playbook/:id',
    method: 'get',
    response: ({ params }) => {
      const playbook = playbooks.find(p => p.id === params.id)
      if (!playbook) {
        return { code: 500, msg: '获取预案信息错误', data: null }
      }
      return {
        code: 200,
        msg: 'success',
        data: {
          playbook,
          allCommands: mockCommands,
          allTags: [],
        },
      }
    },
  },

  // POST /playbook (Create)
  {
    url: '/playbook',
    method: 'post',
    response: ({ body }) => {
      try {
        const newPlaybook = {
          id: faker.string.uuid(),
          ...body,
          createTime: new Date().toISOString().split('T')[0],
        }
        playbooks.unshift(newPlaybook)
        return { code: 200, msg: 'success' }
      }
      catch (error) {
        return { code: 500, msg: '保存预案错误' }
      }
    },
  },

  // PUT /playbook/{id} (Update)
  {
    url: '/playbook/:id',
    method: 'put',
    response: ({ params, body }) => {
      try {
        const index = playbooks.findIndex(p => p.id === params.id)
        if (index !== -1) {
          playbooks[index] = { ...playbooks[index], ...body, id: params.id }
          return { code: 200, msg: 'success' }
        }
        return { code: 500, msg: '更新预案错误' }
      }
      catch (error) {
        return { code: 500, msg: '更新预案错误' }
      }
    },
  },

  // DELETE /playbook/{id}
  {
    url: '/playbook/:id',
    method: 'delete',
    response: ({ params }) => {
      try {
        const ids = params.id.split(',')
        ids.forEach((id) => {
          const index = playbooks.findIndex(p => p.id === id)
          if (index !== -1) {
            playbooks.splice(index, 1)
          }
        })
        return { code: 200, msg: 'success' }
      }
      catch (error) {
        return { code: 500, msg: '删除预案错误' }
      }
    },
  },
] as MockMethod[]
