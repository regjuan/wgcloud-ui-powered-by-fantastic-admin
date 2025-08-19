import type { MockMethod } from 'vite-plugin-mock'
import { faker } from '@faker-js/faker'

const tags = Array.from({ length: 38 }).map(() => ({
  id: faker.string.uuid(),
  tagName: faker.commerce.department(),
  tagDesc: faker.lorem.sentence(),
  tagColor: faker.color.rgb(),
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
        code: 200,
        message: 'Success',
        data: {
          list: paginatedTags,
          total: filteredTags.length,
        },
      }
    },
  },
  {
    url: '/tag/save',
    method: 'post',
    response: ({ body }) => {
      const { id, tagName, tagDesc, tagColor } = body
      let savedTag
      if (id) {
        // 更新
        const index = tags.findIndex(tag => tag.id === id)
        if (index !== -1) {
          tags[index] = { ...tags[index], tagName, tagDesc, tagColor }
          savedTag = tags[index]
        }
      }
      else {
        // 新增
        savedTag = {
          id: faker.string.uuid(),
          tagName,
          tagDesc,
          tagColor,
          createTime: new Date().toISOString().split('T')[0],
        }
        tags.unshift(savedTag)
      }
      return {
        code: 200,
        message: id ? 'Tag updated successfully' : 'Tag created successfully',
        data: savedTag,
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
        code: 200,
        message: 'Tags deleted successfully',
        data: { success: true },
      }
    },
  },
] as MockMethod[]
