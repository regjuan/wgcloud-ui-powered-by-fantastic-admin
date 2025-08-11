import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/table/list',
    method: 'get',
    response: () => {
      return {
        status: 1,
        error: '',
        data: {
          list: [
            { id: 1, name: '张三 (来自后端)', age: 30, createDate: '2023-01-15T12:30:00' },
            { id: 2, name: '李四 (来自后端)', age: 25, createDate: '2023-02-20T18:00:00' },
            { id: 3, name: '王五 (来自后端)', age: 42, createDate: '2023-03-10T09:15:00' },
            { id: 4, name: '赵六 (来自后端)', age: 35, createDate: '2023-04-01T10:00:00' },
            { id: 5, name: '孙七 (来自后端)', age: 28, createDate: '2023-05-05T14:20:00' },
            { id: 6, name: '周八 (来自后端)', age: 50, createDate: '2023-06-11T16:45:00' },
            { id: 7, name: '吴九 (来自后端)', age: 22, createDate: '2023-07-21T11:05:00' },
            { id: 8, name: '郑十 (来自后端)', age: 31, createDate: '2023-08-30T22:50:00' },
            { id: 9, name: '冯十一 (来自后端)', age: 38, createDate: '2023-09-18T08:30:00' },
            { id: 10, name: '陈十二 (来自后端)', age: 45, createDate: '2023-10-25T19:00:00' },
          ],
        },
      }
    },
  },
  {
    url: '/table/delete',
    method: 'post',
    response: ({ body }) => {
      console.log('接收到的删除ID:', body.id)
      return {
        status: 1,
        error: '',
        data: '删除成功！',
      }
    },
  },
] as MockMethod[]
