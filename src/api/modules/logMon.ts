import api from '@/api/index'

// 获取日志监控任务列表
export function getLogMonList(params?: any) {
  return api.get('/logMon/list', params)
}

// 保存日志监控任务
export function saveLogMon(data: any) {
  return api.post('/logMon/save', data)
}

// 获取日志监控任务详情
export function getLogMonDetail(params: any) {
  return api.get('/logMon/edit', params)
}

// 删除日志监控任务
export function deleteLogMon(id: string) {
  return api.delete(`/logMon/del/${id}`)
}

// 获取主机日志监控状态
export function getLogMonStatusByHost(params?: any) {
  return api.get('/logMon/statusByHost', params)
}

// 获取日志告警明细
export function getLogMonAlertDetails(params: any) {
  return api.get('/logMon/alertDetails', params)
}
