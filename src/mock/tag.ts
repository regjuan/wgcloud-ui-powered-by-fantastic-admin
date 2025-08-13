import { faker } from '@faker-js/faker'
import type { MockMethod } from 'vite-plugin-mock'

const tags = Array.from({ length: 38 }).map(() => ({
  id: faker.string.uuid(),
  tagName: faker.commerce.department(),
  tagDesc: faker.lorem.sentence(),
  tagColor: faker.internet.color(),
  createTime: faker.date.past().toISOString().split('T')[0],
}))

export default [
  {
    url: '/tag/list',
    method: 'post',
    response: ({ body }) => {
      const { tagName, page = 1, pageSize = 10 } = body
      const filteredTags = tags.filter((tag) => {
        return tagName ? tag.tagName.includes(tagName) : true
      })
      const pageStart = (page - 1) * pageSize
      const pageEnd = page * pageSize
      const paginatedTags = filteredTags.slice(pageStart, pageEnd)
      return {
        status: 1,
        error: '',
        data: {
          page: {
            list: paginatedTags,
            total: filteredTags.length,
            pages: Math.ceil(filteredTags.length / pageSize),
          },
          tag: {
            tagName,
          },
        },
      }
    },
  },
  {
    url: '/tag/save',
    method: 'post',
    response: ({ body }) => {
      const { id, tagName, tagDesc, tagColor } = body
      if (id) {
        // 更新
        const index = tags.findIndex(tag => tag.id === id)
        if (index !== -1) {
          tags[index] = { ...tags[index], tagName, tagDesc, tagColor }
        }
      } else {
        // 新增
        tags.unshift({
          id: faker.string.uuid(),
          tagName,
          tagDesc,
          tagColor,
          createTime: new Date().toISOString().split('T')[0],
        })
      }
      return {
        status: 1,
        error: '',
        data: {
          result: 'success',
        },
      }
    },
  },
  {
    url: '/tag/del',
    method: 'delete',
    response: ({ query }) => {
      const { id } = query
      const idsToDelete = id.split(',')
      for (let i = tags.length - 1; i >= 0; i--) {
        if (idsToDelete.includes(tags[i].id)) {
          tags.splice(i, 1)
        }
      }
      return {
        status: 1,
        error: '',
        data: {
          result: 'success',
        },
      }
    },
  },
] as MockMethod[]
