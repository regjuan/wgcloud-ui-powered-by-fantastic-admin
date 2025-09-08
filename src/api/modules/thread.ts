import api from '@/api/index'

// 获取线程监控任务列表
export function getThreadList(params: any) {
  return api.get('/threadMon/list', { params })
}

// 删除线程监控任务
export function deleteThread(id: string) {
  return api.delete(`/threadMon/del/${id}`)
}

// 获取线程监控任务详情
export function getThreadTask(id: string) {
  const params = { id }
  return api.get('/threadMon/edit', { params })
}

// 保存线程监控任务
export function saveThreadTask(data: any) {
  return api.post('/threadMon/save', data)
}

// 获取线程监控详情列表
export function getThreadDetailList(params: any) {
  return api.get('/threadMon/detail/list', { params })
}