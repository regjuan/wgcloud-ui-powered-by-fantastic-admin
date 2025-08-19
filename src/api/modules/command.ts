import api from '@/api/index'

// 获取指令列表
export function getCommandList(params: any) {
  return api.get('/command', {
    params,
    retry: true, // 启用重试
  })
}

// 获取指令详情
export function getCommandDetail(id: string) {
  return api.get(`/api/command/${id}`)
}

// 保存指令（新增/编辑）
export function saveCommand(data: any) {
  if (data.id) {
    return api.put(`/api/command/${data.id}`, data)
  }
  else {
    return api.post('/command', data)
  }
}

// 删除指令
export function deleteCommand(id: string) {
  return api.delete(`/api/command/${id}`)
}

// 克隆指令（本质是获取详情，用于预填表单）
export function cloneCommand(id: string) {
  return getCommandDetail(id)
}

