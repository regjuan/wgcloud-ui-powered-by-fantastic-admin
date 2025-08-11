import api from '@/api'

// 定义 API 接口类型
interface TableAPI {
  list: (params?: any) => Promise<any>
  delete: (data: { id: number }) => Promise<any>
}

// 创建 API 实例
const tableApi: TableAPI = {
  list: params => api.get('/table/list', { params }),
  delete: data => api.post('/table/delete', data),
}

export default tableApi
