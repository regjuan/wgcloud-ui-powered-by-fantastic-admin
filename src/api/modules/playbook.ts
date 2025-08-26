import api from '@/api/index'

export function getPlaybookList(params?: any) {
  return api.post('/playbook/list', params)
}

export function getPlaybookDetail(id: string) {
  return api.get(`/playbook/${id}`)
}

export function savePlaybook(data: any) {
  if (data.id) {
    return api.put(`/playbook/${data.id}`, data)
  }
  else {
    return api.post('/playbook', data)
  }
}

export function deletePlaybook(id: string) {
  return api.delete(`/playbook/${id}`)
}

export function executePlaybook(id: string, data: any) {
  return api.post(`/api/playbook/${id}/execute`, data)
}

export function getPlaybookExecution(executionId: string) {
  return api.get(`/api/playbook/execution/${executionId}`)
}

// DEPRECATED: This is the old history function, will be replaced by getPlaybookHistoryList
export function getPlaybookHistory(params?: any) {
  return api.get('/playbook/history', { params })
}

/**
 * 获取单个Playbook的历史执行列表
 * @param id Playbook ID
 */
export function getPlaybookHistoryList(id: string) {
  return api.get(`/playbook/${id}/history`)
}

/**
 * 获取单次执行的步骤详情
 * @param params { taskId: string, startTime: string }
 */
export function getPlaybookHistoryDetails(params: { taskId: string, startTime: string }) {
  return api.get('/playbook/history/details', { params })
}
