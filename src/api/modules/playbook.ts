import api from '@/api/index'

export function getPlaybookList(params?: any) {
  return api.get('/playbook', { params })
}

export function getPlaybookDetail(id: string) {
  return api.get(`/api/playbook/${id}`)
}

export function savePlaybook(data: any) {
  if (data.id) {
    return api.put(`/api/playbook/${data.id}`, data)
  }
  else {
    return api.post('/playbook', data)
  }
}

export function deletePlaybook(id: string) {
  return api.delete(`/api/playbook/${id}`)
}

export function executePlaybook(id: string, data: any) {
  return api.post(`/api/playbook/${id}/execute`, data)
}

export function getPlaybookExecution(executionId: string) {
  return api.get(`/api/playbook/execution/${executionId}`)
}

export function getPlaybookHistory(params?: any) {
  return api.get('/playbook/history', { params })
}
