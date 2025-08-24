import api from '@/api/index'

/**
 * 1. 获取指令列表
 * @param params - { cmdName?: string, page?: number, pageSize?: number }
 */
export function getCommandList(params: any) {
  return api.post('/command/list', params)
}

/**
 * 2. 获取待编辑的指令信息
 * @param id - 指令ID，可选
 */
export function getCommandInfo(id?: string) {
  return api.get('/command/info', {
    params: { id },
  })
}

/**
 * 3. 保存（新增或更新）指令
 * @param data - Command 实体对象
 */
export function saveCommand(data: any) {
  return api.post('/command/save', data)
}

/**
 * 4. 删除指令
 * @param id - 一个或多个指令的ID，逗号分隔
 */
export function deleteCommand(id: string) {
  return api.delete(`/command/${id}`)
}

/**
 * 克隆指令（兼容旧版UI调用）
 * @param id - 指令ID
 */
export function cloneCommand(id: string) {
  console.warn('克隆指令', id)
  // 添加参数验证
  if (!id) {
    return Promise.reject(new Error('指令ID不能为空'))
  }
  // 注意：新的 getCommandInfo 接口返回的数据结构为 { command: {}, allTags: [] }
  // 旧的UI代码可能需要调整来正确处理这个返回结构
  return getCommandInfo(id)
}
