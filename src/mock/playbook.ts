import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

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
  // GET /playbook (List)
  {
    url: '/api/playbook',
    method: 'get',
    response: ({ query }) => {
      const { playbookName, page = 1, pageSize = 10 } = query
      const pageAsNum = Number(page)
      const pageSizeAsNum = Number(pageSize)
      const filtered = playbooks.filter(p => playbookName ? p.playbookName.includes(playbookName) : true)
      const paginated = filtered.slice((pageAsNum - 1) * pageSizeAsNum, pageAsNum * pageSizeAsNum)
      return { code: 200, message: 'Success', data: { list: paginated, total: filtered.length } }
    },
  },

  // GET /playbook/{id} (Detail)
  {
    url: '/api/playbook/:id',
    method: 'get',
    response: ({ params }) => {
      const playbook = playbooks.find(p => p.id === params.id)
      if (!playbook) {
        return { code: 404, message: 'Not Found', data: null }
      }
      return { code: 200, message: 'Success', data: playbook }
    },
  },

  // POST /playbook (Create)
  {
    url: '/api/playbook',
    method: 'post',
    response: ({ body }) => {
      const newPlaybook = {
        id: faker.string.uuid(),
        ...body,
        createTime: new Date().toISOString().split('T')[0],
      }
      playbooks.unshift(newPlaybook)
      return { code: 200, message: 'Created', data: newPlaybook }
    },
  },

  // PUT /playbook/{id} (Update)
  {
    url: '/api/playbook/:id',
    method: 'put',
    response: ({ params, body }) => {
      const index = playbooks.findIndex(p => p.id === params.id)
      if (index !== -1) {
        playbooks[index] = { ...playbooks[index], ...body }
        return { code: 200, message: 'Updated', data: playbooks[index] }
      }
      return { code: 404, message: 'Not Found', data: null }
    },
  },

  // DELETE /playbook/{id}
  {
    url: '/api/playbook/:id',
    method: 'delete',
    response: ({ params }) => {
      const index = playbooks.findIndex(p => p.id === params.id)
      if (index !== -1) {
        playbooks.splice(index, 1)
        return { code: 200, message: 'Deleted', data: { success: true } }
      }
      return { code: 404, message: 'Not Found', data: null }
    },
  },
] as MockMethod[]
