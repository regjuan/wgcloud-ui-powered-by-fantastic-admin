import api from '@/api/index'

// 获取标签列表
export function getTagList(params?: any) {
  return api.post('/tag/list', params)
}

// 保存标签
export function saveTag(data: any) {
  return api.post('/tag/save', data)
}

// 更新标签
export function updateTag(id: string, data: any) {
  return api.put(`/tag/${id}`, data)
}

// 删除标签
export function deleteTag(id: string) {
  return api.delete(`/tag/${id}`)
}
