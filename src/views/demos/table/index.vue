<template>
  <div class="absolute-container">
    <FaPageHeader title="通用表格 - 高度自适应" class="mb-0" />
    <FaPageMain class="flex-1 overflow-auto" main-class="flex-1 flex flex-col overflow-auto">
      <CommonTable :list="listData" :options="tableOptions" height="100%">
        <!-- 操作列使用插槽 -->
        <template #action="{ row }">
          <div class="flex gap-2">
            <FaButton type="text" @click="handleEdit(row)">编辑</FaButton>
            <FaButton type="text" @click="handleDelete(row)" variant="destructive" >删除</FaButton>
          </div>
        </template>
      </CommonTable>
    </FaPageMain>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CommonTable from '@/components/CommonTable/index.vue'

defineOptions({
  name: 'TableAutoHeightDemo',
})

const listData = ref([
  { id: 1, name: '张三', age: 30, createDate: '2023-01-15T12:30:00' },
  { id: 2, name: '李四', age: 25, createDate: '2023-02-20T18:00:00' },
  { id: 3, name: '王五', age: 42, createDate: '2023-03-10T09:15:00' },
  { id: 4, name: '赵六', age: 35, createDate: '2023-04-01T10:00:00' },
  { id: 5, name: '孙七', age: 28, createDate: '2023-05-05T14:20:00' },
  { id: 6, name: '周八', age: 50, createDate: '2023-06-11T16:45:00' },
  { id: 7, name: '吴九', age: 22, createDate: '2023-07-21T11:05:00' },
  { id: 8, name: '郑十', age: 31, createDate: '2023-08-30T22:50:00' },
  { id: 9, name: '冯十一', age: 38, createDate: '2023-09-18T08:30:00' },
  { id: 10, name: '陈十二', age: 45, createDate: '2023-10-25T19:00:00' },
]);

const tableOptions = ref([
  { label: '姓名', prop: 'name' },
  { label: '年龄', prop: 'age' },
  {
    label: '创建日期',
    prop: 'createDate',
    width: '180',
    formatter: (value) => value ? new Date(value).toLocaleString() : '-'
  },
  { label: '操作', prop: 'action', width: '150' }
]);

const handleEdit = (row) => {
  alert(`正在编辑 [${row.name}]`)
}

const handleDelete = (row) => {
  alert(`正在删除 [${row.name}]`)
}
</script>

<style scoped>
.absolute-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
