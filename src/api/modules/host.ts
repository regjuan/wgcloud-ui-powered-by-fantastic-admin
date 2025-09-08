import api from '@/api/index'

// 获取主机列表
export function getHostList(params: any) {
  return api.get('/dash/systemInfoList', { params })
}

// 删除主机
export function deleteHost(id: string) {
  const params = { id }
  return api.post('/dash/del', params)
}

// 保存主机备注
export function saveHostRemark(data: any) {
  return api.post('/host/save', data)
}

// 获取主机详情
export function getHostDetail(id: string) {
  const params = { id }
  return api.get('/dash/detail', { params })
}

// 获取主机图表数据
export function getHostChartData(params: any) {
  return api.get('/dash/chart', { params })
}

// 更新主机的标签
export function updateHostTags(data: { id: string, tags: string }) {
  return api.post('/dash/updateTags', data)
}

// 根据主机名获取资源信息
export function getResourceByHostname(hostname: string) {
  const params = { hostname }
  return api.get('/dash/resourceByHostname', { params })
}
