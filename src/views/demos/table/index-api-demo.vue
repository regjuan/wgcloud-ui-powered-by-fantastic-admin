<script setup>
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import tableApi from '@/api/modules/table'
import CommonTable from '@/components/CommonTable/index.vue'

defineOptions({
  name: 'MockTableDemo',
})

const listData = ref([])
const loading = ref(false)

const tableOptions = ref([
  { label: '姓名', prop: 'name' },
  { label: '年龄', prop: 'age' },
  {
    label: '创建日期',
    prop: 'createDate',
    width: '180',
    formatter: value => value ? new Date(value).toLocaleString() : '-',
  },
  { label: '操作', prop: 'action', width: '150' },
])

async function fetchData() {
  try {
    loading.value = true
    const res = await tableApi.list()
    listData.value = res.data.list
  }
  catch (error) {
    toast.error('数据加载失败')
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

function handleEdit(row) {
  alert(`正在编辑 [${row.name}]`)
}

async function handleDelete(row) {
  try {
    const res = await tableApi.delete({ id: row.id })
    toast.success(`删除 [${row.name}] 成功`)
    console.log(res)
  }
  catch (error) {
    toast.error(`删除 [${row.name}] 失败`)
    console.error(error)
  }
}
</script>

<template>
  <div class="absolute-container">
    <FaPageHeader title="通用表格 - API请求演示" class="mb-0" />
    <FaPageMain class="flex-1 overflow-auto" main-class="flex-1 flex flex-col overflow-auto">
      <CommonTable :list="listData" :options="tableOptions" :loading="loading" height="100%">
        <template #action="{ row }">
          <div class="flex gap-2">
            <FaButton type="text" @click="handleEdit(row)">
              编辑
            </FaButton>
            <FaButton type="text" variant="destructive" @click="handleDelete(row)">
              删除
            </FaButton>
          </div>
        </template>
      </CommonTable>
    </FaPageMain>
  </div>
</template>

<style scoped>
.absolute-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
