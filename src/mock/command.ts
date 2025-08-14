import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

// Mock tags data for association
const mockTags = [
  { id: 'tag-1', tagName: 'Linux' },
  { id: 'tag-2', tagName: 'Windows' },
  { id: 'tag-3', tagName: 'Database' },
  { id: 'tag-4', tagName: 'Web-Server' },
]

const commands = Array.from({ length: 25 }).map((_, index) => {
  const associatedTags = faker.helpers.arrayElements(mockTags, faker.number.int({ min: 1, max: 2 }))
  return {
    id: faker.string.uuid(),
    cmdName: `Command-${faker.hacker.verb()}-${faker.hacker.noun()}`,
    cmdContent: `#!/bin/bash
# Command: ${index + 1}
${faker.hacker.phrase()}`,
    cmdType: 'Shell',
    timeout: faker.helpers.arrayElement([30, 60, 120, 300]),
    tags: associatedTags,
    tagIds: associatedTags.map(t => t.id),
    createTime: faker.date.past().toISOString().split('T')[0],
  }
})

export default [
  // Get command list
  {
    url: '/api/command',
    method: 'get',
    response: ({ query }) => {
      const { cmdName, tags, page = 1, pageSize = 10 } = query
      const pageAsNumber = Number(page)
      const pageSizeAsNumber = Number(pageSize)

      let filteredCommands = commands
      if (cmdName) {
        filteredCommands = filteredCommands.filter(cmd => cmd.cmdName.toLowerCase().includes(cmdName.toLowerCase()))
      }
      if (tags) {
        const tagIds = tags.split(',')
        filteredCommands = filteredCommands.filter(cmd => cmd.tagIds.some(tagId => tagIds.includes(tagId)))
      }

      const pageStart = (pageAsNumber - 1) * pageSizeAsNumber
      const pageEnd = pageAsNumber * pageSizeAsNumber
      const paginatedCommands = filteredCommands.slice(pageStart, pageEnd)

      return {
        code: 200,
        message: 'Success',
        data: {
          list: paginatedCommands,
          total: filteredCommands.length,
        },
      }
    },
  },
  // Get single command
  {
    url: '/api/command/:id',
    method: 'get',
    response: ({ params }) => {
      const command = commands.find(cmd => cmd.id === params.id)
      if (command) {
        return {
          code: 200,
          message: 'Success',
          data: command,
        }
      }
      else {
        return {
          code: 404,
          message: 'Command not found',
          data: null,
        }
      }
    },
  },
  // Create command
  {
    url: '/api/command',
    method: 'post',
    response: ({ body }) => {
      const newCommand = {
        id: faker.string.uuid(),
        ...body,
        tags: mockTags.filter(t => body.tagIds.includes(t.id)),
        createTime: new Date().toISOString().split('T')[0],
      }
      commands.unshift(newCommand)
      return {
        code: 200,
        message: 'Command created successfully',
        data: newCommand,
      }
    },
  },
  // Update command
  {
    url: '/api/command/:id',
    method: 'put',
    response: ({ params, body }) => {
      const index = commands.findIndex(cmd => cmd.id === params.id)
      if (index !== -1) {
        commands[index] = {
          ...commands[index],
          ...body,
          tags: mockTags.filter(t => body.tagIds.includes(t.id)),
        }
        return {
          code: 200,
          message: 'Command updated successfully',
          data: commands[index],
        }
      }
      else {
        return {
          code: 404,
          message: 'Command not found',
          data: null,
        }
      }
    },
  },
  // Delete command
  {
    url: '/api/command/:id',
    method: 'delete',
    response: ({ params }) => {
      const index = commands.findIndex(cmd => cmd.id === params.id)
      if (index !== -1) {
        commands.splice(index, 1)
        return {
          code: 200,
          message: 'Command deleted successfully',
          data: { success: true },
        }
      }
      else {
        return {
          code: 404,
          message: 'Command not found',
          data: null,
        }
      }
    },
  },
  // Execute command
  {
    url: '/api/command/:id/execute',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: 'Execution started',
        data: {
          executionId: `exec-${faker.string.alphanumeric(10)}`,
        },
      }
    },
  },
  // Get execution result
  {
    url: '/api/command/execution/:executionId',
    method: 'get',
    response: () => {
      const status = faker.helpers.arrayElement(['RUNNING', 'SUCCESS', 'FAILED'])
      return {
        code: 200,
        message: 'Success',
        data: {
          status,
          results: [
            {
              host: 'host-1',
              stdout: status === 'RUNNING' ? 'Running...' : faker.lorem.sentence(),
              stderr: status === 'FAILED' ? 'Error: command failed' : '',
            },
            {
              host: 'host-2',
              stdout: status === 'RUNNING' ? 'Running...' : faker.lorem.sentence(),
              stderr: '',
            },
          ],
        },
      }
    },
  },
] as MockMethod[]
