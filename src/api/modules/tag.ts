import api from '../index'

interface Tag {
  id?: string
  tagName: string
  tagDesc?: string
  tagColor?: string
  createTime?: string
}

interface TagListParams {
  tagName?: string
  page: number
  pageSize: number
}

export function getTagList(data: TagListParams) {
  return api.post('/tag/list', data)
}

export function saveTag(data: Tag) {
  return api.post('/tag/save', data)
}

export function deleteTag(id: string) {
  return api.delete(`/tag/del?id=${id}`)
}
