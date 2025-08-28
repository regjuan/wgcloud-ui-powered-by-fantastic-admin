import type { MockMethod } from 'vite-plugin-mock'
import { faker } from '@faker-js/faker'

// Main command data store
const commands = Array.from({ length: 25 }).map(() => {
  return {
    id: faker.string.uuid(),
    cmdName: `CMD-${faker.hacker.verb()}-${faker.hacker.noun()}`,
    cmdContent: `#!/bin/bash\n${faker.hacker.phrase()}`,
    commandType: 'Shell',
    timeout: faker.helpers.arrayElement([30, 60, 120, 300]),
    remark: faker.lorem.sentence(),
    createTime: faker.date.past().toISOString(),
  }
})

export default [
  // 1. Get command list
  {
    url: '/command/list',
    method: 'post',
    response: ({ body }) => {
      const { cmdName, page = 1, pageSize = 10 } = body
      const pageAsNumber = Number(page)
      const pageSizeAsNumber = Number(pageSize)

      let filteredCommands = commands
      if (cmdName) {
        filteredCommands = filteredCommands.filter(cmd => cmd.cmdName.toLowerCase().includes(cmdName.toLowerCase()))
      }

      const pageStart = (pageAsNumber - 1) * pageSizeAsNumber
      const pageEnd = pageAsNumber * pageSizeAsNumber
      const paginatedCommands = filteredCommands.slice(pageStart, pageEnd)

      return {
        code: 200,
        msg: 'success',
        data: {
          list: paginatedCommands,
          total: filteredCommands.length,
        },
      }
    },
  },

  // 2. Get command for edit
  {
    url: '/command/info',
    method: 'post',
    response: ({ body }) => {
      const { id } = body
      let command = {}
      if (id) {
        command = commands.find(cmd => cmd.id === id) || {}
      }
      return {
        code: 200,
        msg: 'success',
        data: {
          command,
        },
      }
    },
  },

  // 3. Save command
  {
    url: '/command/save',
    method: 'post',
    response: ({ body }) => {
      const { id } = body
      if (id) {
        // Update
        const index = commands.findIndex(cmd => cmd.id === id)
        if (index !== -1) {
          commands[index] = { ...commands[index], ...body }
        }
      }
      else {
        // Create
        const newCommand = {
          ...body,
          id: faker.string.uuid(),
          createTime: new Date().toISOString(),
        }
        commands.unshift(newCommand)
      }
      return {
        code: 200,
        msg: 'success',
      }
    },
  },

  // 4. Delete command
  {
    url: '/command/del',
    method: 'post',
    response: ({ body }) => {
      const { id } = body
      const idsToDelete = id.split(',')
      for (let i = commands.length - 1; i >= 0; i--) {
        if (idsToDelete.includes(commands[i].id)) {
          commands.splice(i, 1)
        }
      }
      return {
        code: 200,
        msg: 'success',
      }
    },
  },
] as MockMethod[]
