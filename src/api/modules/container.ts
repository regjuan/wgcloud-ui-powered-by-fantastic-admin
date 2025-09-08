import api from '@/api'

export function getContainerList(data: any) {
  return api.post('/container/list', data)
}
